import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SentryInit } from "@/components/SentryInit";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ff5a2c' },
    { media: '(prefers-color-scheme: dark)', color: '#ff5a2c' },
  ],
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mk-language-lab.vercel.app';
const brandNameCyrillic = 'Македонски';
const brandNameEnglish = 'MK Language Lab';
const brandCombined = `${brandNameCyrillic} • ${brandNameEnglish}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brandCombined,
    template: `%s • ${brandNameEnglish}`,
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
  authors: [{ name: brandNameEnglish }],
  creator: brandNameEnglish,
  publisher: brandNameEnglish,
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
  return (
    <html className="dark notranslate overflow-x-hidden" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <SentryInit />
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
