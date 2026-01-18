'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { X, MessageSquare, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'mk-alpha-banner-dismissed';

/**
 * Detect if running as a standalone app (PWA installed or TWA)
 */
function isStandaloneOrTwa(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for TWA via Android bridge
  // @ts-expect-error - Android interface may not exist
  if (window.Android?.isTwa) return true;

  // Check document referrer for TWA
  if (document.referrer.includes('android-app://')) return true;

  // Check for standalone display mode (PWA installed)
  if (window.matchMedia('(display-mode: standalone)').matches) return true;

  // iOS standalone mode
  // @ts-expect-error - navigator.standalone is iOS-specific
  if (window.navigator?.standalone === true) return true;

  return false;
}

/**
 * Alpha banner to indicate the app is in early development
 * and encourage user feedback.
 * Hidden when running as a standalone app (PWA/TWA) for native feel.
 */
export function AlphaBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isStandalone, setIsStandalone] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    // Check if running as standalone app
    setIsStandalone(isStandaloneOrTwa());

    // Check localStorage on mount
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  // Hide in standalone/TWA mode for native app feel, or if dismissed
  if (isDismissed || isStandalone) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white px-4 py-2">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 text-sm">
        <MessageSquare className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">Alpha Preview</span>
        <span className="text-white/90">— Feedback welcome!</span>
        <Link
          href={`/${locale}/feedback`}
          className="ml-2 inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
        >
          Send feedback
          <ExternalLink className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Dismiss alpha banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
