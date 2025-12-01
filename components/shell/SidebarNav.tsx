"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";

export type SidebarNavProps = {
  isOpen: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ isOpen, onNavigate }: SidebarNavProps) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-out lg:w-[72px] xl:w-72 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-sidebar-border px-6 py-5 xl:px-6">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{t("label")}</p>
            <p className="text-xl font-semibold mk-gradient xl:text-2xl">македонски</p>
          </div>
          <span className="hidden rounded-full border border-sidebar-border px-3 py-1 text-[11px] text-sidebar-foreground/70 xl:inline-flex">
            lab
          </span>
        </div>
        <nav className="flex flex-col gap-2 px-2 py-6 xl:px-4" aria-label={t("label")}>
          {shellNavItems.map((item) => {
            const Icon = item.icon;
            const href = buildHref(item.path);
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={item.id}
                href={href}
                className={cn(
                  "group icon-gap flex items-center rounded-2xl px-3 py-3 text-sm font-semibold transition justify-center xl:justify-start",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="icon-base" aria-hidden="true" />
                <span className="hidden xl:inline">{t(item.id)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onNavigate}
        />
      ) : null}
    </>
  );
}
