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
      <div className="px-4 pt-3 pb-2">
        <div className="mx-auto max-w-4xl overflow-x-auto">
          <div className="grid min-w-[360px] grid-flow-col auto-cols-[minmax(88px,1fr)] grid-cols-4 gap-3 sm:min-w-0 sm:grid-flow-row sm:grid-cols-6">
            {shellNavItems.map((item) => {
              const Icon = item.icon;
              const href = buildLocalizedHref(locale, item.path, pathname);
              const active = isNavItemActive(pathname, href);
              return (
                <Link
                  key={item.id}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-medium transition-all duration-200",
                    active
                      ? "bg-sidebar-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6", active && "text-primary")} aria-hidden="true" />
                  <span className="text-[11px] leading-tight text-center break-words">
                    {t(item.id)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
