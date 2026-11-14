/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  hint?: string;
  imageUrl?: string;        // Visual diagram, whiteboard capture, or concept illustration
  imageCaption?: string;    // Label or descriptive legend for the image
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  keyFormulaOrConcept?: string;
  // SM-2 Spaced Repetition Parameters
  repetitions: number;      // number of consecutive successful reviews (q >= 3)
  interval: number;         // days until next review
  easeFactor: number;       // difficulty multiplier (defaults to 2.5, min 1.3)
  lastReviewDate?: number;  // timestamp ms
  nextReviewDate: number;   // timestamp ms
  history: ReviewHistory[]; // review log
  createdAt: number;
}

export interface ReviewHistory {
  date: number;
  quality: number; // 0 to 5
  interval: number;
  easeFactor: number;
}

export interface TopicStep {
  stepNumber: number;
  title: string;
  summary: string;
  coreConcepts: string[];
  checkpointQuestion: string;
  checkpointAnswer: string;
  imageUrl?: string;        // Diagram or visual illustration for the learning step
  isCompleted?: boolean;
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  description: string;
  coverImage?: string;      // Banner cover illustration for the study deck
  sourceType: 'pdf' | 'text' | 'sample' | 'image' | 'audio' | 'document' | 'other';
  sourceFileName?: string;
  cards: Flashcard[];
  topicSteps: TopicStep[];
  createdAt: number;
  updatedAt: number;
  isEncrypted: boolean;
  isSharedCollaborative?: boolean;
  collaboratorsCount?: number;
  shareCode?: string;
}

export type PaymentMethodRail = 'google_pay' | 'apple_pay' | 'paypal' | 'venmo' | 'cash_app' | 'card';

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  authorizationCode?: string;
  amount: number;
  currency: string;
  billingCycle?: 'monthly' | 'yearly';
  plan?: string;
  paymentMethod?: PaymentMethodRail;
  paymentMethodLabel?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardholderName?: string;
  userEmail?: string;
  walletHandle?: string;
  status: 'succeeded' | 'pending' | 'failed' | 'cancelled' | 'reactivated';
  date: number;
  nextBillingDate: number;
  merchantName?: string;
  statementDescriptor?: string;
  transferredToGooglePay?: boolean;
  googlePayRecipient?: string;
  transferSettlementNote?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'guest';
  isPro: boolean;
  isProCancelled?: boolean;
  cancelReason?: string;
  subscriptionCancelledAt?: number;
  proSubscriptionExpiry?: number;
  planBillingCycle?: 'monthly' | 'yearly';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  lastTransaction?: PaymentTransaction;
  paymentHistory?: PaymentTransaction[];
  dailyGeneratedCount: number;
  lastGenerationDate: string; // YYYY-MM-DD
  // Gamification
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate: string; // YYYY-MM-DD
  cardsReviewedToday: number;
  dailyGoal: number; // e.g. 20
  unlockedBadges: string[];
  // Security
  biometricsEnabled: boolean;
  encryptionKeySet: boolean;
  // Multi-platform sync
  activeDevices: Array<{
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    lastSync: number;
  }>;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}
