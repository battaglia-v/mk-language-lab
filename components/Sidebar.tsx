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
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const actionableMission =
    navMissionState === "ready" &&
    navMission?.xp?.earned !== undefined &&
    navMission?.xp?.target !== undefined &&
    navMission.xp.earned < navMission.xp.target;

  const missionRunKey = useMemo(() => {
    if (!navMission?.missionId || !navMission?.cycle?.endsAt) {
      return undefined;
    }
    return `${navMission.missionId}:${navMission.cycle.endsAt}`;
  }, [navMission]);

  return (
    <>
      {actionableMission && missionRunKey && (
        <MobileMissionToast
          missionKey={missionRunKey}
          href={buildHref("/practice")}
          label={t("continueButtonLabel")}
          subtitle={continueSubtitle}
        />
      )}
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
        <div className="px-2 pt-2 pb-1">
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

type MobileMissionToastProps = {
  missionKey: string;
  href: string;
  label: string;
  subtitle: string;
};

function MobileMissionToast({ missionKey, href, label, subtitle }: MobileMissionToastProps) {
  const storageKey = useMemo(() => `mission-toast:${missionKey}`, [missionKey]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const dismissed = window.localStorage.getItem(storageKey) === "1";
    setIsVisible(!dismissed);
  }, [storageKey]);

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "1");
    }
    setIsVisible(false);
  }, [storageKey]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    const timer = window.setTimeout(() => {
      dismiss();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [dismiss, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] z-50 px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
        <div className="flex-1">
          <p className="font-medium text-sidebar-foreground">{label}</p>
          <p className="text-xs text-sidebar-foreground/80">{subtitle}</p>
          <Link href={href} className="mt-1 inline-flex items-center text-xs font-semibold text-primary hover:underline">
            {label}
            <Flame className="ml-1 h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="ml-2 text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          {"×"}
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  );
}
