"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { shellNavItems } from "./navItems";

export function MobileTabNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border bg-sidebar/95 backdrop-blur"
      aria-label={t("label")}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
    >
      <div className="px-2 pt-2 pb-1">
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-4 md:grid-cols-8">
          {shellNavItems.map((item) => {
            const Icon = item.icon;
            const href = buildHref(item.path);
            const isDashboard = item.path === "/";
            const active = isDashboard
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-xs font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary/10 text-primary shadow-sm"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary") } aria-hidden="true" />
                <span className="text-[11px] leading-tight text-center break-words">
                  {t(item.id)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
