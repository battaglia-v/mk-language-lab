import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Navigation from '@/components/Navigation';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const commonMessages = (messages as Record<string, unknown>)?.common as
    | Record<string, unknown>
    | undefined;
  const skipToContentLabel =
    (commonMessages?.skipToContent as string | undefined) ?? 'Skip to main content';

  return (
    <html lang={locale} className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-nav-link">
          {skipToContentLabel}
        </a>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <main id="main-content" className="outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {children}
          </main>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
