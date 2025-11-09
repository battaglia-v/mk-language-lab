'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function WelcomeBanner() {
  const t = useTranslations('welcomeBanner');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full border-b border-primary/20 bg-primary/5">
      <div className="container mx-auto px-4 py-2">
        <div className="relative flex items-center justify-between gap-2">
          {/* Left side: Icon and title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground truncate">
              {t('title')}
            </h3>
          </div>

          {/* Right side: Action button + close */}
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="h-7 text-xs px-2.5" asChild>
              <Link href="#word-of-day">
                {t('ctaPrimary')}
              </Link>
            </Button>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 hover:bg-muted transition-colors"
              aria-label="Dismiss welcome banner"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
