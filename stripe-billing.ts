/**
 * stripe-billing.ts
 * Server-side Stripe subscription billing for NokurAI.
 *
 * - Hosted Stripe Checkout (subscription mode) using price lookup keys
 * - Stripe Customer Portal for cancel / change plan / update card
 * - Webhook is the ONLY thing that grants or removes Pro
 * - Users are verified with Firebase Auth ID tokens (never trust userId from the body)
 * - Subscription state is stored in Firestore: users/{uid}
 *
 * Required environment variables (server only, never in front-end code):
 *   STRIPE_SECRET_KEY          sk_test_... (sk_live_... when you go live)
 *   STRIPE_WEBHOOK_SECRET      whsec_...
 *   FIREBASE_SERVICE_ACCOUNT   the full service-account JSON, as one string
 *   APP_URL                    e.g. https://your-deployed-app.run.app (no trailing slash)
 *
 * Install:  npm install stripe firebase-admin
 *
 * IMPORTANT: call registerBillingRoutes(app) BEFORE app.use(express.json()),
 * because the webhook needs the raw request body to verify Stripe's signature.
 */

import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const parsedEnv = dotenv.parse(fs.readFileSync(envPath));
    for (const [k, v] of Object.entries(parsedEnv)) {
      if (v && (!process.env[k] || process.env[k] === 'unused')) {
        process.env[k] = v;
      }
    }
  }
} catch {}

// ---------- Setup ----------

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
const rawStripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripeSecretKey =
  rawStripeKey && rawStripeKey !== 'unused' && (rawStripeKey.startsWith('sk_') || rawStripeKey.startsWith('rk_'))
    ? rawStripeKey
    : '';

let db: FirebaseFirestore.Firestore | null = null;
let stripe: Stripe | null = null;

if (serviceAccountRaw && serviceAccountRaw !== 'unused' && serviceAccountRaw.trim().startsWith('{')) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountRaw)),
      });
    }
    db = getFirestore();
    console.log('[billing] Firebase Admin initialized successfully.');
  } catch (err: any) {
    console.warn('[billing] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
  }
} else {
  console.log('[billing] Notice: FIREBASE_SERVICE_ACCOUNT is not configured. Local & Stripe checkout modes active.');
}

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
  console.log('[billing] Stripe initialized successfully.');
} else {
  console.warn('[billing] Notice: STRIPE_SECRET_KEY is not set in environment.');
}

const APP_URL = (process.env.APP_URL || '').replace(/\/$/, '');

// Price lookup keys created in your Stripe account
const PRICE_KEYS = {
  monthly: 'nokurai_pro_monthly',
  yearly: 'nokurai_pro_yearly',
} as const;

// ---------- Auth + Pro gating ----------

export interface AuthedRequest extends Request {
  user?: { uid: string; email?: string };
}

/** Verifies the Firebase ID token sent as "Authorization: Bearer <token>". */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Please sign in.' });

  if (!serviceAccountRaw || !getApps().length) {
    return res.status(503).json({
      error: 'FIREBASE_NOT_CONFIGURED',
      message: 'Server requires FIREBASE_SERVICE_ACCOUNT to verify Firebase ID tokens.',
    });
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'INVALID_TOKEN', message: 'Please sign in again.' });
  }
}

async function getBilling(uid: string): Promise<Record<string, any>> {
  if (!db) return {};
  const snap = await db.collection('users').doc(uid).get();
  return snap.data() || {};
}

function hasActiveSubscription(data: Record<string, any>): boolean {
  return data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing';
}

/** Use after requireAuth on any route that should be Pro-only. */
export async function requirePro(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = await getBilling(req.user!.uid);
    if (!hasActiveSubscription(data)) {
      return res.status(403).json({ error: 'PRO_REQUIRED', message: 'This feature requires NokurAI Pro.' });
    }
    next();
  } catch (err) {
    console.error('requirePro error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
}

// ---------- Stripe helpers ----------

async function getOrCreateCustomer(uid: string, email?: string): Promise<string> {
  if (!db || !stripe) {
    throw new Error('Database or Stripe client not initialized.');
  }
  const ref = db.collection('users').doc(uid);
  const data = (await ref.get()).data() || {};
  if (data.stripeCustomerId) return data.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { firebaseUid: uid },
  });
  await ref.set({ stripeCustomerId: customer.id, email: email || null }, { merge: true });
  return customer.id;
}

