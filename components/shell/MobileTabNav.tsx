"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";

export function MobileTabNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 text-white w-full"
      aria-label={t("label")}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
    >
      <div className="mx-auto w-full max-w-2xl px-3 pb-3 pt-2">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/12 bg-[color-mix(in_srgb,var(--mk-bg-surface)_92%,#05060f_82%)] shadow-[0_-14px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex items-end justify-between gap-2 px-2 pb-2.5 pt-3 min-w-0">
            <NavRail
              items={leadingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="primary"
            />

            {accentItem && AccentIcon ? (
              <Link
                href={buildHref(accentItem.path)}
                prefetch={true}
                aria-current={isNavItemActive(pathname, buildHref(accentItem.path)) ? "page" : undefined}
                className={cn(
                  "relative flex h-14 w-14 min-w-[3.5rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-br from-amber-300 via-primary to-amber-500 text-slate-900 shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mk-bg)]",
                  "hover:scale-[1.03] active:scale-[0.98]",
                )}
              >
                <span className="sr-only">{t(accentItem.id)}</span>
                <AccentIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[8px] font-bold uppercase tracking-wider leading-none">
                  {t(accentItem.id)}
                </span>
              </Link>
            ) : null}

            <NavRail
              items={trailingItems}
              t={t}
              pathname={pathname}
              buildHref={buildHref}
              label="secondary"
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
};

function NavRail({ items, t, pathname, buildHref, label }: NavRailProps) {
  return (
    <ul className="flex flex-1 items-center justify-around gap-1 min-w-0" role="list" aria-label={`${t("label")}-${label}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const href = buildHref(item.path);
        const active = isNavItemActive(pathname, href);
        return (
          <li key={item.id} className="flex-1 min-w-0">
            <Link
              href={href}
              prefetch={true}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-semibold transition-all duration-200 min-w-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mk-bg)]",
                active
                  ? "bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-lg ring-1 ring-sidebar-ring/40"
                  : "text-white/75 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-primary" : "text-white/80")} aria-hidden="true" />
              <span className="text-[9px] leading-tight text-center max-w-full truncate px-0.5">{t(item.id)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
