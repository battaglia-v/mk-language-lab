import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SentryInit } from "@/components/SentryInit";
import { Analytics } from "@vercel/analytics/react";
import { brandColors, brandNames } from "@mk/tokens";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: brandColors.accent },
    { media: '(prefers-color-scheme: dark)', color: brandColors.accentEmphasis },
  ],
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mk-language-lab.vercel.app';
const brandCombined = brandNames.full;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brandCombined,
    template: `%s • ${brandCombined}`,
  },
  description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons. Free and open-source language learning app.",
  applicationName: brandCombined,
  keywords: [
    "Macedonian",
    "language learning",
    "AI tutor",
    "translation",
    "Macedonian lessons",
    "learn Macedonian",
    "language app",
    "Cyrillic",
  ],
  authors: [{ name: brandCombined }],
  creator: brandCombined,
  publisher: brandCombined,
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: brandCombined,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon-512-maskable.png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["mk_MK"],
    url: siteUrl,
    siteName: brandCombined,
    title: `${brandCombined} - Learn Macedonian`,
    description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons. Free and open-source language learning app.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${brandCombined} - Learn Macedonian`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandCombined} - Learn Macedonian`,
    description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons.",
    images: ["/opengraph-image"],
    creator: "@mk_language_lab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: "verification_code",
    // yandex: "verification_code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const enableVercelAnalytics = Boolean(process.env.VERCEL);

  return (
    <html lang="en" className="notranslate overflow-x-hidden" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        {/* Blocking script to prevent theme flash - runs before paint
            Theme priority:
            1. User's saved preference (localStorage)
            2. System preference (prefers-color-scheme)
            3. Default to light mode (light is primary)
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var html = document.documentElement;
                  var savedTheme = localStorage.getItem('mk-theme');
                  var theme;

                  if (savedTheme === 'light' || savedTheme === 'dark') {
                    // User has explicitly chosen a theme - respect it
                    theme = savedTheme;
                  } else if (savedTheme === 'system' || !savedTheme) {
                    // No saved preference or "system" - check prefers-color-scheme
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  } else {
                    // Fallback to light (light mode is primary)
                    theme = 'light';
                  }

                  var isLight = theme === 'light';
                  if (isLight) {
                    html.classList.remove('dark');
                    html.classList.add('theme-light');
                    html.classList.remove('theme-dark');
                  } else {
                    html.classList.add('dark');
                    html.classList.add('theme-dark');
                    html.classList.remove('theme-light');
                  }
                } catch (e) {
                  // On error, default to light mode (primary)
                  document.documentElement.classList.remove('dark', 'theme-dark');
                  document.documentElement.classList.add('theme-light');
                }
              })();
            `,
          }}
        />
        {/* Preconnect to external services for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for API endpoints */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://translation.googleapis.com" />
        {/* Preload critical font if using Google Fonts */}
      </head>
      <body
        className="antialiased overflow-x-hidden bg-[var(--mk-bg)] text-[var(--mk-text)]"
      >
        <ThemeProvider>
          <SentryInit />
          {children}
          {enableVercelAnalytics ? <Analytics debug={false} /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
