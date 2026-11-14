/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Upload, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DeckDetailView } from './components/DeckDetailView';
import { UploadModal } from './components/UploadModal';
import { FlashcardReview } from './components/FlashcardReview';
import { QuizMode } from './components/QuizMode';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { AuthModal } from './components/AuthModal';
import { BadgesModal } from './components/BadgesModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { LegalModal } from './components/LegalModal';
import { Footer } from './components/Footer';
import { Deck, Flashcard, UserProfile, PaymentTransaction } from './types';
import { INITIAL_SEEDED_DECKS } from './data/sampleNotes';
import { getSubjectCoverImage, getTopicIllustration } from './utils/imageCurator';

const STORAGE_KEY_DECKS = 'nokurai_study_decks_v1';
const STORAGE_KEY_USER = 'nokurai_user_profile_v1';

export default function App() {
  // Offline / Online state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // User Profile State
  const [user, setUser] = useState<UserProfile>(() => {
    const cached = localStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem('synapse_user_profile_v1');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached user:', e);
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      id: 'usr-student-default',
      name: 'Andrew Melendez',
      email: 'melendezandrew065@gmail.com',
      provider: 'google',
      isPro: false,
      dailyGeneratedCount: 4, // 4 out of 10 free cards used today
      lastGenerationDate: todayStr,
      xp: 420,
      level: 2,
      currentStreak: 3,
      longestStreak: 5,
      lastStudiedDate: todayStr,
      cardsReviewedToday: 7,
      dailyGoal: 20,
      unlockedBadges: ['first_deck', 'spaced_explorer', 'streak_3'],
      biometricsEnabled: false,
      encryptionKeySet: false,
      activeDevices: [
        { id: 'dev-1', name: 'iPhone 16 Pro (Mobile)', type: 'mobile', lastSync: Date.now() - 1000 * 60 * 12 },
        { id: 'dev-2', name: 'MacBook Air M3 (Desktop)', type: 'desktop', lastSync: Date.now() - 1000 * 60 * 45 },
        { id: 'dev-3', name: 'iPad Air 11" (Tablet)', type: 'tablet', lastSync: Date.now() - 1000 * 60 * 180 },
      ],
    };
  });

  // Decks State (Encrypted / Local Offline Vault)
  const [decks, setDecks] = useState<Deck[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEY_DECKS) || localStorage.getItem('synapse_study_decks_v1');
    if (cached) {
      try {
        const parsed: Deck[] = JSON.parse(cached);
        return parsed.map((d) => ({
          ...d,
          coverImage: d.coverImage || getSubjectCoverImage(d.subject),
          cards: (d.cards || []).map((c) => ({
            ...c,
            imageUrl: c.imageUrl || getTopicIllustration(c.topic, d.subject),
            imageCaption: c.imageCaption || (c.topic ? `${c.topic} Diagram` : undefined),
          })),
        }));
      } catch (e) {
        console.error('Failed to parse cached decks:', e);
      }
    }
    return INITIAL_SEEDED_DECKS;
  });

  // Save changes to localStorage for offline access
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  // Daily reset check for 10 cards limit & streak
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastGenerationDate !== todayStr) {
      setUser((prev) => ({
        ...prev,
        dailyGeneratedCount: 0,
        cardsReviewedToday: 0,
        lastGenerationDate: todayStr,
      }));
    }
  }, []);

  // UI Navigation & Modals state
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialTab, setUploadInitialTab] = useState<'upload' | 'text' | 'samples' | 'create'>('upload');
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalInitialStep, setProModalInitialStep] = useState<'overview' | 'checkout' | 'receipt' | 'cancel'>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOpenProModal = (step: 'overview' | 'checkout' | 'receipt' | 'cancel' = 'overview') => {
    setProModalInitialStep(step);
    setIsProModalOpen(true);
  };

  const handleOpenUpload = (tab: 'upload' | 'text' | 'samples' | 'create' = 'upload') => {
    setUploadInitialTab(tab);
    setIsUploadOpen(true);
  };
  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms' | 'adsense';
  }>({
    isOpen: false,
    tab: 'privacy',
  });

  // Review & Quiz modals state
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    cards: Flashcard[];
    title: string;
  }>({
    isOpen: false,
    cards: [],
    title: '',
  });

  const [quizModalState, setQuizModalState] = useState<{
    isOpen: boolean;
    cards: Flashcard[];
    title: string;
  }>({
    isOpen: false,
    cards: [],
    title: '',
  });

  // Gamification helpers: XP & Streak updates
  const handleEarnXp = (amount: number, reason: string) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 300) + 1;
      const todayStr = new Date().toISOString().split('T')[0];
      const newReviewedToday = prev.cardsReviewedToday + 1;

      const updatedBadges = [...prev.unlockedBadges];
      if (newLevel >= 3 && !updatedBadges.includes('scholar_lvl3')) {
        updatedBadges.push('scholar_lvl3');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        cardsReviewedToday: newReviewedToday,
        lastStudiedDate: todayStr,
        unlockedBadges: updatedBadges,
      };
    });
  };

  // Card update handler (after SM-2 grading)
  const handleUpdateCard = (updatedCard: Flashcard) => {
    setDecks((prevDecks) =>
      prevDecks.map((d) => {
        if (d.id === updatedCard.deckId) {
          return {
            ...d,
            cards: d.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            updatedAt: Date.now(),
          };
        }
        return d;
      })
    );

    // Also update selectedDeck if active
    if (selectedDeck && selectedDeck.id === updatedCard.deckId) {
      setSelectedDeck((prev) =>
        prev
          ? {
              ...prev,
              cards: prev.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
              updatedAt: Date.now(),
            }
          : null
      );
    }
  };

  // Add new deck handler
  const handleDeckCreated = (newDeck: Deck) => {
    setDecks((prev) => [newDeck, ...prev]);
    setUser((prev) => {
      const newDailyCount = prev.dailyGeneratedCount + newDeck.cards.length;
      const updatedBadges = [...prev.unlockedBadges];
      if (!updatedBadges.includes('first_deck')) {
        updatedBadges.push('first_deck');
      }
      return {
        ...prev,
        dailyGeneratedCount: newDailyCount,
        xp: prev.xp + 100,
        unlockedBadges: updatedBadges,
      };
    });
    setSelectedDeck(newDeck);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  // Check for Stripe Checkout return in URL query or pending session in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const urlSessionId = params.get('session_id');
    const pendingSessionId = localStorage.getItem('nokurai_pending_stripe_session_id');

    const verifySession = async (sessionId: string) => {
      try {
        const res = await fetch(`/api/verify-stripe-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.verified && data.transaction) {
          localStorage.removeItem('nokurai_pending_stripe_session_id');
          handleUpgradeSuccess(
            data.billingCycle || 'monthly',
            data.transaction,
            data.stripeCustomerId,
            data.stripeSubscriptionId
          );
          setProModalInitialStep('receipt');
          setIsProModalOpen(true);
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
      } catch (e) {
        console.warn('Stripe session verification failed:', e);
      }
    };

    if (paymentStatus === 'success') {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      if (urlSessionId && urlSessionId.startsWith('cs_')) {
        verifySession(urlSessionId);
      } else if (pendingSessionId && pendingSessionId.startsWith('cs_')) {
        verifySession(pendingSessionId);
      }
    } else if (paymentStatus === 'cancelled') {
      localStorage.removeItem('nokurai_pending_stripe_session_id');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (!user.isPro && pendingSessionId && pendingSessionId.startsWith('cs_')) {
      verifySession(pendingSessionId);
    }
  }, []);

  // Pro Upgrade Success & Card Charge Recording
  const handleUpgradeSuccess = (
    billingCycle: 'monthly' | 'yearly',
    transaction?: PaymentTransaction,
    stripeCustomerId?: string | null,
    stripeSubscriptionId?: string | null
  ) => {
    setUser((prev) => {
      const updatedBadges = [...prev.unlockedBadges];
      if (!updatedBadges.includes('pro_unlocked')) {
        updatedBadges.push('pro_unlocked');
      }
      const existingHistory = prev.paymentHistory || [];
      const alreadyRecorded = transaction && existingHistory.some((t) => t.id === transaction.id);
      const updatedHistory =
        transaction && !alreadyRecorded ? [transaction, ...existingHistory] : existingHistory;
      return {
        ...prev,
        isPro: true,
        isProCancelled: false,
        planBillingCycle: billingCycle,
        stripeCustomerId: stripeCustomerId || transaction?.stripeCustomerId || prev.stripeCustomerId,
        stripeSubscriptionId:
          stripeSubscriptionId || transaction?.stripeSubscriptionId || prev.stripeSubscriptionId,
        proSubscriptionExpiry:
          transaction?.nextBillingDate || Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000,
        lastTransaction: transaction || prev.lastTransaction,
        paymentHistory: updatedHistory,
        unlockedBadges: updatedBadges,
      };
    });
  };

  const handleRestorePro = async (): Promise<{ restored: boolean; message?: string }> => {
    try {
      const pendingSessionId = localStorage.getItem('nokurai_pending_stripe_session_id');
      if (pendingSessionId && pendingSessionId.startsWith('cs_')) {
        const sRes = await fetch(`/api/verify-stripe-session?session_id=${encodeURIComponent(pendingSessionId)}`);
        const sData = await sRes.json();
        if (sData.verified && sData.transaction) {
          localStorage.removeItem('nokurai_pending_stripe_session_id');
          handleUpgradeSuccess(
            sData.billingCycle || 'monthly',
            sData.transaction,
            sData.stripeCustomerId,
            sData.stripeSubscriptionId
          );
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          return { restored: true, message: 'Stripe payment verified and Pro activated!' };
        }
      }

      const res = await fetch('/api/check-stripe-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
        }),
      });
      const data = await res.json();
      if (data.hasActiveSubscription && data.transaction) {
        handleUpgradeSuccess(
          data.billingCycle || 'monthly',
          data.transaction,
          data.stripeCustomerId,
          data.stripeSubscriptionId
        );
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        return { restored: true, message: data.message || 'Active Stripe subscription verified!' };
      }
      return {
        restored: false,
        message: data.message || 'No active Stripe subscription found for your email yet.',
      };
    } catch (err: any) {
      return {
        restored: false,
        message: err?.message || 'Could not reach Stripe to verify subscription.',
      };
    }
  };

  const handleCancelSubscription = async (reason?: string, immediate: boolean = false) => {
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          reason: reason || 'Customer requested cancellation',
          immediate,
        }),
      });
    } catch (e) {
      console.warn('Subscription cancellation:', e);
    }
    setUser((prev) => ({
      ...prev,
      isPro: immediate ? false : true,
      isProCancelled: true,
      cancelReason: reason || 'User requested cancellation',
      subscriptionCancelledAt: Date.now(),
    }));
  };

  const handleReactivateSubscription = async () => {
    try {
      await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
        }),
      });
    } catch (e) {
      console.warn('Subscription reactivate:', e);
    }
    setUser((prev) => ({
      ...prev,
      isPro: true,
      isProCancelled: false,
      cancelReason: undefined,
      subscriptionCancelledAt: undefined,
      proSubscriptionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }));
  };

  // Trigger cross-device cloud sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      if (user.isPro) {
        await fetch('/api/sync-cloud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            decks,
            isPro: true,
            deviceId: 'dev-desktop',
            deviceName: 'Current Device',
          }),
        });
      }
      setUser((prev) => ({
        ...prev,
        activeDevices: prev.activeDevices.map((d) => ({
          ...d,
          lastSync: Date.now(),
        })),
      }));
    } catch (err) {
      console.warn('Sync attempt in local mode:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        isOnline={isOnline}
        onOpenUpload={() => handleOpenUpload('upload')}
        onOpenCreate={() => handleOpenUpload('create')}
        onOpenProModal={handleOpenProModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLockApp={() => setIsLocked(true)}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab: tab || 'privacy' })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedDeck ? (
          <DeckDetailView
            deck={selectedDeck}
            onBack={() => setSelectedDeck(null)}
            onUpdateDeck={(updated) => {
              setDecks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
              setSelectedDeck(updated);
            }}
            onDeleteDeck={(deckId) => {
              setDecks((prev) => prev.filter((d) => d.id !== deckId));
              setSelectedDeck(null);
            }}
            onStartReview={(cards) =>
              setReviewModalState({
                isOpen: true,
                cards,
                title: selectedDeck.title,
              })
            }
            onStartQuiz={(cards) =>
              setQuizModalState({
                isOpen: true,
                cards,
                title: selectedDeck.title,
              })
            }
            onEarnXp={handleEarnXp}
            isPro={user.isPro}
            onOpenProModal={handleOpenProModal}
          />
        ) : (
          <Dashboard
            user={user}
            decks={decks}
            isOnline={isOnline}
            onSelectDeck={(deck) => setSelectedDeck(deck)}
            onStartReviewQueue={(cards, title) =>
              setReviewModalState({
                isOpen: true,
                cards,
                title,
              })
            }
            onOpenUpload={() => handleOpenUpload('upload')}
            onOpenCreate={() => handleOpenUpload('create')}
            onOpenProModal={handleOpenProModal}
            onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
            onCancelSubscription={handleCancelSubscription}
            onReactivateSubscription={handleReactivateSubscription}
          />
        )}
      </main>

      {/* Global Footer with AdSense & Legal links */}
      <Footer onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab: tab || 'privacy' })} />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        user={user}
        onDeckCreated={handleDeckCreated}
        onOpenProModal={() => {
          setIsUploadOpen(false);
          handleOpenProModal('overview');
        }}
        initialTab={uploadInitialTab}
      />

      <FlashcardReview
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        cards={reviewModalState.cards}
        onUpdateCard={handleUpdateCard}
        onEarnXp={handleEarnXp}
        deckTitle={reviewModalState.title}
      />

      <QuizMode
        isOpen={quizModalState.isOpen}
        onClose={() => setQuizModalState((prev) => ({ ...prev, isOpen: false }))}
        cards={quizModalState.cards}
        deckTitle={quizModalState.title}
        onEarnXp={handleEarnXp}
      />

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        user={user}
        initialStep={proModalInitialStep}
        onUpgradeSuccess={handleUpgradeSuccess}
        onRestorePro={handleRestorePro}
        onCancelSubscription={handleCancelSubscription}
        onReactivateSubscription={handleReactivateSubscription}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onOpenProModal={handleOpenProModal}
        onCancelSubscription={handleCancelSubscription}
        onReactivateSubscription={handleReactivateSubscription}
      />

      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        user={user}
      />

      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
        initialTab={legalModalState.tab}
      />

      {/* Mobile Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-30 sm:hidden flex flex-col gap-2 items-end">
        <button
          onClick={() => handleOpenUpload('create')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>+ Create One</span>
        </button>
        <button
          onClick={() => handleOpenUpload('upload')}
          className="flex items-center gap-2 px-4.5 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-2xl shadow-indigo-600/60 ring-2 ring-indigo-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Notes</span>
        </button>
      </div>

      <BiometricLockScreen
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        userName={user.name}
      />
    </div>
  );
}
