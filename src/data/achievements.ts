/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AchievementBadge } from '../types';

export const ALL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first_deck',
    title: 'First Spark',
    description: 'Transform lecture notes or a PDF into an active-recall deck',
    icon: 'Sparkles',
  },
  {
    id: 'spaced_explorer',
    title: 'Spaced Explorer',
    description: 'Complete an SM-2 spaced repetition review session',
    icon: 'Brain',
  },
  {
    id: 'streak_3',
    title: '3-Day Fire Streak',
    description: 'Study 3 consecutive days without missing a beat',
    icon: 'Flame',
  },
  {
    id: 'streak_7',
    title: '7-Day Unstoppable',
    description: 'Form a resilient neural habit with a week-long streak',
    icon: 'Zap',
  },
  {
    id: 'scholar_lvl3',
    title: 'Polymath Scholar',
    description: 'Earn 500 XP and reach Scholar Level 3',
    icon: 'GraduationCap',
  },
  {
    id: 'vault_secure',
    title: 'Encrypted Vault',
    description: 'Protect study notes with AES-256 or Biometric Auth',
    icon: 'ShieldCheck',
  },
  {
    id: 'pro_unlocked',
    title: 'Pro Pioneer',
    description: 'Unlock unlimited flashcard production and cloud sync',
    icon: 'Crown',
  },
  {
    id: 'collaborator',
    title: 'Study Squad',
    description: 'Share a collaborative deck with a peer or classmate',
    icon: 'Users',
  },
];
