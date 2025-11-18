"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { ShellHeader } from "./ShellHeader";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <SidebarNav isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-shell-main lg:ml-72">
        <div className="app-shell-scroll">
          <ShellHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main id="main-content" className="space-y-8" role="main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
