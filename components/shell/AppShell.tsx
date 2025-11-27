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
      <div className="app-shell-main lg:ml-[72px] xl:ml-72">
        <div className="app-shell-scroll">
          <ShellHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main
            id="main-content"
            className="mx-auto w-full max-w-6xl space-y-6 md:space-y-8 pb-[140px] lg:pb-0"
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
