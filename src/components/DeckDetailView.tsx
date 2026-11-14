/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  BookOpen,
  GraduationCap,
  Plus,
  Share2,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Download,
  Copy,
  Check,
  Crown,
  Sparkles,
  Image as ImageIcon,
  ZoomIn,
  Upload,
  FileText,
} from 'lucide-react';
import { Deck, DifficultyLevel, Flashcard } from '../types';
import { getCardMasteryStatus, formatInterval } from '../utils/sm2';
import { StepByStepGuide } from './StepByStepGuide';
import { ImageModal } from './ImageModal';
import { getSubjectCoverImage } from '../utils/imageCurator';

interface DeckDetailViewProps {
  deck: Deck;
  onBack: () => void;
  onUpdateDeck: (updated: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onStartReview: (cards: Flashcard[]) => void;
  onStartQuiz: (cards: Flashcard[]) => void;
  onEarnXp: (amount: number, reason: string) => void;
  isPro: boolean;
  onOpenProModal: () => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({
  deck,
  onBack,
  onUpdateDeck,
  onDeleteDeck,
  onStartReview,
  onStartQuiz,
  onEarnXp,
  isPro,
  onOpenProModal,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'guide'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [newTopic, setNewTopic] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption?: string; title?: string } | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(deck.shareCode || null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter cards
  const subtopics = Array.from(new Set(deck.cards.map((c) => c.topic)));

  const filteredCards = deck.cards.filter((card) => {
    const matchesSearch =
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'All' || card.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || card.topic === selectedTopic;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `card-${deck.id}-${Date.now()}`,
      deckId: deck.id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      imageCaption: newImageCaption.trim() || undefined,
      subject: deck.subject,
      topic: newTopic.trim() || 'Custom',
      difficulty: newDifficulty,
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      history: [],
      createdAt: Date.now(),
    };

    onUpdateDeck({
      ...deck,
      cards: [newCard, ...deck.cards],
      updatedAt: Date.now(),
    });

    setNewQuestion('');
    setNewAnswer('');
    setNewImageUrl('');
    setNewImageCaption('');
    setShowAddCard(false);
    onEarnXp(15, 'Created new custom flashcard');
  };

  const handleDeleteCard = (cardId: string) => {
    onUpdateDeck({
      ...deck,
      cards: deck.cards.filter((c) => c.id !== cardId),
      updatedAt: Date.now(),
    });
  };

  const handleGenerateShareCode = async () => {
    if (!isPro) {
      onOpenProModal();
      return;
    }

    try {
      const res = await fetch('/api/share-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deck,
          authorEmail: 'student@nokurai.app',
          isPro: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShareCode(data.shareCode);
        onUpdateDeck({ ...deck, shareCode: data.shareCode, isSharedCollaborative: true });
      }
    } catch {
      const fallbackCode = `NOK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setShareCode(fallbackCode);
    }
  };

  const currentOrigin =
    typeof window !== 'undefined' &&
    window.location.host.includes('.com')
      ? window.location.origin
      : 'https://nokurai.com';
  const studyShareLink = `${currentOrigin}/?share=${shareCode}`;

  const handleCopyLink = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(studyShareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_deck.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const mdLines = [
      `# ${deck.title}`,
      `**Subject:** ${deck.subject} | **Cards:** ${deck.cards.length}`,
      `*Generated by NokurAI Spaced Repetition Platform*`,
      '',
      `## Description`,
      deck.description,
      '',
      `## Flashcards (Q&A)`,
      ...deck.cards.map((c, i) => `### ${i + 1}. ${c.question}\n**Answer:** ${c.answer}\n*Topic:* ${c.topic} | *Difficulty:* ${c.difficulty}\n`),
    ];
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdLines.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_study_sheet.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Decks
        </button>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collaborative Share (Pro feature) */}
          <button
            onClick={handleGenerateShareCode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              deck.isSharedCollaborative
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-purple-600" />
            <span>{shareCode ? `Share (${shareCode})` : 'Collaborate & Share'}</span>
            {!isPro && <Crown className="w-3 h-3 text-amber-500 ml-0.5" />}
          </button>

          {/* Export Deck Options */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors text-xs font-semibold"
            title="Export JSON format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors text-xs font-semibold"
            title="Export printable Markdown Study Sheet"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Study Sheet</span>
          </button>

          {/* Practice Quiz */}
          <button
            onClick={() => onStartQuiz(deck.cards)}
            disabled={deck.cards.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors disabled:opacity-40"
          >
            <GraduationCap className="w-4 h-4 text-cyan-600" />
            <span>Quiz Test</span>
          </button>

          {/* Spaced Repetition Review */}
          <button
            onClick={() => onStartReview(deck.cards)}
            disabled={deck.cards.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start SM-2 Review ({deck.cards.length})</span>
          </button>
        </div>
      </div>

      {/* Share Link Drawer if active */}
      {shareCode && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 text-purple-900">
            <Share2 className="w-4 h-4 shrink-0 text-purple-600" />
            <span>
              Collaborative study link is live:{' '}
              <span className="font-mono font-bold text-purple-950 underline">{studyShareLink}</span>
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      )}

      {/* Deck Header & Overview */}
      {(() => {
        const coverImg = deck.coverImage || getSubjectCoverImage(deck.subject);
        return (
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-md">
            {coverImg && (
              <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={coverImg}
                  alt={deck.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              </div>
            )}
            <div className="p-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                  {deck.subject}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                  {deck.cards.length} Flashcards
                </span>
                {deck.topicSteps && deck.topicSteps.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                    {deck.topicSteps.length} Step-by-Step Modules
                  </span>
                )}
                {deck.sourceFileName && (
                  <span className="text-[11px] text-slate-500 ml-auto">
                    Source: {deck.sourceFileName}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{deck.title}</h1>
              <p className="text-sm text-slate-600 leading-relaxed">{deck.description}</p>
            </div>
          </div>
        );
      })()}

      {/* View Switcher: Cards vs Step-by-Step Guide */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('cards')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'cards'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Flashcard Vault ({deck.cards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'guide'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Step-by-Step Guide ({deck.topicSteps?.length || 0} Modules)</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'guide' ? (
        <StepByStepGuide
          deck={deck}
          onUpdateDeck={onUpdateDeck}
          onEarnXp={onEarnXp}
          onStartDeckReview={(topic) => {
            if (topic) {
              const matched = deck.cards.filter((c) =>
                c.topic.toLowerCase().includes(topic.toLowerCase())
              );
              onStartReview(matched.length > 0 ? matched : deck.cards);
            } else {
              onStartReview(deck.cards);
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Filters Bar: Subject & Difficulty automatic categorization */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search terms, formulas, or concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Difficulty:
              </span>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Add Card Button */}
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Card</span>
              </button>
            </div>
          </div>

          {/* Add Card Form Drawer */}
          {showAddCard && (
            <form
              onSubmit={handleAddCard}
              className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4 animate-in fade-in"
            >
              <h4 className="text-sm font-bold text-white">Create Custom Flashcard</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Question / Prompt</label>
                  <textarea
                    rows={2}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter prompt or recall question..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Answer & Explanation</label>
                  <textarea
                    rows={2}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Enter concise, accurate answer..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Diagram / Image attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Concept Diagram Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/diagram.png or image URL..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Image Caption / Legend</label>
                  <input
                    type="text"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="e.g. Action Potential Voltage vs Time Graph"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mr-2">Difficulty:</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Subtopic (optional)"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    Save Flashcard
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const status = getCardMasteryStatus(card);
              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group relative shadow-xs"
                >
                  <div>
                    {/* Card Meta */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">{card.topic}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            card.difficulty === 'Beginner'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : card.difficulty === 'Intermediate'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          {card.difficulty}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.badgeBg}`}>
                        {status.label} • Next: {formatInterval(card.interval)}
                      </span>
                    </div>

                    {/* Question */}
                    <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{card.question}</h4>

                    {/* Answer */}
                    <p className="text-xs text-slate-600 leading-relaxed">{card.answer}</p>

                    {/* Visual Diagram if present */}
                    {card.imageUrl && (
                      <div
                        onClick={() =>
                          setZoomedImage({
                            url: card.imageUrl!,
                            caption: card.imageCaption,
                            title: card.topic,
                          })
                        }
                        className="my-3 h-32 w-full rounded-xl overflow-hidden border border-slate-800 cursor-zoom-in relative group/img bg-slate-950"
                        title="Click to enlarge diagram"
                      >
                        <img
                          src={card.imageUrl}
                          alt={card.imageCaption || 'Concept diagram'}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-300 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 text-[10px]">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </div>
                        {card.imageCaption && (
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-sm text-[10px] text-slate-300 px-2 py-0.5 truncate text-center border-t border-slate-800">
                            {card.imageCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {card.keyFormulaOrConcept && (
                      <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300">
                        {card.keyFormulaOrConcept}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Repetitions: {card.repetitions} | EF: {card.easeFactor.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400">No cards matched the current filter or search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Full Resolution Diagram Lightbox */}
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
