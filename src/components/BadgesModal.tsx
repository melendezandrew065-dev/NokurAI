/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Award,
  Sparkles,
  Brain,
  Flame,
  Zap,
  GraduationCap,
  ShieldCheck,
  Crown,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { UserProfile } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-purple-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Crown':
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 'Users':
        return <Users className="w-6 h-6 text-rose-400" />;
      default:
        return <Award className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Study Badges & Achievements</h3>
              <p className="text-xs text-slate-500">
                Unlocked: {user.unlockedBadges.length} of {ALL_ACHIEVEMENTS.length} milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto space-y-3 bg-white">
          {ALL_ACHIEVEMENTS.map((badge) => {
            const isUnlocked = user.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-slate-50 border-slate-200 shadow-xs'
                    : 'bg-slate-50/40 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {isUnlocked ? getIcon(badge.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{badge.title}</span>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
