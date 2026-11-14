/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Brain,
  Flame,
  Crown,
  Shield,
  Wifi,
  WifiOff,
  User,
  Lock,
  Sparkles,
  RefreshCw,
  Smartphone,
  Laptop,
  Upload,
  Radio,
  CreditCard,
} from 'lucide-react';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  user: UserProfile;
  isOnline: boolean;
  onOpenUpload: () => void;
  onOpenCreate?: () => void;
  onOpenProModal: (step?: 'overview' | 'checkout' | 'receipt' | 'cancel') => void;
  onOpenAuthModal: () => void;
  onLockApp: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'adsense') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isOnline,
  onOpenUpload,
  onOpenCreate,
  onOpenProModal,
  onOpenAuthModal,
  onLockApp,
  onSyncNow,
  isSyncing,
  onOpenLegal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Nokur<span className="text-indigo-600">AI</span></span>
              {user.isPro ? (
                <button
                  type="button"
                  onClick={() => onOpenProModal('overview')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 uppercase tracking-wide shadow-xs cursor-pointer transition-all hover:scale-105"
                  title="Manage NokurAI Pro Subscription & Billing"
                >
                  <Crown className="w-3 h-3" /> Pro
                </button>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Free
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Spaced Repetition & Lecture Notes Engine</p>
          </div>
        </div>

        {/* Center: Gamification Stats & Offline indicator */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-700 font-semibold" title="Current Daily Study Streak">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{user.currentStreak} Day{user.currentStreak === 1 ? '' : 's'} Streak</span>
          </div>

          {/* XP & Level */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-200/60 text-indigo-900 font-medium">
            <span className="font-bold">Lvl {user.level}</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (user.xp % 300) / 3)}%` }}
              />
            </div>
            <span className="text-slate-500">{user.xp} XP</span>
          </div>

          {/* Offline / Online status */}
          <div className="flex items-center gap-1.5 text-slate-500">
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]" title="Online & Connected">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 text-[11px]" title="Offline mode active - cards cached locally">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Vault</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-App PWA Install Prompt */}
          <PWAInstallButton />

          {/* High-visibility Quick Upload CTA */}
          <button
            onClick={onOpenUpload}
            className="group relative flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-400/50 hover:ring-indigo-300 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            title="Upload lecture notes, PDFs, slides, images, or audio"
          >
            <span className="relative flex items-center justify-center">
              <Upload className="w-4 h-4 stroke-[2.5] text-white group-hover:-translate-y-0.5 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full" />
            </span>
            <span className="font-bold tracking-tight">Upload</span>
          </button>

          {/* Direct Create One CTA */}
          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="Create a new study deck or flashcards"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Create One</span>
            </button>
          )}

          {/* Pro Upgrade Button (if Free) */}
          {!user.isPro ? (
            <button
              onClick={() => onOpenProModal('checkout')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 hover:from-amber-400 to-orange-500 hover:to-orange-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer hover:scale-105 active:scale-95"
              title="Upgrade to Pro with Card Payment"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade ($2.99)</span>
            </button>
          ) : (
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Sync notes across devices"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sync Cloud</span>
            </button>
          )}

          {/* AdSense & Legal status button */}
          {onOpenLegal && (
            <button
              onClick={() => onOpenLegal('adsense')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200 transition-colors"
              title="Google AdSense Crawler & ads.txt Status"
            >
              <Radio className="w-4 h-4" />
            </button>
          )}

          {/* Privacy Lock button */}
          <button
            onClick={onLockApp}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Lock Notes with Biometrics / PIN"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* User Account / Profile */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-xs">
              {user.name ? user.name.slice(0, 1) : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate text-slate-800">{user.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
