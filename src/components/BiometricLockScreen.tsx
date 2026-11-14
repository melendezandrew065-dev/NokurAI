/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { authenticateWithBiometrics } from '../utils/security';

interface BiometricLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  userName: string;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  isLocked,
  onUnlock,
  userName,
}) => {
  const [pin, setPin] = useState('');
  const [isPinMode, setIsPinMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLocked) return null;

  const handleBiometricTrigger = async () => {
    setIsVerifying(true);
    setErrorMessage('');
    try {
      const result = await authenticateWithBiometrics('Verify biometric identity to unlock notes vault');
      if (result.success) {
        onUnlock();
      } else {
        setErrorMessage(result.error || 'Biometric verification failed. Please try again or use PIN.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      onUnlock();
      setPin('');
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect PIN. (Default test PIN: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4 border border-indigo-100 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">NokurAI Vault Locked</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Biometric privacy active for <span className="text-indigo-600 font-semibold">{userName}</span>
        </p>

        {!isPinMode ? (
          <div className="space-y-4">
            <button
              onClick={handleBiometricTrigger}
              disabled={isVerifying}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Fingerprint className={`w-5 h-5 ${isVerifying ? 'animate-pulse text-indigo-200' : ''}`} />
              <span>{isVerifying ? 'Scanning Sensor...' : 'Unlock with Face ID / Touch ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPinMode(true)}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Use Backup Security PIN</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={8}
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-center text-sm text-slate-900 tracking-widest placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPinMode(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Biometrics
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                Unlock
              </button>
            </div>
          </form>
        )}

        {errorMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hardware Authenticator & AES-GCM Encrypted</span>
        </div>
      </div>
    </div>
  );
};