/** Always re-reads the subscription from Stripe, so event order never matters. */
async function syncSubscription(subscriptionId: string) {
  if (!db || !stripe) return;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  let uid: string | undefined = sub.metadata?.firebaseUid;
  if (!uid) {
    const q = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    uid = q.docs[0]?.id;
  }
  if (!uid) {
    console.warn(`[billing] No user found for subscription ${sub.id} / customer ${customerId}`);
    return;
  }

  const item = sub.items.data[0];
  // current_period_end moved onto the subscription item in newer API versions
  const periodEnd: number | null =
    (sub as any).current_period_end ?? (item as any)?.current_period_end ?? null;

  await db.collection('users').doc(uid).set(
    {
      stripeCustomerId: customerId,
      subscriptionId: sub.id,
      subscriptionStatus: sub.status, // active | trialing | past_due | canceled | unpaid | ...
      plan: item?.price?.lookup_key || null,
      currentPeriodEnd: periodEnd ? periodEnd * 1000 : null,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end || sub.cancel_at),
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  console.log(`[billing] Synced ${sub.id} for ${uid}: ${sub.status}`);
}

// ---------- Routes ----------

export function registerBillingRoutes(app: Express) {
  /**
   * Stripe webhook. Uses the raw body so the signature can be verified.
   * Add this endpoint in Stripe: Developers > Webhooks.
   */
  app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(503).send('Stripe is not configured on the server.');
      }
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('[billing] STRIPE_WEBHOOK_SECRET is not set.');
        return res.status(500).send('Webhook secret is not configured.');
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'] as string,
          process.env.STRIPE_WEBHOOK_SECRET as string
        );
      } catch (err: any) {
        console.error('[billing] Webhook signature verification failed:', err.message);
        return res.status(400).send('Invalid signature');
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.mode === 'subscription' && session.subscription) {
              const subId =
                typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
              await syncSubscription(subId);
            }
            break;
          }
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted': {
            await syncSubscription((event.data.object as Stripe.Subscription).id);
            break;
          }
          case 'invoice.paid':
          case 'invoice.payment_failed': {
            const invoice = event.data.object as any;
            const ref = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
            const subId = typeof ref === 'string' ? ref : ref?.id;
            if (subId) await syncSubscription(subId);
            break;
          }
          default:
            break;
        }
        res.json({ received: true });
      } catch (err) {
        console.error('[billing] Webhook handler failed:', err);
        res.status(500).send('Webhook handler failed'); // Stripe will retry
      }
    }
  );

  /** Start a subscription: returns a Stripe-hosted Checkout URL. */
  app.post('/api/billing/checkout', express.json(), requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'STRIPE_NOT_CONFIGURED', message: 'STRIPE_SECRET_KEY is not set.' });
      }

      const { uid, email } = req.user!;
      const plan: 'monthly' | 'yearly' = req.body?.plan === 'yearly' ? 'yearly' : 'monthly';

      if (hasActiveSubscription(await getBilling(uid))) {
        return res.status(409).json({
          error: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active subscription. Use "Manage subscription" to change it.',
        });
      }

      const prices = await stripe.prices.list({ lookup_keys: [PRICE_KEYS[plan]], active: true, limit: 1 });
      const price = prices.data[0];
      if (!price) {
        return res.status(500).json({ error: 'PRICE_NOT_FOUND', message: `No Stripe price for ${PRICE_KEYS[plan]}` });
      }

      const customerId = await getOrCreateCustomer(uid, email);

      const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
      const proto = req.get('x-forwarded-proto') || (host.includes('run.app') ? 'https' : req.protocol);
      const returnBaseUrl = APP_URL || `${proto}://${host}`;

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        client_reference_id: uid,
        line_items: [{ price: price.id, quantity: 1 }],
        managed_payments: { enabled: false },
        subscription_data: { metadata: { firebaseUid: uid } },
        allow_promotion_codes: true,
        success_url: `${returnBaseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnBaseUrl}/?payment=cancelled`,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error('[billing] checkout error:', err);
      res.status(500).json({ error: 'CHECKOUT_FAILED', message: err.message || 'Could not start checkout.' });
    }
  });

  /** Opens the Stripe Customer Portal (cancel, switch plan, update card, invoices). */
  app.post('/api/billing/portal', express.json(), requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'STRIPE_NOT_CONFIGURED', message: 'STRIPE_SECRET_KEY is not set.' });
      }

      const data = await getBilling(req.user!.uid);
      if (!data.stripeCustomerId) {
        return res.status(404).json({ error: 'NO_CUSTOMER', message: 'No billing account found yet.' });
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: data.stripeCustomerId,
        return_url: `${APP_URL}/`,
      });
      res.json({ url: session.url });
    } catch (err: any) {
      console.error('[billing] portal error:', err);
      res.status(500).json({ error: 'PORTAL_FAILED', message: 'Could not open the billing portal.' });
    }
  });

  /** The front end calls this to learn whether the signed-in user is Pro. */
  app.get('/api/billing/status', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const data = await getBilling(req.user!.uid);
      res.json({
        isPro: hasActiveSubscription(data),
        status: data.subscriptionStatus || 'none',
        plan: data.plan || null,
        currentPeriodEnd: data.currentPeriodEnd || null,
        cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
      });
    } catch (err) {
      console.error('[billing] status error:', err);
      res.status(500).json({ error: 'SERVER_ERROR' });
    }
  });
}
