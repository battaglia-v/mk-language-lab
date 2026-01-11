import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { SessionProvider } from '@/components/auth/SessionProvider';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToasterProvider } from '@/components/ui/toast';
import { XPNotificationProvider } from '@/components/providers/XPNotificationProvider';
import { GoogleOneTapProvider } from '@/components/providers/GoogleOneTapProvider';
import { LocaleSyncProvider } from '@/components/providers/LocaleSyncProvider';
import { OfflineStatusToast } from '@/components/providers/OfflineStatusToast';
import { AppShell } from '@/components/shell/AppShell';
import { SkipLink } from '@/components/ui/accessibility';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages}>
        <LocaleSyncProvider>
          <QueryProvider>
            <ToasterProvider>
              <OfflineStatusToast />
              <XPNotificationProvider>
                <GoogleOneTapProvider>
                  {/* Skip to main content link for keyboard navigation */}
                  <SkipLink />

                  <AppShell>{children}</AppShell>
                </GoogleOneTapProvider>
              </XPNotificationProvider>
            </ToasterProvider>
          </QueryProvider>
        </LocaleSyncProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
