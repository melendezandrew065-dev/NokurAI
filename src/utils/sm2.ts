/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard, ReviewHistory } from '../types';

/**
 * SuperMemo SM-2 Algorithm Implementation
 * Quality score:
 * 0: Complete blackout
 * 1: Incorrect; remembered upon seeing answer
 * 2: Incorrect; answer felt familiar
 * 3: Correct with effort / hesitation
 * 4: Correct after slight pause
 * 5: Instant, effortless recall
 */
export function calculateSM2(
  card: Flashcard,
  quality: number
): {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: number;
  historyItem: ReviewHistory;
} {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, quality));
  
  let repetitions = card.repetitions;
  let interval = card.interval;
  let easeFactor = card.easeFactor || 2.5;

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Calculate new Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const now = Date.now();
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  const historyItem: ReviewHistory = {
    date: now,
    quality: q,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
  };

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
    historyItem,
  };
}

/**
 * Formats interval days into human-friendly string
 */
export function formatInterval(intervalInDays: number): string {
  if (intervalInDays <= 1) return 'Tomorrow';
  if (intervalInDays < 7) return `${intervalInDays} days`;
  if (intervalInDays < 30) {
    const weeks = Math.round(intervalInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  const months = Math.round(intervalInDays / 30);
  return `${months} ${months === 1 ? 'month' : 'months'}`;
}

/**
 * Checks if card is due for review today
 */
export function isCardDue(card: Flashcard, referenceTimestamp = Date.now()): boolean {
  return !card.nextReviewDate || card.nextReviewDate <= referenceTimestamp;
}

/**
 * Calculates retention status of a card
 */
export function getCardMasteryStatus(card: Flashcard): {
  label: 'New' | 'Learning' | 'Reviewing' | 'Mastered';
  color: string;
  badgeBg: string;
} {
  if (card.repetitions === 0 && (!card.history || card.history.length === 0)) {
    return { label: 'New', color: 'text-sky-400', badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-300' };
  }
  if (card.repetitions < 2) {
    return { label: 'Learning', color: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300' };
  }
  if (card.repetitions < 4) {
    return { label: 'Reviewing', color: 'text-indigo-400', badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' };
  }
  return { label: 'Mastered', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' };
}
