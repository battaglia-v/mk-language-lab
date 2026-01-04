"use client";

import { useEffect, type ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { ShellHeader } from "./ShellHeader";
import { MobileTabNav } from "./MobileTabNav";
import { BuildInfo } from "@/components/ui/BuildInfo";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.hydrated = "true";
    return () => {
      delete root.dataset.hydrated;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop sidebar - hidden on mobile */}
      <SidebarNav />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-20 2xl:ml-64">
        <ShellHeader />
        <main
          id="main-content"
          className="flex-1 px-4 py-4 pb-20 lg:pb-4 space-y-4"
          role="main"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileTabNav />
      <BuildInfo />
    </div>
  );
}
