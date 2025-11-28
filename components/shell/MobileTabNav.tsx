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
  const supportingItems = shellNavItems.filter((item) => item.id !== primaryActionId);
  const midpoint = Math.ceil(supportingItems.length / 2);
  const leadingItems = supportingItems.slice(0, midpoint);
  const trailingItems = supportingItems.slice(midpoint);

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 text-white"
      aria-label={t("label")}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="mx-auto max-w-xl px-4 pb-4 pt-3">
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[color-mix(in_srgb,var(--mk-bg-surface)_92%,#05060f_82%)] shadow-[0_-14px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex items-end justify-between gap-2 px-2 pb-3 pt-4">
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
                aria-current={isNavItemActive(pathname, buildHref(accentItem.path)) ? "page" : undefined}
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-primary to-amber-500 text-slate-900 shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mk-bg)]",
                  "hover:scale-[1.03] active:scale-[0.98]",
                )}
              >
                <span className="sr-only">{t(accentItem.id)}</span>
                <AccentIcon className="h-6 w-6" aria-hidden="true" />
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
    <ul className="flex flex-1 items-center justify-evenly gap-1" role="list" aria-label={`${t("label")}-${label}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const href = buildHref(item.path);
        const active = isNavItemActive(pathname, href);
        return (
          <li key={item.id} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mk-bg)]",
                active
                  ? "bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-lg ring-1 ring-sidebar-ring/40"
                  : "text-white/75 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-white/80")} aria-hidden="true" />
              <span className="text-[11px] leading-tight text-center text-balance">{t(item.id)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
