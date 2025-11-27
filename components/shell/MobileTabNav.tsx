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

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border bg-sidebar/95 shadow-lg backdrop-blur"
      aria-label={t("label")}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.9rem)" }}
    >
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-2">
        <ul className="flex items-stretch gap-2 overflow-x-auto pb-1" role="list">
          {shellNavItems.map((item) => {
            const Icon = item.icon;
            const href = buildLocalizedHref(locale, item.path, pathname);
            const active = isNavItemActive(pathname, href);
            return (
              <li key={item.id} className="min-w-[86px] flex-1 basis-0 snap-center">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "bg-sidebar-primary/15 text-primary shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar/80 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className={cn("h-6 w-6", active && "text-primary")} aria-hidden="true" />
                  <span className="text-[11px] leading-tight text-center text-balance">
                    {t(item.id)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
