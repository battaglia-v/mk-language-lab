'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AjvarLogo } from '@/components/AjvarLogo';
import { brandNames } from '@mk/tokens';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();
  const year = new Date().getFullYear();
  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const productLinks = [
    { label: nav('home'), href: buildHref('/') },
    { label: nav('practice'), href: buildHref('/practice') },
    { label: nav('translate'), href: buildHref('/translate') },
    { label: nav('news'), href: buildHref('/news') },
    { label: nav('resources'), href: buildHref('/resources') },
  ];

  const supportLinks = [
    { label: t('privacy'), href: `/${locale}/privacy`, external: false },
    { label: t('terms'), href: `/${locale}/terms`, external: false },
    { label: t('contact'), href: 'mailto:macedonianlanguagelab@gmail.com?subject=Macedonian%20Language%20Lab', external: true },
  ];

  const socialLinks = [
    { label: t('instagram'), href: 'https://instagram.com/macedonianlanguagecorner' },
    { label: t('youtube'), href: 'https://youtube.com/@macedonianlanguagecorner' },
    { label: t('allLinks'), href: 'https://linktr.ee/macedonianlanguagecorner' },
  ];

  return (
    <footer
      className="relative mt-auto border-t border-white/10 bg-[var(--brand-navy)] text-sm text-white/80"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.25rem)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--brand-cream)/12,transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative section-container section-container-wide space-y-10 py-10">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AjvarLogo size={38} />
              <div>
                <p className="text-base font-semibold text-white">{brandNames.full}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">{t('tagline')}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {t('contentBy')}{' '}
              <a
                href="https://macedonianlanguagecorner.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--brand-gold)] hover:underline"
              >
                {t('macedonianLanguageCorner')}
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {t('product')}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 transition-colors hover:text-[var(--brand-gold)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {t('support')}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-white/80 transition-colors hover:text-[var(--brand-gold)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white/80 transition-colors hover:text-[var(--brand-gold)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-white/70">
          <span className="text-center md:text-left">
            {t('createdWith')}{' '}
            <a
              href="https://www.linkedin.com/in/vincentvinnybattaglia/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:text-[var(--brand-gold)]"
            >
              {t('vini')}
            </a>{' '}
            {t('and')}{' '}
            <a
              href="https://macedonianlanguagecorner.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:text-[var(--brand-gold)]"
            >
              {t('andri')}
            </a>
          </span>
          <span className="text-center text-[11px] uppercase tracking-[0.3em] text-white/60 md:text-left">
            © {year} {brandNames.full}. {t('allRightsReserved')}
          </span>
        </div>
      </div>
    </footer>
  );
}
