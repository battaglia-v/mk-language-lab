"use client";

import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { ShellHeader } from "./ShellHeader";
import { MobileTabNav } from "./MobileTabNav";
import { BuildInfo } from "@/components/ui/BuildInfo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="app-shell-main w-full min-w-0 lg:ml-20 2xl:ml-64">
        <div className="app-shell-scroll w-full min-w-0">
          <ShellHeader />
          <main
            id="main-content"
            className="mx-auto w-full min-w-0 sm:max-w-7xl space-y-6 md:space-y-8 lg:pb-0 px-4 py-5 sm:px-5 md:px-8 md:py-6"
            role="main"
            style={{ paddingBottom: 'calc(var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            {children}
          </main>
        </div>
      </div>
      <MobileTabNav />
      <BuildInfo />
    </div>
  );
}
