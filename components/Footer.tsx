'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="mt-auto pb-16 lg:pb-6">
      <div className="container mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs text-muted-foreground/60">
          <Link
            href={`/${locale}/privacy`}
            className="hover:text-muted-foreground transition-colors"
          >
            {t('privacy')}
          </Link>
          <span>•</span>
          <Link
            href={`/${locale}/terms`}
            className="hover:text-muted-foreground transition-colors"
          >
            {t('terms')}
          </Link>
          <span>•</span>
          <a
            href="mailto:macedonianlanguagelab@gmail.com?subject=Macedonian%20Learning%20App%20-%20Contact%20Inquiry"
            className="hover:text-muted-foreground transition-colors"
          >
            {t('contact')}
          </a>
        </div>
        <div className="flex items-center justify-center text-[10px] text-muted-foreground/60">
          <span>
            {t('createdWith')} <a href="https://www.linkedin.com/in/vincentvinnybattaglia/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">{t('vini')}</a> {t('and')} <a href="https://macedonianlanguagecorner.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">{t('andri')}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
