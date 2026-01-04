'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTransition } from 'react';

const supportedLocales = ['en', 'mk'] as const;

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = async (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    // Store preference in localStorage and cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('mk-preferred-locale', newLocale);
      // Update cookie for next-intl middleware
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    }

    // Save to database if user is logged in
    if (session?.user?.id) {
      try {
        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale }),
        });
      } catch (error) {
        console.error('[LanguageSwitcher] Failed to save locale to database:', error);
      }
    }

    // Replace the locale in the pathname
    const segments = pathname.split('/').filter(Boolean);
    const hasKnownLocale = supportedLocales.includes(segments[0] as (typeof supportedLocales)[number]);
    if (hasKnownLocale) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPathname = `/${segments.join('/')}`;

    const htmlEl = typeof document !== 'undefined' ? document.documentElement : null;
    const googleTranslateActive = Boolean(
      htmlEl?.classList.contains('translated-ltr') ||
        htmlEl?.classList.contains('translated-rtl') ||
        htmlEl?.getAttribute('data-translation-state') === 'translated'
    );

    if (typeof window !== 'undefined' && googleTranslateActive) {
      // Force a hard navigation when Google Translate mutates the DOM to avoid hydration crashes.
      window.location.assign(newPathname);
      return;
    }

    startTransition(() => {
      router.replace(newPathname);
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 px-2 sm:px-3 justify-center items-center"
          disabled={isPending}
          aria-label={t('language')}
          data-testid="language-switcher-trigger"
        >
          <Languages className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="sm:hidden flex-shrink-0">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-center flex-1">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[180px]">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => switchLanguage(value)}
          aria-label={t('language')}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code} data-testid={`language-switcher-option-${lang.code}`}>
              <span className="mr-2" aria-hidden="true">
                {lang.flag}
              </span>
              {lang.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
