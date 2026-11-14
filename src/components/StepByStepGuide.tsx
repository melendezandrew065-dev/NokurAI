/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  BookOpen,
  Award,
  Zap,
  ZoomIn,
} from 'lucide-react';
import { Deck, TopicStep } from '../types';
import { ImageModal } from './ImageModal';

interface StepByStepGuideProps {
  deck: Deck;
  onUpdateDeck: (updatedDeck: Deck) => void;
  onEarnXp: (amount: number, reason: string) => void;
  onStartDeckReview: (specificTopic?: string) => void;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({
  deck,
  onUpdateDeck,
  onEarnXp,
  onStartDeckReview,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [revealedCheckpoints, setRevealedCheckpoints] = useState<Record<number, boolean>>({});
  const [zoomedImg, setZoomedImg] = useState<{ url: string; title: string } | null>(null);

  const steps = deck.topicSteps || [];
  const currentStep: TopicStep | undefined = steps[activeStepIndex];

  const toggleCheckpointAnswer = (stepNum: number) => {
    setRevealedCheckpoints((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const markStepComplete = (stepIndex: number) => {
    const updatedSteps = [...steps];
    const isNowCompleted = !updatedSteps[stepIndex].isCompleted;
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      isCompleted: isNowCompleted,
    };

    onUpdateDeck({
      ...deck,
      topicSteps: updatedSteps,
      updatedAt: Date.now(),
    });

    if (isNowCompleted) {
      onEarnXp(35, `Mastered Topic Step ${stepIndex + 1}`);
    }
  };

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  if (steps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">No step-by-step topic breakdown generated for this deck yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Guided Pathway</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{deck.subject}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Step-by-Step Topic Walkthrough</h3>
          <p className="text-xs text-slate-600">Master underlying concepts sequentially before active-recall testing</p>
        </div>

        {/* Pathway Progress */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700">
              {completedCount} of {steps.length} Steps
            </span>
            <div className="text-[11px] text-indigo-600 font-mono font-bold">{progressPercent}% Mastered</div>
          </div>
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 stroke-current transition-all duration-700 ease-out"
                strokeWidth="3.5"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Zap className="w-5 h-5 text-indigo-600 absolute" />
          </div>
        </div>
      </div>

      {/* Step Tabs Navigation */}
      <div className="flex overflow-x-auto p-3 bg-slate-50 border-b border-slate-200 gap-2 scrollbar-none">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs'
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              ) : (
                <Circle className="w-3.5 h-3.5 opacity-60" />
              )}
              <span>Step {step.stepNumber}: {step.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      {currentStep && (
        <div className="p-6 space-y-6">
          {/* Step Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold">
                Step {currentStep.stepNumber} of {steps.length}
              </span>
              {currentStep.isCompleted && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Step Completed
                </span>
              )}
            </div>
            <h4 className="text-xl font-bold text-slate-900 tracking-tight">{currentStep.title}</h4>
          </div>

          {/* Core Concept Pills */}
          {currentStep.coreConcepts && currentStep.coreConcepts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Key Vocabulary & Anchors</p>
              <div className="flex flex-wrap gap-2">
                {currentStep.coreConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conceptual Diagram / Illustration */}
          {currentStep.imageUrl && (
            <div
              onClick={() => setZoomedImg({ url: currentStep.imageUrl!, title: currentStep.title })}
              className="h-44 sm:h-56 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group/img cursor-zoom-in bg-slate-100"
              title="Click to zoom concept diagram"
            >
              <img
                src={currentStep.imageUrl}
                alt={currentStep.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 opacity-90 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-medium shadow-xs">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Inspect Visual Diagram</span>
              </div>
            </div>
          )}

          {/* Explanation / Summary */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Core Conceptual Breakdown</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{currentStep.summary}</p>
          </div>

          {/* Checkpoint Question & Self-Evaluation */}
          {currentStep.checkpointQuestion && (
            <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Knowledge Checkpoint (Active Recall Verification)</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{currentStep.checkpointQuestion}</p>

              {revealedCheckpoints[currentStep.stepNumber] ? (
                <div className="p-3.5 rounded-lg bg-white border border-indigo-200 text-xs text-indigo-950 shadow-xs animate-in fade-in duration-200">
                  <span className="font-bold text-indigo-600 block mb-1">Answer & Verification:</span>
                  {currentStep.checkpointAnswer}
                </div>
              ) : (
                <button
                  onClick={() => toggleCheckpointAnswer(currentStep.stepNumber)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  Reveal Answer & Solution
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => markStepComplete(activeStepIndex)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStep.isCompleted
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentStep.isCompleted ? 'Mark as Incomplete' : 'Complete Step (+35 XP)'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartDeckReview(currentStep.title)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Practice Flashcards for this Topic
              </button>

              {activeStepIndex < steps.length - 1 && (
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageModal
        isOpen={!!zoomedImg}
        onClose={() => setZoomedImg(null)}
        imageUrl={zoomedImg?.url || null}
        title={zoomedImg?.title}
      />
    </div>
  );
};
