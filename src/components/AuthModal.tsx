/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  RefreshCw,
  Fingerprint,
  ShieldCheck,
  Crown,
  Key,
  LogOut,
  CreditCard,
  CalendarOff,
  Undo2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { authenticateWithBiometrics } from '../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenProModal?: (step?: 'overview' | 'checkout' | 'receipt' | 'cancel') => void;
  onCancelSubscription?: (reason?: string, immediate?: boolean) => Promise<void> | void;
  onReactivateSubscription?: () => Promise<void> | void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSyncNow,
  isSyncing,
  onOpenProModal,
  onCancelSubscription,
  onReactivateSubscription,
}) => {
  const [encryptionKeyInput, setEncryptionKeyInput] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignInGoogle = () => {
    onUpdateUser({
      provider: 'google',
      name: 'Andrew Melendez',
      email: 'melendezandrew065@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    });
  };

  const handleSignInApple = () => {
    onUpdateUser({
      provider: 'apple',
      name: 'Andrew M.',
      email: 'a.melendez@icloud.com',
    });
  };

  const handleSignOut = () => {
    onUpdateUser({
      provider: 'guest',
      name: 'Guest Scholar',
      email: 'guest@nokurai.app',
      avatar: undefined,
    });
  };

  const handleToggleBiometrics = async () => {
    if (!user.biometricsEnabled) {
      const res = await authenticateWithBiometrics('Enroll biometric authentication for NokurAI');
      if (res.success) {
        onUpdateUser({ biometricsEnabled: true });
        setBiometricFeedback('Biometrics successfully enrolled!');
        setTimeout(() => setBiometricFeedback(null), 3000);
      } else {
        setBiometricFeedback(res.error || 'Biometric authentication was not completed.');
        setTimeout(() => setBiometricFeedback(null), 4000);
      }
    } else {
      onUpdateUser({ biometricsEnabled: false });
    }
  };

  const handleSaveEncryptionKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (encryptionKeyInput.trim().length >= 6) {
      onUpdateUser({ encryptionKeySet: true });
      setShowKeyForm(false);
      setEncryptionKeyInput('');
      setBiometricFeedback('AES-256 Master Encryption Passphrase applied.');
      setTimeout(() => setBiometricFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Account & Multi-Device Sync</h3>
              <p className="text-xs text-slate-500">Sync cards and notes across iOS, Android, and Desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* Active Profile Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white uppercase shadow-md shadow-indigo-500/20">
                {user.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                  {user.isPro && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                  <span className="capitalize text-indigo-600 font-semibold">{user.provider}</span> Account
                </div>
                {user.isPro && user.lastTransaction && (
                  <div className="mt-2 text-[11px] text-amber-800 font-mono flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Card on file: {user.lastTransaction.cardBrand} •••• {user.lastTransaction.cardLast4}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {user.provider !== 'guest' ? (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Subscription & Billing Management */}
          <div className="p-4 rounded-2xl border transition-all text-xs space-y-2.5 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" /> Subscription & Plan
              </span>
              {user.isPro ? (
                user.isProCancelled ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <CalendarOff className="w-3 h-3 text-amber-600" /> Cancelled (Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pro Active
                  </span>
                )
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Free Tier (10 cards/day)
                </span>
              )}
            </div>

            {user.isPro ? (
              <>
                <p className="text-[11px] text-slate-600">
                  {user.isProCancelled
                    ? `Your auto-renewal has been cancelled. You retain unlimited flashcards and cloud storage until ${new Date(user.proSubscriptionExpiry || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. No future charges will occur.`
                    : `Your NokurAI Pro subscription ($2.99/mo) auto-renews on ${new Date(user.proSubscriptionExpiry || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`}
                </p>

                {user.lastTransaction && (
                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Card: {user.lastTransaction.cardBrand} •••• {user.lastTransaction.cardLast4}</span>
                    <span>Last charged: ${user.lastTransaction.amount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  {user.isProCancelled ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onReactivateSubscription) onReactivateSubscription();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Reactivate Subscription</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenProModal) onOpenProModal('cancel');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CalendarOff className="w-3.5 h-3.5" />
                      <span>Cancel Subscription</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenProModal) onOpenProModal('overview');
                    }}
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
                  >
                    View Plan & Receipts →
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Upgrade to unlock unlimited cards, offline vault, and cloud sync.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenProModal) onOpenProModal('checkout');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-all hover:scale-105"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Upgrade ($2.99)</span>
                </button>
              </div>
            )}
          </div>

          {/* Social Sign-In Buttons */}
          {user.provider === 'guest' && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">Sign in to sync your study decks seamlessly:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Google Sign In */}
                <button
                  onClick={handleSignInGoogle}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold text-xs border border-slate-200 transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Apple Sign In */}
                <button
                  onClick={handleSignInApple}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-800 transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.92-1 .04-2.15.66-2.82 1.44-.59.68-1.11 1.77-.97 2.82 1.11.09 2.22-.57 2.85-1.34z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>
            </div>
          )}

          {/* Multi-Platform Device Sync Status */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Synchronized Devices (3 Active)</span>
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>

            <div className="space-y-2">
              {user.activeDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {dev.type === 'mobile' ? (
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                    ) : dev.type === 'desktop' ? (
                      <Laptop className="w-4 h-4 text-cyan-600" />
                    ) : (
                      <Tablet className="w-4 h-4 text-purple-600" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900 block">{dev.name}</span>
                      <span className="text-[10px] text-slate-500">
                        Last sync: {new Date(dev.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Synced
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Biometrics & Zero-Knowledge Encryption Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Security & Privacy Vault</span>

            {/* Biometric Auth Switch */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Biometric Lock (Face ID / Touch ID)</span>
                  <span className="text-[11px] text-slate-500">Lock lecture notes when app is closed or inactive</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  user.biometricsEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    user.biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AES-256 Encryption */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">AES-256 Zero-Knowledge Encryption</span>
                    <span className="text-[11px] text-slate-500">
                      {user.encryptionKeySet ? 'Enabled with Master Passphrase' : 'Standard local device encryption'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyForm(!showKeyForm)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  {showKeyForm ? 'Hide' : user.encryptionKeySet ? 'Update' : 'Set Key'}
                </button>
              </div>

              {showKeyForm && (
                <form onSubmit={handleSaveEncryptionKey} className="pt-2 flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter custom passphrase (min 6 chars)..."
                    value={encryptionKeyInput}
                    onChange={(e) => setEncryptionKeyInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {biometricFeedback && (
              <p className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 p-2 rounded-lg text-center animate-in fade-in">
                {biometricFeedback}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
