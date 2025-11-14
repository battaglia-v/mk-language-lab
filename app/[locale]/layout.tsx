import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { SessionProvider } from '@/components/auth/SessionProvider';
import type { ReactNode } from 'react';
import { TopNav } from '@/components/layout/TopNav';

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
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <Sidebar />

        {/* Main content with responsive shell */}
        <div className="lg:ml-sidebar flex min-h-screen flex-col bg-[var(--brand-cream-light)]">
          <TopNav />
          <main
            id="main-content"
            className="relative flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary"
            tabIndex={-1}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,201,72,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(215,38,61,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,246,225,1))]" />
            <div className="relative z-10 px-4 py-6 focus-visible:ring-2 focus-visible:ring-primary sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </NextIntlClientProvider>
      <Analytics />
    </SessionProvider>
  );
}
