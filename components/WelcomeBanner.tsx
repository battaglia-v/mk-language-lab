'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    <div className="w-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-6 py-4">
        <Card className="relative border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 shadow-lg">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pr-8">
            {/* Left side: Welcome message */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('description')}
                </p>
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="default" size="sm" asChild>
                <Link href="#word-of-day">
                  {t('ctaPrimary')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/practice">
                  {t('ctaSecondary')}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
