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
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToasterProvider } from '@/components/ui/toast';

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
        <QueryProvider>
          <ToasterProvider>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <Sidebar />

        {/* Main content with responsive shell */}
        <div className="lg:ml-sidebar flex min-h-screen flex-col bg-[#030712] text-slate-100">
          <TopNav />
          <main
            id="main-content"
            className="relative flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary"
            tabIndex={-1}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,73,255,0.25),transparent_60%),linear-gradient(180deg,rgba(3,7,18,0.95),rgba(3,7,18,0.9))]" />
            <div className="relative z-10 px-4 py-6 focus-visible:ring-2 focus-visible:ring-primary sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <Footer />
        </div>
          </ToasterProvider>
        </QueryProvider>
      </NextIntlClientProvider>
      <Analytics />
    </SessionProvider>
  );
}
