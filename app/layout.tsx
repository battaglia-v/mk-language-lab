import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SentryInit } from "@/components/SentryInit";

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
  themeColor: '#ff5a2c',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mk-language-lab.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Macedonian Language Lab",
    template: "%s | Macedonian Language Lab",
  },
  description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons. Free and open-source language learning app.",
  applicationName: "Macedonian Language Lab",
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
  authors: [{ name: "MK Language Lab" }],
  creator: "MK Language Lab",
  publisher: "MK Language Lab",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Macedonian Language Lab",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon-32', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["mk_MK"],
    url: siteUrl,
    siteName: "MK Language Lab",
    title: "MK Language Lab - Learn Macedonian",
    description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons. Free and open-source language learning app.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MK Language Lab - Learn Macedonian",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MK Language Lab - Learn Macedonian",
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
    <html className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SentryInit />
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
