/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  Brain,
  Sparkles,
  Play,
  BookOpen,
  Crown,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FolderOpen,
  Plus,
  WifiOff,
  Award,
  ImageIcon,
  Upload,
  CreditCard,
  CalendarOff,
  Undo2,
  Search,
  X,
} from 'lucide-react';
import { Deck, Flashcard, UserProfile } from '../types';
import { isCardDue } from '../utils/sm2';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { getSubjectCoverImage } from '../utils/imageCurator';
import { AdSenseBanner } from './AdSenseBanner';

interface DashboardProps {
  user: UserProfile;
  decks: Deck[];
  isOnline: boolean;
  onSelectDeck: (deck: Deck) => void;
  onStartReviewQueue: (cards: Flashcard[], title: string) => void;
  onOpenUpload: () => void;
  onOpenCreate: () => void;
  onOpenProModal: (step?: 'overview' | 'checkout' | 'receipt' | 'cancel') => void;
  onOpenBadgesModal: () => void;
  onCancelSubscription?: (reason?: string, immediate?: boolean) => Promise<void> | void;
  onReactivateSubscription?: () => Promise<void> | void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  decks,
  isOnline,
  onSelectDeck,
  onStartReviewQueue,
  onOpenUpload,
  onOpenCreate,
  onOpenProModal,
  onOpenBadgesModal,
  onCancelSubscription,
  onReactivateSubscription,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect all cards across all decks that are due today
  const allCards = decks.flatMap((d) => d.cards);
  const dueCards = allCards.filter((c) => isCardDue(c));

  // Extract distinct subjects
  const subjects = ['All', ...Array.from(new Set(decks.map((d) => d.subject)))];

  const filteredDecks = decks.filter((deck) => {
    const matchesSubject = selectedSubject === 'All' || deck.subject === selectedSubject;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      deck.title.toLowerCase().includes(q) ||
      deck.subject.toLowerCase().includes(q) ||
      deck.description.toLowerCase().includes(q) ||
      deck.cards.some(
        (c) =>
          c.question.toLowerCase().includes(q) ||
          c.answer.toLowerCase().includes(q) ||
          c.topic.toLowerCase().includes(q)
      );
    return matchesSubject && matchesSearch;
  });

