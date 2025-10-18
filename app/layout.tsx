import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macedonian Learning App",
  description: "Learn Macedonian with AI-powered tutoring, translation, and interactive lessons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
