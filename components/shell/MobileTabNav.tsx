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
      <div className="mx-auto w-full max-w-[520px] px-3 pointer-events-auto">
        <div className="relative isolate w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0a0d1a]/95 shadow-[0_-10px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl ring-1 ring-white/5">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              background:
                "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.06), transparent 42%), radial-gradient(circle at 82% 6%, rgba(246,216,59,0.09), transparent 38%)",
            }}
          />

          <div className="relative flex items-center justify-between gap-1.5 px-3 py-2.5 min-w-0">
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
                  "nav-accent-button group relative flex h-14 w-14 min-w-[3.5rem] flex-shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-200",
                  "bg-gradient-to-br from-[#ffe16a] via-primary to-[#f1b700]",
                  "shadow-[0_10px_26px_rgba(0,0,0,0.42),0_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-white/40",
                  "hover:-translate-y-[2px] active:translate-y-[1px]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d1a]"
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
                "nav-item group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 min-w-0",
                isNarrowViewport ? "px-2 py-2" : "px-2.5 py-2.5 gap-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d1a]",
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
                    ? "text-white"
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
