/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, FileText, Globe, Lock, ExternalLink, Mail, Info, Cookie } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'adsense') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight">Nokur<span className="text-indigo-600">AI</span></span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
                Study Platform
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Cognitive science spaced repetition and AI lecture note synthesis. Master topics step by step with SM-2 algorithms, end-to-end encryption, and offline vaulting.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>AES-256 Offline Storage</span>
            </div>
          </div>

          {/* Col 2: Legal & Privacy (Real crawlable links + in-app modal option) */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Legal &amp; Privacy
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a
                  href="/cookie-policy"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Cookie className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cookie Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px] text-slate-500"
                >
                  <span>Google Ad Settings</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: About & Contact */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Platform &amp; Support
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>About NokurAI</span>
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Contact Support</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer text-left text-slate-500"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Quick Policy Summary</span>
                </button>
              </li>
              <li>
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px] text-slate-500"
                >
                  <span>Your Ad Choices</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Publisher Resources & Contact */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Site Index &amp; Publisher
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="/ads.txt"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ads.txt</span>
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:melendezandrew065@gmail.com"
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-slate-600"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>melendezandrew065@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} NokurAI Study Engine. Designed for academic mastery.
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms</a>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('adsense')}
              className="text-indigo-600 hover:underline cursor-pointer font-medium"
            >
              AdSense Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
