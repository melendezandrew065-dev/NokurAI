/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  slotId?: string;
  clientId?: string;
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
}

const DEFAULT_CLIENT_ID = 'ca-pub-6591682562691116';

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  clientId = DEFAULT_CLIENT_ID,
  className = '',
  format = 'auto',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const envSlotId =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_ADSENSE_SLOT_ID as string | undefined)
      : undefined;

  const resolvedSlotId = (slotId || envSlotId || '').trim();
  const hasRealSlot = /^\d{6,}$/.test(resolvedSlotId) && resolvedSlotId !== '1234567890';

  useEffect(() => {
    if (!hasRealSlot || pushedRef.current || typeof window === 'undefined') return;
    const el = adRef.current;
    if (!el || el.getAttribute('data-adsbygoogle-status')) return;

    try {
      const adsbygoogle = ((window as any).adsbygoogle = (window as any).adsbygoogle || []);
      adsbygoogle.push({});
      pushedRef.current = true;
    } catch (e) {
      console.warn('AdSense slot initialization:', e);
    }
  }, [hasRealSlot, resolvedSlotId]);

  // When no manual display slot ID is configured, Google AdSense Auto Ads
  // from the <head> script automatically places ads cleanly without 400 slot errors.
  if (!hasRealSlot) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`rounded-2xl bg-slate-50/60 border border-slate-200/80 p-3 overflow-hidden ${className}`}
    >
      <div className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-1.5 text-center">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', width: '100%' }}
        data-ad-client={clientId}
        data-ad-slot={resolvedSlotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
};
