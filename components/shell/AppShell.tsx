"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { ShellHeader } from "./ShellHeader";
import { MobileTabNav } from "./MobileTabNav";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <SidebarNav isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-shell-main lg:ml-20 2xl:ml-64">
        <div className="app-shell-scroll">
          <ShellHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main
            id="main-content"
            className="mx-auto w-full max-w-5xl space-y-6 md:space-y-8 pb-24 lg:pb-0 px-4 py-5 sm:px-6 md:px-8 md:py-6"
            role="main"
          >
            {children}
          </main>
        </div>
      </div>
      <MobileTabNav />
    </div>
  );
}
