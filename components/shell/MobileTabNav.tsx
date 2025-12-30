"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";
import { useFirstSession } from "@/hooks/use-first-session";
import { NavTooltip } from "./NavTooltip";
import { triggerHaptic } from "@/lib/haptics";

export function MobileTabNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { showHints, markHintSeen, isHintSeen } = useFirstSession();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Show first tooltip after mount delay
  useEffect(() => {
    if (!mounted || !showHints) return;
    
    // Show practice tooltip first (central CTA)
    const timer = setTimeout(() => {
      if (!isHintSeen('nav-practice')) {
        setActiveTooltip('nav-practice');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [mounted, showHints, isHintSeen]);

  const handleTooltipDismiss = useCallback((id: string) => {
    markHintSeen(id);
    setActiveTooltip(null);
  }, [markHintSeen]);

  const handleNavClick = useCallback((itemId: string) => {
    // Trigger subtle haptic on tab switch
    triggerHaptic('light');
    
    // Dismiss tooltip if clicking the tooltipped item
    if (activeTooltip === `nav-${itemId}`) {
      handleTooltipDismiss(`nav-${itemId}`);
    }
  }, [activeTooltip, handleTooltipDismiss]);

  // Track viewport width for adaptive layout
  useEffect(() => {
    setMounted(true);
    const checkWidth = () => {
      setIsNarrowViewport(window.innerWidth < 375);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    const onScroll = () => {
      setHasScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('resize', checkWidth);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const primaryActionId: (typeof shellNavItems)[number]["id"] = "practice";
  const accentItem = shellNavItems.find((item) => item.id === primaryActionId);
  const AccentIcon = accentItem?.icon;
  const supportingItems = shellNavItems.filter(
    (item) => item.id !== primaryActionId
  );
  const midpoint = Math.ceil(supportingItems.length / 2);
  const leadingItems = supportingItems.slice(0, midpoint);
  const trailingItems = supportingItems.slice(midpoint);

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  return (
    <nav
      className={cn(
        "lg:hidden fixed inset-x-0 bottom-0 z-50 w-full border-t border-white/10 bg-[#070a14]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#070a14]/82",
        mounted && "mobile-nav-mounted"
      )}
      aria-label={t("label")}
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)",
        paddingTop: "6px",
      }}
    >
      <div className="mx-auto w-full max-w-[640px] px-4">
        <div
          className={cn(
            "relative flex min-h-[56px] items-center justify-between gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-1",
            "shadow-[0_-10px_28px_rgba(0,0,0,0.34)] ring-1 ring-white/8 backdrop-blur-2xl transition-shadow duration-200",
            hasScrolled && "border-white/14 ring-white/12 shadow-[0_-14px_36px_rgba(0,0,0,0.46)]"
          )}
          style={{
            background: isNarrowViewport ? '#070a14' : undefined,
          }}
        >
          <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/8" aria-hidden="true" />

          <div className="relative flex min-w-0 flex-1 items-center justify-between gap-1.5">
            <NavRail
              items={leadingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="primary"
              isNarrowViewport={isNarrowViewport}
              onNavClick={handleNavClick}
            />

            {accentItem && AccentIcon ? (
              <div className="relative">
                <NavTooltip
                  isVisible={activeTooltip === 'nav-practice' && showHints}
                  text="Start practicing here!"
                  icon="🎯"
                  position="top"
                  onDismiss={() => handleTooltipDismiss('nav-practice')}
                  tooltipId="nav-practice"
                />
                <Link
                  href={buildHref(accentItem.path)}
                  prefetch={true}
                  onClick={() => handleNavClick(accentItem.id)}
                  aria-current={isNavItemActive(pathname, buildHref(accentItem.path)) ? "page" : undefined}
                  aria-label={t(accentItem.id)}
                  className={cn(
                    "nav-accent-button group relative flex h-[46px] w-[46px] min-w-[2.85rem] flex-shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-200",
                    "bg-gradient-to-br from-[#ffe16a] via-primary to-[#f1b700]",
                    "shadow-[0_8px_24px_rgba(0,0,0,0.34),0_2px_8px_rgba(0,0,0,0.28)] ring-1 ring-white/40",
                    "hover:-translate-y-[1px] active:translate-y-[0px] active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a14]"
                  )}
                >
                  {isNavItemActive(pathname, buildHref(accentItem.path)) && (
                    <span className="absolute -bottom-2 left-1/2 h-6 w-12 -translate-x-1/2 rounded-full bg-primary/40 blur-[18px]" />
                  )}

                  <span className="sr-only">{t(accentItem.id)}</span>
                  <AccentIcon
                    className="relative z-10 h-[22px] w-[22px] flex-shrink-0 text-slate-900 transition-transform duration-150 group-hover:scale-105"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                  {!isNarrowViewport && (
                    <span className="relative z-10 mt-1 text-[10px] font-semibold leading-none text-slate-900">
                      {t(accentItem.id)}
                    </span>
                  )}
                </Link>
              </div>
            ) : null}

            <NavRail
              items={trailingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="secondary"
              isNarrowViewport={isNarrowViewport}
              onNavClick={handleNavClick}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

type NavRailProps = {
  items: Array<(typeof shellNavItems)[number]>;
  t: ReturnType<typeof useTranslations>;
  pathname: string;
  buildHref: (path: string) => string;
  label: string;
  isNarrowViewport: boolean;
  onNavClick?: (itemId: string) => void;
};

function NavRail({ items, t, pathname, buildHref, label, isNarrowViewport, onNavClick }: NavRailProps) {
  return (
    <ul className="flex flex-1 items-center justify-around gap-1.5 min-w-0" role="list" aria-label={`${t("label")}-${label}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const href = buildHref(item.path);
        const active = isNavItemActive(pathname, href);
        const itemLabel = t(item.id);

        return (
          <li key={item.id} className="flex-1 min-w-0">
            <Link
              href={href}
              prefetch={true}
              onClick={() => onNavClick?.(item.id)}
              aria-current={active ? "page" : undefined}
              aria-label={itemLabel}
              className={cn(
                "nav-item group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 min-w-0",
                isNarrowViewport ? "px-1.5 py-1.5" : "px-1.5 py-1.5 gap-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a14]",
                "active:scale-95",
                active
                  ? "bg-white/6 text-white shadow-[0_6px_18px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
                  : "text-white/70 hover:bg-white/4 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "relative z-10 flex-shrink-0 transition-transform duration-150",
                  isNarrowViewport ? "h-[21px] w-[21px]" : "h-5 w-5",
                  active
                    ? "text-primary scale-105"
                    : "text-white/80 group-hover:text-white"
                )}
                strokeWidth={active ? 2.2 : 1.9}
                aria-hidden="true"
              />

              {!isNarrowViewport && (
                <span className={cn(
                  "relative z-10 text-[11px] font-semibold leading-tight text-center max-w-full whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                    : "text-white/70 group-hover:text-white"
                )}>
                  {itemLabel}
                </span>
              )}

              {active && (
                <span className="absolute -bottom-1 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/70" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
