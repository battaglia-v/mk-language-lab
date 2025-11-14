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
        <div className="lg:ml-sidebar flex min-h-screen flex-col bg-background">
          <TopNav />
          <main
            id="main-content"
            className="flex-1 px-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-6 lg:px-8"
            tabIndex={-1}
          >
            {children}
          </main>
          <Footer />
        </div>
      </NextIntlClientProvider>
      <Analytics />
    </SessionProvider>
  );
}