  const dailyGoalPercent = Math.min(
    100,
    Math.round((user.cardsReviewedToday / (user.dailyGoal || 20)) * 100)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Offline Vault Active:</strong> You are currently offline. Your full library of lecture notes and spaced repetition decks remains 100% accessible.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">IndexedDB Cached</span>
        </div>
      )}

      {/* Hero / Daily Review Queue & Gamification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily SM-2 Queue Card (Col 1 & 2) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-100 shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Brain className="w-3.5 h-3.5" /> Spaced Repetition Queue
              </span>
              <span className="text-xs text-slate-500 font-medium">SM-2 Algorithm</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {dueCards.length > 0 ? (
                <>
                  <span className="text-indigo-600 font-mono">{dueCards.length} Cards</span> Due for Optimal Retention
                </>
              ) : (
                'All Decks Up to Date!'
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
              {dueCards.length > 0
                ? 'Reviewing right at the point of forgetting strengthens memory consolidation and maximizes long-term recall.'
                : 'You have cleared all scheduled spaced reviews for today. Great job! Explore new lecture topics or generate a new deck.'}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> ~{Math.ceil(dueCards.length * 0.8)} min session
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> End-to-End Encrypted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {dueCards.length > 0 && (
                <button
                  onClick={() => onStartReviewQueue(dueCards, 'Daily Review Queue')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Daily Review ({dueCards.length})</span>
                </button>
              )}

              {/* Standout Upload CTA */}
              <button
                onClick={onOpenUpload}
                className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50 hover:ring-indigo-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 stroke-[2.5] text-white group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Lecture Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daily Goal & Streak Gamification Card (Col 3) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Progress</span>
              <button
                onClick={onOpenBadgesModal}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Badges</span>
              </button>
            </div>

            {/* Streak & Daily Cards Meter */}
            <div className="flex items-center gap-4">
              {/* Circular Meter */}
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500 stroke-current transition-all duration-700 ease-out"
                    strokeWidth="3.5"
                    strokeDasharray={`${dailyGoalPercent}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 absolute" />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-slate-900">{user.cardsReviewedToday}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ {user.dailyGoal} cards</span>
                </div>
                <p className="text-xs text-orange-600 font-bold mt-0.5">
                  {user.currentStreak} Day{user.currentStreak === 1 ? '' : 's'} Study Streak!
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.cardsReviewedToday >= user.dailyGoal
                    ? 'Goal achieved today! +100 XP'
                    : `${user.dailyGoal - user.cardsReviewedToday} more to hit daily goal`}
                </p>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-900">Level {user.level} Scholar</span>
              <span className="text-slate-500 font-mono text-[11px]">{user.xp} XP</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (user.xp % 300) / 3)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free Tier Limitation vs Pro Membership Banner */}
      {!user.isPro ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-orange-50/40 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">NokurAI Free Tier</span>
                <span className="text-[11px] font-mono text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {user.dailyGeneratedCount} / 10 cards generated today
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Upgrade to Pro ($2.99/mo) for unlimited card generation, cloud storage, collaborative decks & offline vault.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenProModal('overview')}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shrink-0 transition-all cursor-pointer"
            >
              I Have Pro / Restore
            </button>
            <button
              onClick={() => onOpenProModal('checkout')}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shrink-0 shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 fill-slate-950" />
              <span>Upgrade to Pro ($2.99/mo)</span>
            </button>
          </div>
        </div>
      ) : user.isProCancelled ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Pro Auto-Renewal Cancelled</span>
                <span className="text-[11px] font-mono text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Access valid until {new Date(user.proSubscriptionExpiry || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                You retain unlimited cards and cloud sync until your period ends. Zero future charges will occur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onReactivateSubscription && (
              <button
                onClick={() => onReactivateSubscription()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reactivate Subscription</span>
              </button>
            )}
            <button
              onClick={() => onOpenProModal('overview')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Manage Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">NokurAI Pro Member</span>
                <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Active ({user.planBillingCycle || 'monthly'})
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Unlimited cards, AES-256 cloud vault & multi-device sync are active on your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenProModal('cancel')}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cancel your Pro subscription auto-renewal"
            >
              <CalendarOff className="w-3.5 h-3.5" />
              <span>Cancel Subscription</span>
            </button>
            <button
              onClick={() => onOpenProModal('overview')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Billing Details
            </button>
          </div>
        </div>
      )}

      {/* Prominent Quick Upload Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 border-2 border-indigo-200/80 p-5 sm:p-6 shadow-md shadow-indigo-100/40 group">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant AI Deck Creator</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Transform Lecture Notes, Slides, or Images into Flashcards
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload any PDF lecture file, PowerPoint slide deck, whiteboard picture, or audio recording to automatically generate active-recall flashcards with Spaced Repetition (SM-2).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onOpenCreate}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>+ Create One</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50 hover:ring-indigo-300 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-5 h-5 stroke-[2.5]" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      <div className="space-y-4">
        {/* Section Header & Subject Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              <span>Your Study Decks ({filteredDecks.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Categorized automatically by subject and difficulty</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search decks, topics, questions..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Direct Create One CTA */}
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100/80 text-amber-800 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Create One</span>
            </button>

            {/* Header Direct Upload CTA */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Upload File</span>
            </button>

            {/* Subject Filters */}
            <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Prominent Upload Tile in Grid */}
          <div
            onClick={onOpenUpload}
            className="rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/70 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[300px] shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200 mb-4 group-hover:scale-110 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-200">
              <Upload className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              + Upload Lecture Notes
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Drop PDFs, slides, whiteboard photos, or audio recordings to generate an interactive study deck
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white text-xs font-bold transition-all">
              <span>Choose File</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {filteredDecks.length === 0 && (
            <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-xs">
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-900">No matching study decks</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No decks matched "{searchQuery || selectedSubject}". Try a different term or upload fresh notes.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {filteredDecks.map((deck) => {
            const deckDueCount = deck.cards.filter((c) => isCardDue(c)).length;
            const masteredCount = deck.cards.filter((c) => c.repetitions >= 4).length;
            const masteryPercent =
              deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;

            const coverImg = deck.coverImage || getSubjectCoverImage(deck.subject);

            return (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer shadow-sm group flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Cover Image */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={coverImg}
                    alt={deck.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Badges on top of image */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-semibold text-[11px] shadow-sm">
                      {deck.subject}
                    </span>
                    {deckDueCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 backdrop-blur-md text-white font-mono font-bold text-[10px] shadow-sm">
                        {deckDueCount} Due
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 backdrop-blur-md text-white font-bold text-[10px] shadow-sm">
                        Done
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Description */}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                      {deck.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{deck.description}</p>
                  </div>

                {/* Footer: Mastery & Cards Count */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  {/* Mastery Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Mastery</span>
                      <span className="font-mono text-indigo-600 font-bold">{masteryPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${masteryPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3 font-medium">
                      <span>{deck.cards.length} Cards</span>
                      {deck.topicSteps && deck.topicSteps.length > 0 && (
                        <span>• {deck.topicSteps.length} Modules</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                      <span>Open Deck</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Google AdSense Study Session Display Unit (Free Tier) */}
      {!user.isPro && <AdSenseBanner className="mt-6" />}
    </div>
  );
};
