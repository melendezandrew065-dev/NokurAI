/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  Crown,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  Music,
  Presentation,
  FileCode,
  File,
  FileCheck2,
  Plus,
  Trash2,
  Wand2,
  Edit3,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_LECTURE_NOTES } from '../data/sampleNotes';
import { Deck, Flashcard, UserProfile } from '../types';
import { getSubjectCoverImage, getTopicIllustration } from '../utils/imageCurator';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onDeckCreated: (newDeck: Deck) => void;
  onOpenProModal: () => void;
  initialTab?: 'upload' | 'text' | 'samples' | 'create';
}

const POPULAR_TOPICS = [
  { title: '🧠 Cognitive Neuroscience & Memory', query: 'Neurobiology of Memory, Long-Term Potentiation, Hippocampal Consolidation, and Synaptic Plasticity' },
  { title: '⚛️ Quantum Computing & Qubits', query: 'Quantum Computing Principles, Qubits, Superposition, Entanglement, and Quantum Logic Gates' },
  { title: '🧬 CRISPR & Gene Editing', query: 'CRISPR-Cas9 Mechanism, Guide RNA, Double-Strand DNA Cleavage, and Genetic Engineering' },
  { title: '💻 Data Structures & Algorithms', query: 'Data Structures and Algorithms: Hash Maps, Binary Search Trees, Dynamic Programming, and Big-O Complexity' },
  { title: '📊 Microeconomics & Market Dynamics', query: 'Microeconomics: Supply and Demand Equilibrium, Price Elasticity, and Consumer Surplus' },
  { title: '⚡ Cellular Respiration & ATP', query: 'Cellular Respiration: Glycolysis, Krebs Cycle, Chemiosmosis, and ATP Synthase Mechanism' },
];

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Biology',
  'Cognitive Science',
  'Medicine',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Economics',
  'History',
  'Psychology',
  'General Study',
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  user,
  onDeckCreated,
  onOpenProModal,
  initialTab = 'upload',
}) => {
  const [tab, setTab] = useState<'upload' | 'text' | 'samples' | 'create'>(initialTab);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textNotes, setTextNotes] = useState('');
  const [hasRightsAgreed, setHasRightsAgreed] = useState(false);
  const [targetCount, setTargetCount] = useState<number>(user.isPro ? 15 : 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // "Create One" Sub-state
  const [createMode, setCreateMode] = useState<'ai_topic' | 'manual'>('ai_topic');
  const [aiTopic, setAiTopic] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Computer Science');
  const [manualDifficulty, setManualDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCards, setManualCards] = useState<
    Array<{ question: string; answer: string; topic: string; hint: string }>
  >([
    { question: '', answer: '', topic: '', hint: '' },
    { question: '', answer: '', topic: '', hint: '' },
    { question: '', answer: '', topic: '', hint: '' },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setTab(initialTab);
      setErrorMessage('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const remainingFreeToday = Math.max(0, 10 - user.dailyGeneratedCount);
  const isLimitReached = !user.isPro && remainingFreeToday <= 0;

  const getFileInfo = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      return { type: 'pdf' as const, label: 'PDF Document', icon: FileText, color: 'text-rose-400', badge: 'PDF' };
    }
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic|svg)$/i.test(name)) {
      return { type: 'image' as const, label: 'Lecture Photo / Whiteboard / Slide', icon: ImageIcon, color: 'text-cyan-400', badge: 'Image' };
    }
    if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(name)) {
      return { type: 'audio' as const, label: 'Audio Lecture Recording', icon: Music, color: 'text-purple-400', badge: 'Audio' };
    }
    if (/\.(pptx|ppt)$/i.test(name) || file.type.includes('presentationml')) {
      return { type: 'document' as const, label: 'PowerPoint Presentation', icon: Presentation, color: 'text-amber-400', badge: 'Slides' };
    }
    if (/\.(docx|doc)$/i.test(name) || file.type.includes('wordprocessingml')) {
      return { type: 'document' as const, label: 'Word Document', icon: FileText, color: 'text-blue-400', badge: 'Word' };
    }
    if (/\.(txt|md|markdown|csv|tsv|json|rtf|html|xml|py|js|ts|tsx|jsx|cpp|c|java|sql|sh)$/i.test(name)) {
      return { type: 'text' as const, label: 'Text / Code Notes', icon: FileCode, color: 'text-emerald-400', badge: 'Code/Text' };
    }
    return { type: 'other' as const, label: 'Uploaded Document', icon: File, color: 'text-indigo-400', badge: 'File' };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviewUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviewUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_LECTURE_NOTES)[0]) => {
    setTextNotes(sample.text);
    setTab('text');
    setHasRightsAgreed(true);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Manual Deck Creation
  const handleCreateManualDeck = () => {
    if (!manualTitle.trim()) {
      setErrorMessage('Please provide a title for your custom study deck.');
      return;
    }
    const validCards = manualCards.filter((c) => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) {
      setErrorMessage('Please add at least one complete flashcard (question and answer).');
      return;
    }

    const newDeckId = `deck-manual-${Date.now()}`;
    const subject = manualSubject || 'General Study';
    const deckCover = getSubjectCoverImage(subject);

    const formattedCards: Flashcard[] = validCards.map((c, index) => ({
      id: `card-${newDeckId}-${index}`,
      deckId: newDeckId,
      question: c.question.trim(),
      answer: c.answer.trim(),
      hint: c.hint.trim() || undefined,
      imageUrl: getTopicIllustration(c.topic || manualTitle, subject),
      imageCaption: c.topic ? `${c.topic} Diagram` : `${manualTitle} Concept`,
      subject: subject,
      topic: c.topic.trim() || manualTitle,
      difficulty: manualDifficulty,
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      history: [],
      createdAt: Date.now(),
    }));

    const newDeck: Deck = {
      id: newDeckId,
      title: manualTitle.trim(),
      subject: subject,
      description:
        manualDescription.trim() || `Custom created study deck covering ${manualTitle}.`,
      coverImage: deckCover,
      sourceType: 'text',
      sourceFileName: 'Manual_Study_Deck.deck',
      cards: formattedCards,
      topicSteps: [
        {
          stepNumber: 1,
          title: `${manualTitle} - Core Overview`,
          summary: `Fundamental principles and key concepts of ${manualTitle}.`,
          coreConcepts: [manualTitle, subject],
          checkpointQuestion: formattedCards[0].question,
          checkpointAnswer: formattedCards[0].answer,
          imageUrl: deckCover,
          isCompleted: false,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEncrypted: false,
    };

    onDeckCreated(newDeck);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    onClose();
  };

  // Main Submit handler (AI or File or Text)
  const handleSubmit = async () => {
    if (tab === 'create' && createMode === 'manual') {
      handleCreateManualDeck();
      return;
    }

    if (!hasRightsAgreed) {
      setErrorMessage('Please confirm that you own or hold the educational rights to this study material.');
      return;
    }

    if (isLimitReached) {
      onOpenProModal();
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setStatusMessage('Reading and preparing study material...');

    try {
      let payload: any = {
        targetCardCount: user.isPro ? targetCount : Math.min(targetCount, remainingFreeToday),
        userIsPro: user.isPro,
        dailyCount: user.dailyGeneratedCount,
      };

      let fileInfo = selectedFile ? getFileInfo(selectedFile) : null;

      if (tab === 'upload') {
        if (!selectedFile) {
          throw new Error('Please select any lecture file to upload.');
        }
        setStatusMessage(`Processing ${fileInfo?.label || 'file'}...`);
        const base64Data = await readFileAsBase64(selectedFile);
        payload = {
          ...payload,
          sourceType: fileInfo?.type || 'other',
          fileBase64: base64Data,
          fileName: selectedFile.name,
          fileMimeType: selectedFile.type,
        };
      } else if (tab === 'create' && createMode === 'ai_topic') {
        if (!aiTopic.trim()) {
          throw new Error('Please enter a topic or concept to create a study deck.');
        }
        setStatusMessage(`Researching and structuring topic: "${aiTopic.trim()}"...`);
        payload = {
          ...payload,
          sourceType: 'text',
          textNotes: `ACADEMIC LECTURE AND COMPREHENSIVE STUDY GUIDE: ${aiTopic.trim()}\n\nProvide deep-dive theoretical foundations, key formulas, mechanisms, active recall checkpoint questions, and step-by-step topic breakdown for students mastering ${aiTopic.trim()}.`,
          fileName: `${aiTopic.trim().replace(/\s+/g, '_')}_Deck.txt`,
        };
      } else {
        if (!textNotes.trim()) {
          throw new Error('Please enter or paste your lecture notes text.');
        }
        payload = {
          ...payload,
          sourceType: 'text',
          textNotes,
          fileName: 'Lecture_Notes.txt',
        };
      }

      setStatusMessage('NokurAI analyzing study material & synthesizing flashcards...');

      const res = await fetch('/api/extract-study-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'DAILY_LIMIT_REACHED') {
          onOpenProModal();
          throw new Error(data.message || 'Free tier daily limit reached (10 cards/day).');
        }
        throw new Error(data.message || 'Failed to extract flashcards from study material.');
      }

      setStatusMessage('Structuring Spaced Repetition (SM-2) schedules & difficulty levels...');

      const extracted = data.deck;
      const newDeckId = `deck-${Date.now()}`;

      const subject = extracted.subject || (tab === 'create' ? 'General Study' : 'Lecture Study');
      const deckCover = previewUrl || getSubjectCoverImage(subject);

      const formattedCards = (extracted.flashcards || []).map((c: any, index: number) => {
        const cardImg =
          previewUrl && index === 0
            ? previewUrl
            : c.imageUrl || getTopicIllustration(c.topic || '', subject);
        return {
          id: `card-${newDeckId}-${index}`,
          deckId: newDeckId,
          question: c.question,
          answer: c.answer,
          hint: c.hint || '',
          imageUrl: cardImg,
          imageCaption: c.imageCaption || (c.topic ? `${c.topic} Visual Diagram` : undefined),
          subject: c.subject || subject,
          topic: c.topic || 'Core Concept',
          difficulty: c.difficulty || 'Intermediate',
          keyFormulaOrConcept: c.keyFormulaOrConcept || '',
          repetitions: 0,
          interval: 1,
          easeFactor: 2.5,
          nextReviewDate: Date.now(),
          history: [],
          createdAt: Date.now(),
        };
      });

      const formattedTopicSteps = (extracted.topicSteps || []).map((step: any, idx: number) => ({
        stepNumber: step.stepNumber || idx + 1,
        title: step.title || `Module ${idx + 1}`,
        summary: step.summary || '',
        coreConcepts: step.coreConcepts || [],
        checkpointQuestion: step.checkpointQuestion || 'Explain this key concept.',
        checkpointAnswer: step.checkpointAnswer || 'Review the summary above.',
        imageUrl: getTopicIllustration(step.title || '', subject),
        isCompleted: false,
      }));

      const newDeck: Deck = {
        id: newDeckId,
        title: extracted.deckTitle || (tab === 'create' ? aiTopic : selectedFile?.name || 'New Study Deck'),
        subject: subject,
        description:
          extracted.description ||
          `Step-by-step topic breakdown and active recall flashcards created with NokurAI.`,
        coverImage: deckCover,
        sourceType: (payload.sourceType as any) || 'text',
        sourceFileName: payload.fileName,
        cards: formattedCards,
        topicSteps: formattedTopicSteps,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isEncrypted: false,
      };

      onDeckCreated(newDeck);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while generating study deck.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedFileInfo = selectedFile ? getFileInfo(selectedFile) : null;
  const SelectedIcon = selectedFileInfo?.icon || File;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create or Upload Study Deck</h3>
              <p className="text-xs text-slate-500">
                Generate flashcards automatically or create your own custom study deck
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

        {/* Daily limit badge */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Generation Limit:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                user.isPro
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : isLimitReached
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {user.isPro ? 'Unlimited (Pro Plan)' : `${user.dailyGeneratedCount} / 10 cards today`}
            </span>
          </div>
          {!user.isPro ? (
            <button
              onClick={onOpenProModal}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              Go Pro for Unlimited ($2.99)
            </button>
          ) : (
            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pro Member Active
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex border-b border-slate-200 gap-3 overflow-x-auto scrollbar-none bg-slate-50/50">
          <button
            onClick={() => setTab('create')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'create'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Create One (Instant / Custom)
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'upload'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setTab('text')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'text'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Notes
          </button>
          <button
            onClick={() => setTab('samples')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'samples'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sample Lectures
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* TAB 1: CREATE ONE */}
          {tab === 'create' && (
            <div className="space-y-4">
              {/* Sub-toggle: AI Topic vs Manual */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateMode('ai_topic')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    createMode === 'ai_topic'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Topic Generator (1-Click)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('manual')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    createMode === 'manual'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Manual Card Builder</span>
                </button>
              </div>

              {/* AI Topic Generator */}
              {createMode === 'ai_topic' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      What subject or concept would you like to study?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cognitive Neuroscience, Quantum Physics, Cellular Respiration..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Or select a popular study topic to create one instantly:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {POPULAR_TOPICS.map((topic, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setAiTopic(topic.title);
                            setHasRightsAgreed(true);
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                            aiTopic === topic.title
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-medium truncate">{topic.title}</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Card Builder */}
              {createMode === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Deck Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Organic Chemistry Reactions"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subject
                      </label>
                      <select
                        value={manualSubject}
                        onChange={(e) => setManualSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {SUBJECT_OPTIONS.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={manualDifficulty}
                        onChange={(e) => setManualDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Key formulas and exam review"
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        Flashcards ({manualCards.length})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setManualCards([
                            ...manualCards,
                            { question: '', answer: '', topic: '', hint: '' },
                          ])
                        }
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Card</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {manualCards.map((card, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                            <span>Card #{idx + 1}</span>
                            {manualCards.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setManualCards(manualCards.filter((_, i) => i !== idx))
                                }
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Front / Question *"
                            value={card.question}
                            onChange={(e) => {
                              const updated = [...manualCards];
                              updated[idx].question = e.target.value;
                              setManualCards(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <textarea
                            rows={2}
                            placeholder="Back / Answer *"
                            value={card.answer}
                            onChange={(e) => {
                              const updated = [...manualCards];
                              updated[idx].answer = e.target.value;
                              setManualCards(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Topic tag (optional)"
                              value={card.topic}
                              onChange={(e) => {
                                const updated = [...manualCards];
                                updated[idx].topic = e.target.value;
                                setManualCards(updated);
                              }}
                              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="Hint / Formula (optional)"
                              value={card.hint}
                              onChange={(e) => {
                                const updated = [...manualCards];
                                updated[idx].hint = e.target.value;
                                setManualCards(updated);
                              }}
                              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {tab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-indigo-400 bg-indigo-50/40'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    {previewUrl ? (
                      <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={previewUrl}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center border border-indigo-100">
                        <SelectedIcon
                          className={`w-7 h-7 ${selectedFileInfo?.color || 'text-indigo-600'}`}
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 max-w-sm truncate">
                          {selectedFile.name}
                        </span>
                        {selectedFileInfo && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-200">
                            {selectedFileInfo.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedFileInfo?.label} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="mt-2 text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Drop any lecture notes file here, or browse
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PDF lecture notes, Word documents, PowerPoint slides, whiteboard photos, audio, code, and text
                      </p>
                    </div>
                    <span className="inline-block px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm shadow-indigo-600/30">
                      Select Any File
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEXT NOTES */}
          {tab === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Paste your lecture notes or textbook summary
              </label>
              <textarea
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
                placeholder="Paste key formulas, lecture slides, professor takeaways, transcriptions, or chapter text here..."
                rows={8}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Supports Markdown, code, transcripts, or raw text</span>
                <span>{textNotes.length} characters</span>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLES */}
          {tab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Select a curated academic lecture to test AI extraction immediately:
              </p>
              <div className="grid gap-2.5">
                {SAMPLE_LECTURE_NOTES.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {sample.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                          {sample.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{sample.text.slice(0, 100)}...</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Card count (shown unless manual builder) */}
          {!(tab === 'create' && createMode === 'manual') && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-800">Target Flashcard Count</span>
                <p className="text-[11px] text-slate-500">
                  {user.isPro
                    ? 'Pro: Generate up to 30 cards per session'
                    : `Free limit: up to ${remainingFreeToday} remaining today`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={user.isPro ? 30 : Math.max(3, remainingFreeToday)}
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(3, Number(e.target.value)))}
                  disabled={isLimitReached}
                  className="w-16 bg-white border border-slate-300 rounded-lg py-1 px-2 text-center text-xs text-slate-900 font-mono shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Academic Rights Affirmation */}
          {!(tab === 'create' && createMode === 'manual') && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRightsAgreed}
                  onChange={(e) => setHasRightsAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-amber-800">
                    Academic Integrity & Rights Affirmation:
                  </span>{' '}
                  I confirm that I own these study materials or have explicit educational rights and fair use authorization to process this content.
                </div>
              </label>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing state display */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>{statusMessage}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Structuring step-by-step topic breakdown, active-recall questions, SM-2 intervals, and concept diagrams...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with AES-256</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                (tab === 'create' && createMode === 'manual'
                  ? !manualTitle.trim()
                  : !hasRightsAgreed ||
                    (tab === 'upload' && !selectedFile) ||
                    (tab === 'text' && !textNotes.trim()) ||
                    (tab === 'create' && createMode === 'ai_topic' && !aiTopic.trim()))
              }
              className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-xl text-white flex items-center gap-2 transition-all cursor-pointer ${
                isLimitReached && !(tab === 'create' && createMode === 'manual')
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 ring-2 ring-amber-400/40'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:via-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isLimitReached && !(tab === 'create' && createMode === 'manual') ? (
                <>
                  <Crown className="w-4 h-4" />
                  Upgrade to Generate ($2.99)
                </>
              ) : tab === 'create' ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{createMode === 'manual' ? 'Save & Create Deck' : 'Create Deck Now'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
