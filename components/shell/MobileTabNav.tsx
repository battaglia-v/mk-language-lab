"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";

export function MobileTabNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track viewport width for adaptive layout
  useEffect(() => {
    setMounted(true);
    const checkWidth = () => {
      setIsNarrowViewport(window.innerWidth < 375);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const primaryActionId: (typeof shellNavItems)[number]["id"] = "practice";
  const accentItem = shellNavItems.find((item) => item.id === primaryActionId);
  const AccentIcon = accentItem?.icon;
  const supportingItems = shellNavItems.filter(
    (item) => item.id !== primaryActionId && item.id !== "profile"
  );
  const midpoint = Math.ceil(supportingItems.length / 2);
  const leadingItems = supportingItems.slice(0, midpoint);
  const trailingItems = supportingItems.slice(midpoint);

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none",
        mounted && "mobile-nav-mounted"
      )}
      aria-label={t("label")}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-2 pointer-events-auto">
        <div className="relative w-full rounded-t-[32px] border-t-2 border-x-2 border-white/15 bg-gradient-to-b from-[#0a0b14] to-[#06070e] shadow-[0_-12px_40px_rgba(0,0,0,0.5),0_-4px_12px_rgba(246,216,59,0.1)] backdrop-blur-xl overflow-hidden">
          {/* Ambient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2.5 min-w-0 relative">
            <NavRail
              items={leadingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="primary"
              isNarrowViewport={isNarrowViewport}
            />

            {accentItem && AccentIcon ? (
              <Link
                href={buildHref(accentItem.path)}
                prefetch={true}
                aria-current={isNavItemActive(pathname, buildHref(accentItem.path)) ? "page" : undefined}
                aria-label={t(accentItem.id)}
                className={cn(
                  "nav-accent-button group relative flex h-16 w-16 min-w-[4rem] flex-shrink-0 flex-col items-center justify-center rounded-[24px] transition-all duration-300",
                  "bg-gradient-to-br from-[#ffd93d] via-primary to-[#ffb800]",
                  "shadow-[0_8px_24px_rgba(246,216,59,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]",
                  "hover:scale-[1.05] active:scale-[0.95]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070e]",
                  "transform-gpu"
                )}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Pulsing glow for active state */}
                {isNavItemActive(pathname, buildHref(accentItem.path)) && (
                  <div className="absolute inset-0 rounded-[24px] animate-pulse-glow"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(246,216,59,0.6) 0%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}
                  />
                )}

                <span className="sr-only">{t(accentItem.id)}</span>
                <AccentIcon
                  className="relative z-10 h-6 w-6 flex-shrink-0 text-slate-900 transition-transform duration-200 group-hover:scale-110"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {!isNarrowViewport && (
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.08em] leading-none text-slate-900 mt-0.5">
                    {t(accentItem.id)}
                  </span>
                )}
              </Link>
            ) : null}

            <NavRail
              items={trailingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="secondary"
              isNarrowViewport={isNarrowViewport}
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
};

function NavRail({ items, t, pathname, buildHref, label, isNarrowViewport }: NavRailProps) {
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
              aria-current={active ? "page" : undefined}
              aria-label={isNarrowViewport ? itemLabel : undefined}
              className={cn(
                "nav-item group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 min-w-0 overflow-hidden",
                isNarrowViewport ? "px-2 py-2.5 gap-0" : "px-2.5 py-2 gap-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070e]",
                "transform-gpu",
                active
                  ? "bg-gradient-to-b from-primary/20 to-primary/10 shadow-[0_2px_8px_rgba(246,216,59,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "hover:bg-white/5 active:bg-white/10",
              )}
            >
              {/* Ripple effect container */}
              <span className="absolute inset-0 overflow-hidden rounded-2xl">
                <span className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(246,216,59,0.15) 0%, transparent 70%)'
                  }}
                />
              </span>

              <Icon
                className={cn(
                  "relative z-10 flex-shrink-0 transition-all duration-300",
                  isNarrowViewport ? "h-6 w-6" : "h-5 w-5",
                  active
                    ? "text-primary scale-110 drop-shadow-[0_2px_4px_rgba(246,216,59,0.5)]"
                    : "text-white/70 group-hover:text-white/90 group-hover:scale-105"
                )}
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />

              {!isNarrowViewport && (
                <span className={cn(
                  "relative z-10 text-[10px] font-bold leading-tight text-center max-w-full whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300",
                  active
                    ? "text-primary"
                    : "text-white/65 group-hover:text-white/85"
                )}>
                  {itemLabel}
                </span>
              )}

              {/* Active indicator dot */}
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(246,216,59,0.8)] animate-pulse" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
