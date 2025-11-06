import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Sidebar from '@/components/Sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { CommandMenu } from '@/components/CommandMenu';
import Footer from '@/components/Footer';
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

  return (
    <html lang={locale} className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Sidebar />
          
          {/* Top bar for search and language switcher */}
          <div className="fixed top-0 right-0 left-0 lg:left-sidebar z-30 h-14 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-2">
              <CommandMenu />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Main content with proper spacing for sidebar and top bar */}
          <div className="lg:ml-sidebar flex flex-col min-h-screen pb-20 lg:pb-0">
            <main
              id="main-content"
              className="outline-none focus-visible:ring-2 focus-visible:ring-primary pt-14 flex-1"
            >
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
