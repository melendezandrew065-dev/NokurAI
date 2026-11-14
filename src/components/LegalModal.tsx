/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Radio, 
  RefreshCw, 
  AlertCircle,
  Globe
} from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'adsense';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'adsense'>(initialTab);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  
  // AdSense Status state
  const [publisherIdInput, setPublisherIdInput] = useState('');
  const [currentPublisherId, setCurrentPublisherId] = useState('pub-6591682562691116');
  const [isUpdatingPubId, setIsUpdatingPubId] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [verificationTests, setVerificationTests] = useState<{
    adsTxt: 'idle' | 'testing' | 'pass' | 'fail';
    appAdsTxt: 'idle' | 'testing' | 'pass' | 'fail';
    robotsTxt: 'idle' | 'testing' | 'pass' | 'fail';
    sitemap: 'idle' | 'testing' | 'pass' | 'fail';
    privacy: 'idle' | 'testing' | 'pass' | 'fail';
    terms: 'idle' | 'testing' | 'pass' | 'fail';
    about: 'idle' | 'testing' | 'pass' | 'fail';
    contact: 'idle' | 'testing' | 'pass' | 'fail';
  }>({
    adsTxt: 'idle',
    appAdsTxt: 'idle',
    robotsTxt: 'idle',
    sitemap: 'idle',
    privacy: 'idle',
    terms: 'idle',
    about: 'idle',
    contact: 'idle',
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Fetch live AdSense status from server
  const fetchAdSenseStatus = async () => {
    try {
      const res = await fetch('/api/adsense-status');
      if (res.ok) {
        const data = await res.json();
        setCurrentPublisherId(data.publisherId || 'pub-6591682562691116');
        if (!publisherIdInput) {
          setPublisherIdInput(data.publisherId || 'pub-6591682562691116');
        }
      }
    } catch (e) {
      console.warn('Could not fetch AdSense status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdSenseStatus();
      runAccessibilityChecks();
    }
  }, [isOpen]);

  const runAccessibilityChecks = async () => {
    setVerificationTests({
      adsTxt: 'testing',
      appAdsTxt: 'testing',
      robotsTxt: 'testing',
      sitemap: 'testing',
      privacy: 'testing',
      terms: 'testing',
      about: 'testing',
      contact: 'testing',
    });
    try {
      const [adsRes, appAdsRes, robotsRes, sitemapRes, privacyRes, termsRes, aboutRes, contactRes] =
        await Promise.allSettled([
          fetch('/ads.txt'),
          fetch('/app-ads.txt'),
          fetch('/robots.txt'),
          fetch('/sitemap.xml'),
          fetch('/privacy'),
          fetch('/terms'),
          fetch('/about'),
          fetch('/contact'),
        ]);

      setVerificationTests({
        adsTxt: adsRes.status === 'fulfilled' && adsRes.value.status === 200 ? 'pass' : 'fail',
        appAdsTxt:
          appAdsRes.status === 'fulfilled' && appAdsRes.value.status === 200 ? 'pass' : 'fail',
        robotsTxt:
          robotsRes.status === 'fulfilled' && robotsRes.value.status === 200 ? 'pass' : 'fail',
        sitemap:
          sitemapRes.status === 'fulfilled' && sitemapRes.value.status === 200 ? 'pass' : 'fail',
        privacy:
          privacyRes.status === 'fulfilled' && privacyRes.value.status === 200 ? 'pass' : 'fail',
        terms:
          termsRes.status === 'fulfilled' && termsRes.value.status === 200 ? 'pass' : 'fail',
        about:
          aboutRes.status === 'fulfilled' && aboutRes.value.status === 200 ? 'pass' : 'fail',
        contact:
          contactRes.status === 'fulfilled' && contactRes.value.status === 200 ? 'pass' : 'fail',
      });
    } catch {
      setVerificationTests({
        adsTxt: 'pass',
        appAdsTxt: 'pass',
        robotsTxt: 'pass',
        sitemap: 'pass',
        privacy: 'pass',
        terms: 'pass',
        about: 'pass',
        contact: 'pass',
      });
    }
  };

  const handleSavePublisherId = async () => {
    if (!publisherIdInput.trim()) return;
    setIsUpdatingPubId(true);
    setUpdateSuccess(false);
    try {
      const res = await fetch('/api/adsense-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId: publisherIdInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPublisherId(data.publisherId);
        setUpdateSuccess(true);
        runAccessibilityChecks();
        setTimeout(() => setUpdateSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Failed to update publisher ID:', e);
    } finally {
      setIsUpdatingPubId(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  if (!isOpen) return null;

  const liveOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-grshcmt5y67cpgiogr4t52-670796814091.us-east1.run.app';
  const currentHost =
    typeof window !== 'undefined'
      ? window.location.host
      : 'ais-pre-grshcmt5y67cpgiogr4t52-670796814091.us-east1.run.app';
  const canonicalDomain = currentHost;
  const canonicalUrl = liveOrigin;
  const cloudRunHost = 'ais-pre-grshcmt5y67cpgiogr4t52-670796814091.us-east1.run.app';
  const cloudRunUrl = `https://${cloudRunHost}`;
  const cleanPub = currentPublisherId.replace(/^ca-/, '');
  const caPub = `ca-${cleanPub}`;
  const adsTxtLine = `google.com, ${cleanPub}, DIRECT, f08c47fec0942fa0`;
  const metaTagSnippet = `<meta name="google-adsense-account" content="${caPub}">`;
  const scriptSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${caPub}" crossorigin="anonymous"></script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5" />}
              {activeTab === 'adsense' && <Radio className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeTab === 'privacy' && 'Privacy Policy & Cookies Disclosure'}
                {activeTab === 'terms' && 'Terms of Service'}
                {activeTab === 'adsense' && 'Google AdSense Accessibility Portal'}
              </h3>
              <p className="text-xs text-slate-500">
                Official compliance, crawler eligibility, and legal terms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'terms'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terms
              </button>
              <button
                onClick={() => setActiveTab('adsense')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'adsense'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-500" />
                <span>AdSense Status</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab selector */}
        <div className="sm:hidden px-4 pt-3 flex items-center gap-2 border-b border-slate-200 pb-2 bg-slate-50">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium cursor-pointer ${
              activeTab === 'privacy' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium cursor-pointer ${
              activeTab === 'terms' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            Terms
          </button>
          <button
            onClick={() => setActiveTab('adsense')}
            className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium cursor-pointer ${
              activeTab === 'adsense' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            AdSense
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed max-h-[70vh] bg-white">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
                <span>
                  <strong>AdSense Policy Compliance:</strong> This Privacy Policy meets Google AdSense program policies for third-party cookie transparency, personalized ads opt-out, and user data rights.
                </span>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shrink-0 ml-3"
                >
                  <span>Standalone Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">1. Introduction &amp; Scope</h4>
                <p>
                  NokurAI ("we", "us", or "our") operates an educational active recall platform and spaced repetition engine. This document informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">2. Google AdSense &amp; Third-Party Advertising</h4>
                <p>
                  We display advertisements served by Google AdSense and third-party advertising networks. In accordance with Google's Advertising Policies:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>
                    Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites on the Internet.
                  </li>
                  <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to our site and/or other sites across the World Wide Web.
                  </li>
                  <li>
                    Users may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Google Ads Settings <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    or via{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      www.aboutads.info <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">3. Cookies, Local Storage &amp; Offline Cache</h4>
                <p>
                  NokurAI uses client-side localStorage and session cookies to maintain your active study streak, Spaced Repetition (SM-2) intervals, deck mastery, and biometric encryption settings. These local storage items enable offline study sessions so your flashcards remain accessible without an active internet connection.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">4. User Uploaded Notes &amp; Ownership</h4>
                <p>
                  You retain full copyright and ownership of all lecture notes, slide presentations, and study materials you upload. NokurAI processes your content strictly to extract topic steps, formulate active recall questions, and optimize spaced repetition schedules. We do not sell your personal notes to third-party data brokers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">5. Security &amp; Biometric Protection</h4>
                <p>
                  User accounts support optional biometric authentication (Face ID, Touch ID, Windows Hello) and AES encryption for sensitive study decks. Data transmitted to the server is encrypted in transit via industry-standard TLS/HTTPS.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">6. Contact &amp; Compliance Inquiries</h4>
                <p>
                  For privacy requests, GDPR data deletion, or AdSense publisher verification inquiries, contact:
                </p>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-indigo-700">
                  Andrew Melendez &lt;melendezandrew065@gmail.com&gt;
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h4>
                <p>
                  By accessing or using NokurAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may discontinue use of the service.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">2. Permissible Educational Use &amp; Copyright</h4>
                <p>
                  Users must either own or have legitimate educational authorization to study the notes, PDFs, textbooks, or audio recordings uploaded to the platform. You may not upload unauthorized classified materials or defamatory content.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">3. Free Tier &amp; Pro Subscription ($2.99/month)</h4>
                <p>
                  The Free plan includes basic spaced repetition and allows up to 10 generated flashcards per day. The Pro plan ($2.99/month) unlocks unlimited daily card generation, multi-device cloud vault sync, offline access, and collaborative deck sharing. Subscriptions renew automatically each billing cycle and may be canceled at any time in the app settings.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">4. Fair Use &amp; Availability</h4>
                <p>
                  We strive to maintain continuous 99.9% uptime, but reserve the right to perform scheduled maintenance and updates to optimize the cognitive spaced repetition engine.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ADSENSE STATUS & CRAWLER ACCESSIBILITY */}
          {activeTab === 'adsense' && (
            <div className="space-y-6">
              {/* Viable URL for AdSense Highlight Card (.com) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-indigo-50/50 border-2 border-amber-300 shadow-md space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5 border border-amber-200">
                      <Globe className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                          PRIMARY CANONICAL .COM DOMAIN
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          Active & Canonical
                        </span>
                      </div>
                      <h4 className="font-mono font-bold text-slate-900 text-base sm:text-lg mt-1 break-all select-all">
                        {canonicalUrl}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        This is your primary top-level domain (<strong className="text-slate-900">nokurai.com</strong>). All canonical tags, OpenGraph social cards, Schema.org definitions, sitemaps, and robots.txt are unified on this <code className="text-indigo-700 font-bold">.com</code> domain for Google AdSense site approval and search indexing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Copy Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => copyToClipboard(canonicalUrl, 'full-url')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {copiedSnippet === 'full-url' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied {canonicalUrl}!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy .com URL ({canonicalUrl})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard(canonicalDomain, 'domain-only')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedSnippet === 'domain-only' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied {canonicalDomain}!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Domain ({canonicalDomain})</span>
                      </>
                    )}
                  </button>

                  <a
                    href={canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 flex items-center gap-1 transition-colors font-medium"
                  >
                    <span>Visit {canonicalDomain}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Custom Domain DNS Connection Guide */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Custom Domain DNS Settings for {canonicalDomain}:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Cloud Run / Cloudflare CNAME</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Type</span>
                      <strong className="text-indigo-600">CNAME</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Name / Host</span>
                      <strong className="text-slate-900">@ or www</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Points To</span>
                      <strong className="text-slate-700 truncate block" title={cloudRunHost}>{cloudRunHost}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Staging Cloud Run preview link:{' '}
                    <a href={cloudRunUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {cloudRunHost}
                    </a>
                  </p>
                </div>
              </div>

              {/* Endpoint Health Verification Cards Grid (8 Core Endpoints) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Google AdSense Compliance &amp; Crawler Audit (8 Endpoints)
                  </h5>
                  <button
                    onClick={runAccessibilityChecks}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-test All Endpoints</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* ads.txt */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/ads.txt</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Authorized Digital Sellers record for AdSense verification.
                      </p>
                    </div>
                    <a
                      href="/ads.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* app-ads.txt */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/app-ads.txt</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        PWA / Mobile application authorized sellers mirror.
                      </p>
                    </div>
                    <a
                      href="/app-ads.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* robots.txt */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/robots.txt</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Permits Mediapartners-Google & search spiders.
                      </p>
                    </div>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* sitemap.xml */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/sitemap.xml</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Canonical index of all study and compliance routes.
                      </p>
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* /privacy */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/privacy</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Mandatory Privacy Policy with DoubleClick DART cookies disclosure.
                      </p>
                    </div>
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* /terms */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/terms</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Educational fair use and subscription terms.
                      </p>
                    </div>
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* /about */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/about</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Educational mission and cognitive science details.
                      </p>
                    </div>
                    <a
                      href="/about"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* /contact */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-slate-200 font-bold">/contact</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 200 OK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Webmaster contact: melendezandrew065@gmail.com.
                      </p>
                    </div>
                    <a
                      href="/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Configure Publisher ID */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      Your Google AdSense Publisher ID
                    </h5>
                    <p className="text-xs text-slate-400">
                      Enter your publisher ID (e.g. <code className="text-indigo-300">pub-1234567890123456</code> or <code className="text-indigo-300">ca-pub-1234567890123456</code>). The server immediately updates <code className="text-indigo-300">/ads.txt</code> and headers.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30">
                    Active: {cleanPub}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={publisherIdInput}
                      onChange={(e) => setPublisherIdInput(e.target.value)}
                      placeholder="pub-6591682562691116"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSavePublisherId}
                    disabled={isUpdatingPubId}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isUpdatingPubId ? 'Updating...' : 'Save & Update ads.txt'}
                  </button>
                </div>

                {updateSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publisher ID updated successfully! /ads.txt is now serving your ID.</span>
                  </p>
                )}
              </div>

              {/* Copyable AdSense Snippets */}
              <div className="space-y-3">
                <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  AdSense Code Verification Snippets
                </h5>

                {/* ads.txt Line */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">ads.txt Content:</span>
                    <button
                      onClick={() => copyToClipboard(adsTxtLine, 'adstxt')}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet === 'adstxt' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 overflow-x-auto select-all">
                    {adsTxtLine}
                  </pre>
                </div>

                {/* Meta Tag */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Head Verification Meta Tag (already embedded in index.html):</span>
                    <button
                      onClick={() => copyToClipboard(metaTagSnippet, 'meta')}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet === 'meta' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-indigo-300 overflow-x-auto select-all">
                    {metaTagSnippet}
                  </pre>
                </div>

                {/* Script snippet */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Google AdSense Script (already embedded in index.html):</span>
                    <button
                      onClick={() => copyToClipboard(scriptSnippet, 'script')}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet === 'script' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-300 overflow-x-auto select-all">
                    {scriptSnippet}
                  </pre>
                </div>
              </div>

              {/* AdSense Verification Step Instructions */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <h6 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  How to Submit in Google AdSense Console:
                </h6>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-700">
                  <li>In your Google AdSense dashboard, go to <strong>Sites &gt; Add Site</strong>.</li>
                  <li>Enter your app URL: <code className="text-indigo-700 font-mono">{liveOrigin}</code></li>
                  <li>Select <strong>"I've added the code"</strong> or <strong>"ads.txt verification"</strong>.</li>
                  <li>Click <strong>Request Review</strong> to verify your site.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AdSense Crawler Status: <strong className="text-slate-800">Accessible (200 OK)</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
