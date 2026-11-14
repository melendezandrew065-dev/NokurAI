/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Crown,
  Check,
  Cloud,
  Users,
  ShieldCheck,
  Sparkles,
  Fingerprint,
  WifiOff,
  CreditCard,
  Lock,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  FileText,
  CalendarOff,
  Undo2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { UserProfile, PaymentTransaction } from '../types';

interface GatewayStatus {
  liveCardProcessingEnabled: boolean;
  stripeConnected?: boolean;
  stripeMode?: 'live' | 'test' | 'none';
  publishableKey?: string | null;
  publishableKeyMode?: 'live' | 'test' | 'none';
  keysMatch?: boolean;
  embeddedCheckoutReady?: boolean;
  keyMismatchReason?: string | null;
  merchantEmail: string;
  merchantName: string;
  depositAccount: string;
  mode: string;
  setupInstructions: string;
}

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradeSuccess: (
    billingCycle: 'monthly' | 'yearly',
    transaction?: PaymentTransaction,
    stripeCustomerId?: string | null,
    stripeSubscriptionId?: string | null
  ) => void;
  onCancelSubscription?: (reason?: string, immediate?: boolean) => Promise<void> | void;
  onReactivateSubscription?: () => Promise<void> | void;
  onRestorePro?: () => Promise<{ restored: boolean; message?: string } | void> | void;
  initialStep?: 'overview' | 'checkout' | 'receipt' | 'cancel';
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  onCancelSubscription,
  onReactivateSubscription,
  onRestorePro,
  initialStep,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'overview' | 'checkout' | 'receipt' | 'cancel'>('overview');

  // Gateway status & Stripe Checkout Session state
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isRestoringPro, setIsRestoringPro] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(
    user.lastTransaction || null
  );

  // Cancellation state
  const [selectedReason, setSelectedReason] = useState<string>('Finished course / exams passed');
  const [customReason, setCustomReason] = useState<string>('');
  const [cancellationMode, setCancellationMode] = useState<'keep_until_expiry' | 'immediate'>('keep_until_expiry');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateSuccessMessage, setReactivateSuccessMessage] = useState<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const stripePromise = useMemo(() => {
    if (gatewayStatus?.embeddedCheckoutReady && gatewayStatus?.publishableKey) {
      return loadStripe(gatewayStatus.publishableKey);
    }
    return null;
  }, [gatewayStatus?.embeddedCheckoutReady, gatewayStatus?.publishableKey]);

  // Fetch gateway status when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/payment-gateway-status')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setGatewayStatus(data);
        })
        .catch((err) => console.error('Failed to load gateway status:', err));
    }
  }, [isOpen]);

  // Sync step with initialStep on modal open
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 'overview');
      setCancelSuccessMessage(null);
      setReactivateSuccessMessage(null);
      setRestoreFeedback(null);
      setErrorMessage(null);
      setAwaitingVerification(false);
      if (user.lastTransaction) {
        setCompletedTransaction(user.lastTransaction);
      }
    }
  }, [isOpen, initialStep, user.lastTransaction]);

  // Prepare a fresh Stripe Checkout Session whenever Checkout step is active or billingCycle changes
  const prepareStripeCheckoutSession = useCallback(
    async (cycle: 'monthly' | 'yearly') => {
      setIsPreparingCheckout(true);
      setErrorMessage(null);
      setCheckoutUrl(null);
      setCheckoutClientSecret(null);
      setCheckoutSessionId(null);
      try {
        const wantEmbedded = Boolean(gatewayStatus?.embeddedCheckoutReady);
        const res = await fetch('/api/create-stripe-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingCycle: cycle,
            userId: user.id,
            userEmail: user.email || 'melendezandrew065@gmail.com',
            uiMode: wantEmbedded ? 'embedded_page' : 'hosted',
          }),
        });
        const data = await res.json();
        if (data.success && (data.clientSecret || data.url)) {
          setCheckoutUrl(data.url || null);
          setCheckoutClientSecret(data.clientSecret || null);
          setCheckoutSessionId(data.sessionId || null);
        } else {
          setErrorMessage(data.message || 'Could not initialize Stripe Checkout session.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to connect to Stripe server.');
      } finally {
        setIsPreparingCheckout(false);
      }
    },
    [user.id, user.email, gatewayStatus?.embeddedCheckoutReady]
  );

  useEffect(() => {
    if (isOpen && step === 'checkout' && !user.isPro && gatewayStatus) {
      prepareStripeCheckoutSession(billingCycle);
    }
  }, [isOpen, step, billingCycle, user.isPro, gatewayStatus, prepareStripeCheckoutSession]);

  // Verify pending Stripe checkout session
  const verifyPendingStripePayment = useCallback(
    async (silent = false) => {
      const targetSessionId =
        checkoutSessionId || localStorage.getItem('nokurai_pending_stripe_session_id');
      if (!targetSessionId) {
        if (!silent) {
          setErrorMessage('No active Stripe checkout session found. Click Pay with Stripe to start.');
        }
        return false;
      }

      if (!silent) setIsVerifyingPayment(true);
      try {
        const res = await fetch(
          `/api/verify-stripe-session?session_id=${encodeURIComponent(targetSessionId)}`
        );
        const data = await res.json();
        if (data.verified && data.transaction) {
          localStorage.removeItem('nokurai_pending_stripe_session_id');
          setCompletedTransaction(data.transaction);
          onUpgradeSuccess(
            data.billingCycle || billingCycle,
            data.transaction,
            data.stripeCustomerId,
            data.stripeSubscriptionId
          );
          setAwaitingVerification(false);
          setStep('receipt');
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
          return true;
        } else if (!silent) {
          setErrorMessage(
            'Stripe payment is not marked paid yet. Complete checkout in the Stripe tab, then click Verify again.'
          );
        }
      } catch (err: any) {
        if (!silent) {
          setErrorMessage(err?.message || 'Unable to verify Stripe payment right now.');
        }
      } finally {
        if (!silent) setIsVerifyingPayment(false);
      }
      return false;
    },
    [checkoutSessionId, billingCycle, onUpgradeSuccess]
  );

  // Automatically check Stripe when user returns focus from the Stripe Checkout tab
  useEffect(() => {
    if (!isOpen || step !== 'checkout' || !awaitingVerification) return;
    const handleWindowFocus = () => {
      verifyPendingStripePayment(true);
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [isOpen, step, awaitingVerification, verifyPendingStripePayment]);

  if (!isOpen) return null;

  const currentPrice = billingCycle === 'monthly' ? 2.99 : 29.99;
  const currentPriceFormatted = `$${currentPrice.toFixed(2)}`;

  const handleCheckoutLinkClick = () => {
    if (checkoutSessionId) {
      localStorage.setItem('nokurai_pending_stripe_session_id', checkoutSessionId);
    }
    setAwaitingVerification(true);
    setErrorMessage(null);
  };

  const handleLaunchTopLevelCheckout = async () => {
    setErrorMessage(null);
    if (checkoutUrl) {
      if (checkoutSessionId) {
        localStorage.setItem('nokurai_pending_stripe_session_id', checkoutSessionId);
      }
      window.location.href = checkoutUrl;
      return;
    }
    await prepareStripeCheckoutSession(billingCycle);
  };

  const handleRestorePro = async () => {
    setIsRestoringPro(true);
    setRestoreFeedback(null);
    setErrorMessage(null);
    try {
      if (onRestorePro) {
        const result = await onRestorePro();
        if (result && result.restored) {
          setRestoreFeedback({
            type: 'success',
            text: result.message || 'Active Stripe Pro membership restored!',
          });
          return;
        }
        setRestoreFeedback({
          type: 'info',
          text:
            result?.message ||
            `No active Stripe subscription found for ${user.email}. Click Upgrade below to subscribe via Stripe.`,
        });
        return;
      }
    } catch (err: any) {
      setRestoreFeedback({
        type: 'error',
        text: err?.message || 'Could not verify subscription with Stripe.',
      });
    } finally {
      setIsRestoringPro(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setIsOpeningPortal(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/create-stripe-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeCustomerId: user.stripeCustomerId,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (!isInIframe) {
          window.location.href = data.url;
        } else {
          setPortalUrl(data.url);
        }
      } else {
        setErrorMessage(
          data.message || 'Stripe Billing Portal could not be opened. You can cancel or manage directly below.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reach Stripe Billing Portal.');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedTransaction) return;
    const receiptContent = `
========================================
        NOKURAI PRO - STRIPE RECEIPT
========================================
Merchant: NokurAI Academic Technologies LLC
Receipt No: ${completedTransaction.receiptNumber}
Transaction / Session ID: ${completedTransaction.id}
Authorization / Sub ID: ${completedTransaction.authorizationCode || 'VERIFIED'}
Date: ${new Date(completedTransaction.date).toLocaleString()}
Subscriber: ${completedTransaction.cardholderName || user.name} (${completedTransaction.userEmail || user.email})
Payment Method: ${completedTransaction.paymentMethodLabel || completedTransaction.cardBrand || 'Stripe Checkout'}
----------------------------------------
Description: NokurAI Pro Subscription (${(completedTransaction.billingCycle || 'monthly').toUpperCase()})
Amount Paid: $${completedTransaction.amount.toFixed(2)} ${completedTransaction.currency || 'USD'}
Next Renewal: ${new Date(completedTransaction.nextBillingDate).toLocaleDateString()}
Statement Descriptor: ${completedTransaction.statementDescriptor || 'NOKURAI PRO'}
========================================
Thank you for powering your learning with NokurAI Pro!
Support: melendezandrew065@gmail.com
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NokurAI_Stripe_Receipt_${completedTransaction.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmCancellation = async () => {
    if (!onCancelSubscription) return;
    setIsCancelling(true);
    setErrorMessage(null);
    try {
      const finalReason =
        selectedReason === 'Other' && customReason.trim()
          ? `Other: ${customReason.trim()}`
          : selectedReason;
      await onCancelSubscription(finalReason, cancellationMode === 'immediate');
      setCancelSuccessMessage(
        cancellationMode === 'immediate'
          ? 'Your Pro subscription has been cancelled immediately. Your account has returned to the Free tier.'
          : 'Your Pro auto-renewal has been cancelled. You retain unlimited access until the end of your billing cycle with zero future charges.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!onReactivateSubscription) return;
    setIsReactivating(true);
    setErrorMessage(null);
    try {
      await onReactivateSubscription();
      setReactivateSuccessMessage('Your Pro subscription has been reactivated! Continuous access restored.');
      setCancelSuccessMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not reactivate subscription. Please try again.');
    } finally {
      setIsReactivating(false);
    }
  };

  const expiryDateFormatted = new Date(
    user.proSubscriptionExpiry || Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const isStripeTestMode = gatewayStatus?.stripeMode === 'test';
  const isStripeLiveMode = gatewayStatus?.stripeMode === 'live';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-amber-50/90 via-white to-white border-b border-slate-200 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {(step === 'checkout' || step === 'cancel') && (
            <button
              onClick={() => {
                setStep('overview');
                setErrorMessage(null);
                setCancelSuccessMessage(null);
                setReactivateSuccessMessage(null);
                setAwaitingVerification(false);
              }}
              className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-3 shadow-xs ${
              step === 'cancel'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-100 border-amber-300 text-amber-800'
            }`}
          >
            {step === 'cancel' ? (
              <CalendarOff className="w-4 h-4 text-rose-600" />
            ) : (
              <Crown className="w-4 h-4 text-amber-600" />
            )}
            <span>
              {step === 'receipt'
                ? 'STRIPE PAYMENT VERIFIED'
                : step === 'checkout'
                  ? 'STRIPE SECURE CHECKOUT'
                  : step === 'cancel'
                    ? 'SUBSCRIPTION MANAGEMENT'
                    : 'NOKURAI PRO ACCESS'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {step === 'receipt'
              ? 'Pro Activated Successfully!'
              : step === 'checkout'
                ? 'Upgrade with Stripe Checkout'
                : step === 'cancel'
                  ? 'Cancel Your Pro Subscription'
                  : 'Supercharge Your Memory & Grades'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2">
            {step === 'receipt'
              ? 'Your payment has been verified with Stripe and NokurAI Pro is now active on your account.'
              : step === 'checkout'
                ? 'Pay securely with Credit/Debit Card, Apple Pay, Google Pay, or Link via Stripe.'
                : step === 'cancel'
                  ? 'Review your cancellation choices below. You can stop future billing while keeping full access through your paid period.'
                  : 'Generate unlimited flashcards, sync across all your devices, collaborate with peers, and study anywhere offline.'}
          </p>

          {/* Pricing Selector (Overview) */}
          {step === 'overview' && !user.isPro && (
            <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly ($2.99 / mo)
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual ($29.99 / yr)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Save 16%
                </span>
              </button>
            </div>
          )}

          {step === 'overview' && !user.isPro && (
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Already subscribed on Stripe?</span>
              <button
                type="button"
                onClick={handleRestorePro}
                disabled={isRestoringPro}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer inline-flex items-center gap-1 text-[11px] disabled:opacity-50"
              >
                {isRestoringPro ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isRestoringPro ? 'Checking Stripe...' : 'Verify / Restore Pro'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white">
          {/* STEP 1: OVERVIEW */}
          {step === 'overview' && (
            <>
              {restoreFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    restoreFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : restoreFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{restoreFeedback.text}</span>
                </div>
              )}

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Unlimited Card Generation</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Free tier limited to 10 cards/day. Pro gives you infinite flashcards and topic breakdowns.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700 shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Cloud Storage & Device Sync</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Seamlessly sync study decks across iPhone, Android, Mac, iPad, and Windows PC.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Collaborative Editing</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Share decks with classmates, create group study cohorts, and co-edit lecture cards.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Pro Offline Note Vault</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Full offline access to entire study decks and notes, even with zero internet.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Biometric Privacy Lock</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Lock your sensitive lecture decks with Touch ID, Face ID, or master PIN.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">AES-256 Zero-Knowledge Encryption</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      End-to-end encrypted notes so only you hold the keys to your academic data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Pro Member Info Box */}
              {user.isPro && (
                <div className="space-y-3">
                  {reactivateSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{reactivateSuccessMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {user.isProCancelled ? (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-amber-800">
                          <CalendarOff className="w-4 h-4 text-amber-600" /> Auto-Renewal Cancelled
                        </span>
                        <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">
                          Active until {expiryDateFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Your auto-renewal has been stopped and zero future charges will occur. You retain unlimited card generations and cloud sync until {expiryDateFormatted}.
                      </p>
                      <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleReactivate}
                          disabled={isReactivating}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>{isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}</span>
                        </button>
                        {user.lastTransaction && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompletedTransaction(user.lastTransaction || null);
                              setStep('receipt');
                            }}
                            className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pro Plan Active (
                          {user.planBillingCycle || 'monthly'})
                        </span>
                        <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                          {user.planBillingCycle === 'yearly' ? '$29.99 / yr' : '$2.99 / mo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        You have full unlimited access to instant AI card generation, encrypted notes, and cross-device cloud sync.
                      </p>
                      <div className="pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 font-mono">
                          {user.lastTransaction ? (
                            <span>
                              {user.lastTransaction.paymentMethodLabel || user.lastTransaction.cardBrand} (Renews{' '}
                              {expiryDateFormatted})
                            </span>
                          ) : (
                            <span>Next renewal: {expiryDateFormatted}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {user.stripeCustomerId && (
                            portalUrl ? (
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-indigo-700 hover:text-indigo-900 underline inline-flex items-center gap-1 font-bold cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Stripe Billing Portal</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={handleOpenStripePortal}
                                disabled={isOpeningPortal}
                                className="text-[11px] text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isOpeningPortal ? 'Preparing Portal...' : 'Stripe Billing Portal'}</span>
                              </button>
                            )
                          )}
                          {user.lastTransaction && (
                            <button
                              type="button"
                              onClick={() => {
                                setCompletedTransaction(user.lastTransaction || null);
                                setStep('receipt');
                              }}
                              className="text-[11px] text-slate-700 hover:text-slate-900 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" /> Receipt
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setStep('cancel');
                              setErrorMessage(null);
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <CalendarOff className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 2: STRIPE HOSTED CHECKOUT */}
          {step === 'checkout' && (
            <div className="space-y-4">
              {/* Stripe Connection Status Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Stripe Checkout</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                          isStripeLiveMode
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isStripeTestMode
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isStripeLiveMode
                          ? 'Live Payments'
                          : isStripeTestMode
                            ? 'Test Mode Connected'
                            : 'Setup Needed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isStripeLiveMode
                        ? 'Real cards, Apple Pay, Google Pay & Link processed securely via Stripe.'
                        : isStripeTestMode
                          ? 'Stripe Checkout is active in Test Mode. Complete checkout on Stripe to test payments end-to-end.'
                          : 'Configure STRIPE_SECRET_KEY in environment variables to accept payments.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Selector inside Checkout */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Choose Your NokurAI Pro Plan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Monthly Plan</span>
                      <span className="font-mono font-black text-slate-900">$2.99/mo</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Billed monthly. Cancel anytime in one click.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      billingCycle === 'yearly'
                        ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Annual Plan</span>
                      <span className="font-mono font-black text-slate-900">$29.99/yr</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                      Save 16% ($2.50/mo equivalent)
                    </p>
                  </button>
                </div>
              </div>

              {/* Key Mismatch Notice (if publishable key & secret key belong to different modes/accounts) */}
              {gatewayStatus?.keyMismatchReason && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Live Publishable Key Needs Matching Live Secret Key</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      {gatewayStatus.keyMismatchReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Account Email</span>
                  <span className="font-mono font-semibold text-slate-900">{user.email}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    NokurAI Pro ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentPriceFormatted} USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Accepted Payment Methods</span>
                  <span className="font-semibold text-slate-800">
                    Cards, Apple Pay, Google Pay, Link
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Due Today</span>
                  <span className="font-mono text-indigo-700 font-black">
                    {currentPriceFormatted} USD
                  </span>
                </div>
              </div>

              {/* Primary Stripe Checkout Action (In-App Embedded Checkout OR Hosted Checkout) */}
              <div className="space-y-3">
                {isPreparingCheckout ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 opacity-80"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Preparing Stripe Checkout ({currentPriceFormatted})...</span>
                  </button>
                ) : stripePromise && checkoutClientSecret ? (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white p-2">
                    <EmbeddedCheckoutProvider
                      key={checkoutClientSecret}
                      stripe={stripePromise}
                      options={{
                        clientSecret: checkoutClientSecret,
                        onComplete: () => {
                          verifyPendingStripePayment(false);
                        },
                      }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                ) : checkoutUrl ? (
                  isInIframe ? (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleCheckoutLinkClick}
                      className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Continue to Stripe Checkout ({currentPriceFormatted})</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLaunchTopLevelCheckout}
                      className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay {currentPriceFormatted} with Stripe</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => prepareStripeCheckoutSession(billingCycle)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Stripe Checkout Setup</span>
                  </button>
                )}

                {/* Waiting / Verify Box after clicking checkout in iframe */}
                {awaitingVerification && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Complete payment in your Stripe Checkout tab
                        </p>
                        <p className="text-slate-600 mt-0.5">
                          Once you finish paying on Stripe, you will be redirected back automatically—or click below to confirm and unlock Pro right away.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyPendingStripePayment(false)}
                      disabled={isVerifyingPayment}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isVerifyingPayment ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying with Stripe...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>I Completed Payment — Verify & Activate Pro</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PCI-DSS Level 1 Checkout by Stripe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STRIPE PAYMENT RECEIPT */}
          {step === 'receipt' && completedTransaction && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    Payment of ${completedTransaction.amount.toFixed(2)} {completedTransaction.currency || 'USD'} Confirmed
                  </span>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Your NokurAI Pro subscription is verified and active across all devices.
                  </p>
                </div>
              </div>

              {/* Itemized Digital Receipt */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 tracking-wide">STRIPE PAYMENT RECEIPT</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans font-semibold">
                    PAID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Receipt No:</span>
                    <span className="text-slate-900 font-semibold">{completedTransaction.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Session / Sub ID:</span>
                    <span className="text-slate-900 font-semibold truncate block">
                      {completedTransaction.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method:</span>
                    <span className="text-indigo-700 font-bold">
                      {completedTransaction.paymentMethodLabel || completedTransaction.cardBrand || 'Stripe Checkout'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account:</span>
                    <span className="text-slate-900 font-semibold truncate block">
                      {completedTransaction.userEmail || user.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <span className="text-slate-900">
                      {new Date(completedTransaction.date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Next Renewal:</span>
                    <span className="text-slate-900">
                      {new Date(completedTransaction.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900 font-sans">Total Paid:</span>
                  <span className="font-black text-amber-700 text-base">
                    ${completedTransaction.amount.toFixed(2)} {completedTransaction.currency || 'USD'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Receipt (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Crown className="w-4 h-4" />
                  <span>Start Studying with Pro</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUBSCRIPTION CANCELLATION */}
          {step === 'cancel' && (
            <div className="space-y-4">
              {cancelSuccessMessage ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Subscription Cancelled</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {cancelSuccessMessage}
                  </p>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-left text-xs font-mono space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Auto-Renewal:</span>
                      <span className="font-bold text-emerald-700">Turned Off</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Future Billing:</span>
                      <span className="font-semibold text-slate-900">$0.00 (No future charges)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pro Access Remaining:</span>
                      <span className="font-bold text-slate-900">
                        {cancellationMode === 'immediate' ? 'Ended immediately' : `Active until ${expiryDateFormatted}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('overview')}
                      className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Return to Overview
                    </button>
                    <button
                      type="button"
                      onClick={handleReactivate}
                      disabled={isReactivating}
                      className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>{isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Current Plan
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500" /> NokurAI Pro ({user.planBillingCycle || 'monthly'})
                      </h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Current Period Ends
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">{expiryDateFormatted}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Choose How You'd Like to Cancel:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setCancellationMode('keep_until_expiry')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          cancellationMode === 'keep_until_expiry'
                            ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="cancellationMode"
                            checked={cancellationMode === 'keep_until_expiry'}
                            onChange={() => setCancellationMode('keep_until_expiry')}
                            className="mt-0.5 text-indigo-600 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">Stop Auto-Renewal</span>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Keep unlimited access until <strong>{expiryDateFormatted}</strong> with zero further charges.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCancellationMode('immediate')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          cancellationMode === 'immediate'
                            ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="cancellationMode"
                            checked={cancellationMode === 'immediate'}
                            onChange={() => setCancellationMode('immediate')}
                            className="mt-0.5 text-rose-600 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">Cancel Immediately</span>
                            <p className="text-[11px] text-slate-600 mt-1">
                              End Pro benefits right now and revert to the Free tier.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Why are you cancelling?
                    </label>
                    <div className="space-y-1.5">
                      {[
                        'Finished course / exams passed',
                        'Student budget / reducing expenses',
                        'Only needed temporarily for a test',
                        'Not using unlimited flashcards enough',
                        'Other',
                      ].map((reasonOption) => (
                        <label
                          key={reasonOption}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            selectedReason === reasonOption
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cancelReason"
                            value={reasonOption}
                            checked={selectedReason === reasonOption}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="text-indigo-600 cursor-pointer"
                          />
                          <span>{reasonOption}</span>
                        </label>
                      ))}
                    </div>

                    {selectedReason === 'Other' && (
                      <input
                        type="text"
                        placeholder="Please specify why you're cancelling..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('overview')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Keep My Subscription
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCancellation}
                      disabled={isCancelling}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-rose-600/20 disabled:opacity-50"
                    >
                      <CalendarOff className="w-4 h-4" />
                      <span>{isCancelling ? 'Cancelling...' : 'Confirm & Cancel Subscription'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer & CTA (Shown on Overview) */}
        {step === 'overview' && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{currentPriceFormatted}</span>
                <span className="text-xs text-slate-500 font-medium">
                  {billingCycle === 'monthly' ? '/ month' : '/ year (save 16%)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Processed securely via Stripe. Cancel anytime.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {user.isPro ? (
                <div className="flex flex-wrap items-center justify-end gap-2.5 w-full">
                  {user.isProCancelled ? (
                    <button
                      type="button"
                      onClick={handleReactivate}
                      disabled={isReactivating}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>{isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}</span>
                    </button>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Pro Member Active
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('cancel');
                          setErrorMessage(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CalendarOff className="w-3.5 h-3.5" />
                        <span>Cancel Subscription</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Continue to Stripe ({currentPriceFormatted})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
