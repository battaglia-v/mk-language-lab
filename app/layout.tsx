import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ff5a2c',
};

export const metadata: Metadata = {
  title: "MK Language Lab",
  description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons",
  applicationName: "MK Language Lab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MK Language Lab",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
