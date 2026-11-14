/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Award,
} from 'lucide-react';
import { Flashcard } from '../types';
import { playSuccessChime, playRepeatTone } from '../utils/audioFeedback';

interface QuizModeProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  deckTitle: string;
  onEarnXp: (amount: number, reason: string) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  isOpen,
  onClose,
  cards,
  deckTitle,
  onEarnXp,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  // Generate 3 distractors from other cards or plausible variants
  const getOptions = () => {
    const correctAnswer = currentCard.answer;
    const otherAnswers = cards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => c.answer);

    // Shuffle and pick up to 3 distractors
    const shuffledOthers = [...otherAnswers].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correctAnswer, ...shuffledOthers];
    return combined.sort(() => 0.5 - Math.random());
  };

  const [options] = useState<string[]>(() => getOptions());

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentCard.answer;
    if (isCorrect) {
      playSuccessChime();
      setScore((prev) => prev + 1);
      onEarnXp(20, 'Quiz question answered correctly');
    } else {
      playRepeatTone();
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      confetti({ particleCount: 70, spread: 60 });
      onEarnXp(40, 'Completed Mastery Quiz');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{deckTitle} - Quiz Test</h3>
            <p className="text-xs text-slate-500">Evaluate retrieval strength under test conditions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white">
          {!isComplete ? (
            <div className="space-y-6">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Question {currentIndex + 1} of {cards.length}</span>
                <span className="font-mono font-bold text-indigo-600">Score: {score}</span>
              </div>

              {/* Question */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  {currentCard.topic} • {currentCard.difficulty}
                </span>
                <p className="text-base font-bold text-slate-900 leading-relaxed">{currentCard.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {options.map((option, idx) => {
                  let buttonStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                  if (isAnswered) {
                    if (option === currentCard.answer) {
                      buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold';
                    } else if (option === selectedAnswer) {
                      buttonStyle = 'bg-rose-50 border-rose-400 text-rose-800';
                    } else {
                      buttonStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(option)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-3 cursor-pointer shadow-xs ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && option === currentCard.answer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isAnswered && option === selectedAnswer && option !== currentCard.answer && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>{currentIndex < cards.length - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                <Award className="w-8 h-8" />
              </div>

              <h4 className="text-2xl font-black text-slate-900">Quiz Completed!</h4>
              <p className="text-sm text-slate-600">
                You scored <span className="font-bold text-indigo-600">{score}</span> out of{' '}
                <span className="font-bold text-slate-900">{cards.length}</span> ({Math.round((score / cards.length) * 100)}%)
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
