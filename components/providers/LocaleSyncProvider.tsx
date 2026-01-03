'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

/**
 * LocaleSyncProvider - Syncs user's locale preference from database after login
 *
 * When a user signs in, this provider:
 * 1. Fetches their saved locale preference from the database
 * 2. If it differs from the current locale, redirects to the correct locale
 * 3. Updates cookie and localStorage for persistence
 */
export function LocaleSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session, when user becomes authenticated
    if (status !== 'authenticated' || !session?.user?.id || hasSynced.current) {
      return;
    }

    const syncLocale = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) return;

        const data = await response.json();
        const preferredLocale = data.locale;

        // If user has a saved preference that differs from current
        if (preferredLocale && preferredLocale !== locale) {
          // Update cookie for next-intl middleware
          document.cookie = `NEXT_LOCALE=${preferredLocale};path=/;max-age=31536000;SameSite=Lax`;
          // Update localStorage for settings page
          localStorage.setItem('mk-preferred-locale', preferredLocale);

          // Navigate to the correct locale
          const newPath = pathname.replace(`/${locale}`, `/${preferredLocale}`);
          router.replace(newPath);
        }

        hasSynced.current = true;
      } catch (error) {
        console.error('[LocaleSyncProvider] Failed to sync locale:', error);
      }
    };

    syncLocale();
  }, [status, session?.user?.id, locale, pathname, router]);

  return <>{children}</>;
}
