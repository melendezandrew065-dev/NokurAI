/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  caption?: string;
  title?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  caption,
  title,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{title || 'Diagram & Concept Illustration'}</h3>
            {caption && <p className="text-xs text-slate-500 truncate max-w-md">{caption}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="p-2 sm:p-4 bg-slate-50 flex items-center justify-center overflow-auto max-h-[75vh]">
          <img
            src={imageUrl}
            alt={caption || title || 'Enlarged educational diagram'}
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-md border border-slate-200"
          />
        </div>

        {/* Footer */}
        {caption && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
