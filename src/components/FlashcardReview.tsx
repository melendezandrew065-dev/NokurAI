/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  RotateCw,
  Volume2,
  Lightbulb,
  CheckCircle,
  Brain,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  ZoomIn,
  ImageIcon,
  VolumeX,
} from 'lucide-react';
import { Flashcard } from '../types';
import { calculateSM2, formatInterval, getCardMasteryStatus } from '../utils/sm2';
import { ImageModal } from './ImageModal';
import {
  playCardFlipSound,
  playSuccessChime,
  playRepeatTone,
  isSoundEnabled,
  toggleSound,
} from '../utils/audioFeedback';

interface FlashcardReviewProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
  onEarnXp: (amount: number, reason: string) => void;
  deckTitle: string;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  isOpen,
  onClose,
  cards,
  onUpdateCard,
  onEarnXp,
  deckTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [qualityStats, setQualityStats] = useState<number[]>([]);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption?: string; title?: string } | null>(null);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setIsCompleted(false);
      setSessionReviewedCount(0);
      setQualityStats([]);
    }
  }, [isOpen]);

  const currentCard = cards[currentIndex];

  const handleToggleAudio = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  const handleFlipCard = () => {
    playCardFlipSound();
    setIsFlipped((prev) => !prev);
  };

  // Keyboard shortcut listeners (Space to flip, 1-4 for ratings)
  useEffect(() => {
    if (!isOpen || isCompleted || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlipCard();
      } else if (isFlipped) {
        if (e.key === '1') handleRate(0);
        else if (e.key === '2') handleRate(2);
        else if (e.key === '3') handleRate(3);
        else if (e.key === '4') handleRate(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, isCompleted, currentCard]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = (quality: number) => {
    if (!currentCard) return;

    if (quality >= 3) {
      playSuccessChime();
    } else {
      playRepeatTone();
    }

    const { repetitions, interval, easeFactor, nextReviewDate, historyItem } = calculateSM2(
      currentCard,
      quality
    );

    const updatedCard: Flashcard = {
      ...currentCard,
      repetitions,
      interval,
      easeFactor,
      lastReviewDate: Date.now(),
      nextReviewDate,
      history: [...(currentCard.history || []), historyItem],
    };

    onUpdateCard(updatedCard);
    setQualityStats((prev) => [...prev, quality]);
    setSessionReviewedCount((prev) => prev + 1);

    // Award XP based on recall quality
    const xpBonus = quality >= 4 ? 20 : quality >= 3 ? 15 : 10;
    onEarnXp(xpBonus, 'Flashcard recall practice');

    // Move to next card or complete session
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#38bdf8', '#10b981', '#f59e0b'],
      });
      onEarnXp(50, 'Completed Spaced Repetition Session!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 max-w-[200px] sm:max-w-xs truncate">{deckTitle}</h3>
              <p className="text-[11px] text-slate-500">SM-2 Spaced Repetition Review</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Feedback Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundOn
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={soundOn ? 'Sound cues enabled (click to mute)' : 'Sound cues muted (click to enable)'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {!isCompleted && cards.length > 0 && (
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && cards.length > 0 && (
          <div className="w-full bg-slate-100 h-1">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-1 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col justify-center bg-white">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 mb-1">All Caught Up!</h4>
              <p className="text-xs text-slate-500">No cards are due for review right now. Great job!</p>
            </div>
          ) : isCompleted ? (
            /* Session Completed Screen */
            <div className="text-center py-6 sm:py-8 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">Review Session Complete!</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  You reviewed {sessionReviewedCount} cards with optimal SM-2 spacing.
                </p>
              </div>

              {/* Session Retention Stats */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Cards Studied</span>
                  <span className="text-lg font-mono font-bold text-slate-900">{sessionReviewedCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">XP Earned</span>
                  <span className="text-lg font-mono font-bold text-amber-600">
                    +{sessionReviewedCount * 15 + 50}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Avg Quality</span>
                  <span className="text-lg font-mono font-bold text-emerald-600">
                    {qualityStats.length > 0
                      ? (qualityStats.reduce((a, b) => a + b, 0) / qualityStats.length).toFixed(1)
                      : '5.0'} / 5
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* 3D Flashcard Container */
            <div className="w-full max-w-lg mx-auto flex flex-col items-center">
              {/* Card Meta Badges */}
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]">
                    {currentCard.subject}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      currentCard.difficulty === 'Beginner'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : currentCard.difficulty === 'Intermediate'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                </div>

                {/* SM-2 Mastery Tag */}
                {(() => {
                  const status = getCardMasteryStatus(currentCard);
                  return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeBg}`}>
                      {status.label} (Interval: {formatInterval(currentCard.interval)})
                    </span>
                  );
                })()}
              </div>

              {/* 3D Interactive Card */}
              <div
                onClick={handleFlipCard}
                className="w-full min-h-[280px] sm:min-h-[320px] rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-xl p-6 sm:p-8 cursor-pointer flex flex-col justify-between relative group transition-all hover:border-indigo-400"
              >
                {/* Speech & Flip CTA */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(isFlipped ? currentCard.answer : currentCard.question);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" /> Click or Space to {isFlipped ? 'see Question' : 'reveal Answer'}
                  </span>
                </div>

                {/* Card Content (Question or Answer) */}
                <div className="my-auto py-2 text-center">
                  {!isFlipped ? (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2">
                        Question
                      </span>
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        {currentCard.question}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-2">
                        Answer & Key Concept
                      </span>
                      <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                        {currentCard.answer}
                      </p>

                      {currentCard.keyFormulaOrConcept && (
                        <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 font-mono text-xs text-indigo-800">
                          {currentCard.keyFormulaOrConcept}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Concept Diagram / Image */}
                  {currentCard.imageUrl && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage({
                          url: currentCard.imageUrl!,
                          caption: currentCard.imageCaption,
                          title: currentCard.topic,
                        });
                      }}
                      className="mt-3 max-h-36 sm:max-h-44 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group/img cursor-zoom-in bg-slate-100"
                      title="Click to enlarge diagram"
                    >
                      <img
                        src={currentCard.imageUrl}
                        alt={currentCard.imageCaption || 'Concept diagram'}
                        className="w-full h-36 sm:h-44 object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                      <div className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/60 backdrop-blur-sm text-white opacity-80 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 text-[10px]">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </div>
                      {currentCard.imageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 backdrop-blur-sm text-[11px] text-white px-2 py-0.5 text-center truncate border-t border-slate-800">
                          {currentCard.imageCaption}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom hint drawer */}
                <div className="pt-2 border-t border-slate-200">
                  {currentCard.hint && !isFlipped && (
                    <div>
                      {showHint ? (
                        <p className="text-xs text-amber-800 italic text-center">
                          Hint: {currentCard.hint}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="mx-auto flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Need a hint?
                        </button>
                      )}
                    </div>
                  )}
                  {isFlipped && (
                    <p className="text-[11px] text-slate-500 text-center">
                      Rate how easily you recalled this information:
                    </p>
                  )}
                </div>
              </div>

              {/* SM-2 Response Grading Buttons (Active when flipped) */}
              {isFlipped ? (
                <div className="w-full grid grid-cols-4 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <button
                    onClick={() => handleRate(0)}
                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Key: 1"
                  >
                    <span className="text-xs font-bold">Blackout</span>
                    <span className="text-[10px] text-rose-600 mt-0.5">1 day</span>
                  </button>

                  <button
                    onClick={() => handleRate(2)}
                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Key: 2"
                  >
                    <span className="text-xs font-bold">Hard</span>
                    <span className="text-[10px] text-amber-600 mt-0.5">1-2 days</span>
                  </button>

                  <button
                    onClick={() => handleRate(3)}
                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Key: 3"
                  >
                    <span className="text-xs font-bold">Good</span>
                    <span className="text-[10px] text-indigo-600 mt-0.5">Optimal</span>
                  </button>

                  <button
                    onClick={() => handleRate(5)}
                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Key: 4"
                  >
                    <span className="text-xs font-bold">Easy</span>
                    <span className="text-[10px] text-emerald-600 mt-0.5">+EF Boost</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    Reveal Answer (Space)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image Zoom */}
      <ImageModal
        isOpen={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        imageUrl={zoomedImage?.url || null}
        caption={zoomedImage?.caption}
        title={zoomedImage?.title}
      />
    </div>
  );
};
