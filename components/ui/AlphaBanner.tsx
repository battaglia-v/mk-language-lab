'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'mk-alpha-banner-dismissed';

/**
 * Alpha banner to indicate the app is in early development
 * and encourage user feedback.
 */
export function AlphaBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white px-4 py-2">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 text-sm">
        <MessageSquare className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">Alpha Preview</span>
        <span className="text-white/90">— Feedback welcome!</span>
        <a
          href="mailto:feedback@mklearn.app?subject=MK%20Language%20Lab%20Feedback"
          className="ml-2 underline underline-offset-2 hover:no-underline"
        >
          Send feedback
        </a>
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
