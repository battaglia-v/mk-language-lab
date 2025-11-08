'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-auto pb-16 lg:pb-8">
      <div className="container mx-auto px-4 py-6 md:py-7 lg:py-8">
        {/* Main Attribution */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base">
            <span className="text-muted-foreground">{t('createdWith')}</span>
            <a
              href="https://www.linkedin.com/in/vincentvinnybattaglia/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              {t('vini')}
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground">{t('and')}</span>
            <a
              href="https://macedonianlanguagecorner.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              {t('andri')}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Content Attribution */}
          <div className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
            <p className="inline-block px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
              🇲🇰 {t('contentBy')}{' '}
              <a
                href="https://macedonianlanguagecorner.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted inline-flex items-center gap-1"
              >
                {t('macedonianLanguageCorner')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
