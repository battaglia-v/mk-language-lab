"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Home,
  RefreshCw,
  Languages,
  Newspaper,
  BookOpen,
  // Instagram, // Hidden until Instagram access is available
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AjvarLogo } from "./AjvarLogo";
import { useMissionStatusResource } from "@/hooks/useMissionStatus";

type NavItem = {
  path: string;
  label: string;
  icon: typeof Home;
};

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const locale = useLocale();
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [isBreakpointCollapsed, setIsBreakpointCollapsed] = useState(false);
  const collapsed = isBreakpointCollapsed || userCollapsed;
  const homeLabel = t("home");
  const collapseLabel = t("collapse");
  const expandLabel = t("expand");
  const brandLabel = brand("short");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1360px)");
    setIsBreakpointCollapsed(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) =>
      setIsBreakpointCollapsed(event.matches);
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const width = collapsed ? "5rem" : "16rem";
    document.documentElement.style.setProperty(
      "--sidebar-current-width",
      width,
    );

    return () => {
      document.documentElement.style.removeProperty("--sidebar-current-width");
    };
  }, [collapsed]);

  const navItems: NavItem[] = [
    { path: "/practice", label: t("practice"), icon: RefreshCw },
    { path: "/translate", label: t("translate"), icon: Languages },
    // { path: '/daily-lessons', label: t('dailyLessons'), icon: Instagram }, // Hidden until Instagram access is available
    { path: "/news", label: t("news"), icon: Newspaper },
    { path: "/resources", label: t("resources"), icon: BookOpen },
  ];

  const buildHref = (path: string) => `/${locale}${path}`;

  const isActive = (path: string) => {
    const fullPath = buildHref(path);
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const {
    mission: navMission,
    state: navMissionState,
  } = useMissionStatusResource();
  const continueSubtitle =
    navMissionState === "ready"
      ? t("continueButtonSubtitle", {
          earned: navMission.xp.earned,
          goal: navMission.xp.target,
        })
      : navMissionState === "loading"
        ? t("continueButtonLoading")
        : t("continueButtonFallback");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 p-6 border-b border-sidebar-border",
            collapsed && "justify-center p-4",
          )}
        >
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 group"
            aria-label={homeLabel}
          >
            <div className="transform transition-transform duration-200 group-hover:scale-105">
              <AjvarLogo size={collapsed ? 36 : 40} />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {brandLabel}
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav
          className="flex-1 overflow-y-auto p-4 space-y-2"
          aria-label={t("label")}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={buildHref(item.path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent group relative",
                  active &&
                    "bg-sidebar-primary text-sidebar-primary-foreground",
                  !active &&
                    "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-3",
                )}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                  )}
                />

                {!collapsed && <span className="text-sm">{item.label}</span>}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => setUserCollapsed((prev) => !prev)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200",
              "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-3",
            )}
            aria-label={collapsed ? expandLabel : collapseLabel}
            disabled={isBreakpointCollapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">{collapseLabel}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50"
        aria-label={t("label")}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <div className="relative px-2 pt-8 pb-1">
          <Link
            href={buildHref("/practice")}
            className="absolute left-1/2 top-0 flex w-[92%] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-[var(--brand-red)] px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-[rgba(255,79,94,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 focus-visible:ring-offset-[var(--brand-red)]"
            aria-label={t("continueButtonLabel")}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex-1 text-left leading-tight">
              <span className="block">{t("continueButtonLabel")}</span>
              <span className="text-[11px] text-white/85">{continueSubtitle}</span>
            </span>
          </Link>

          <div className="grid grid-cols-5 gap-0.5 pt-1">
          {/* Home button */}
          <Link
            href={`/${locale}`}
            className={cn(
              "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-all duration-200 min-h-[3.25rem]",
              pathname === `/${locale}` && "text-primary",
              pathname !== `/${locale}` &&
                "text-sidebar-foreground hover:text-sidebar-accent-foreground",
            )}
          >
            <AjvarLogo size={16} className="h-4 w-4" />
            <span
              className={cn(
                "text-[10px] font-medium w-full text-center leading-tight whitespace-normal break-words",
                pathname === `/${locale}` && "text-primary",
              )}
            >
              {homeLabel}
            </span>
          </Link>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={`mobile-${item.path}`}
                href={buildHref(item.path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-all duration-200 min-h-[3.25rem]",
                  active && "text-primary",
                  !active &&
                    "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                <span
                  className={cn(
                    "text-[10px] font-medium w-full text-center leading-tight whitespace-normal break-words",
                    active && "text-primary",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        </div>
      </nav>
    </>
  );
}
