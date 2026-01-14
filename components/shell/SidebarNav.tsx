"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  // Prefetch route on hover for faster navigation
  const handleMouseEnter = (href: string) => {
    router.prefetch(href);
  };

  return (
    /* Desktop sidebar - only visible at lg+ breakpoint */
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-20 2xl:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
      )}
    >
      <div className="flex items-center justify-center gap-3 border-b border-sidebar-border px-6 py-5 2xl:justify-between">
        <div className="hidden flex-col 2xl:flex">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{t("label")}</p>
          <p className="text-xl font-semibold mk-gradient 2xl:text-2xl">🇲🇰 македонски</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2 px-2 py-6 2xl:px-4" aria-label={t("label")}>
        <TooltipProvider delayDuration={300}>
          {shellNavItems.map((item) => {
            const Icon = item.icon;
            const href = buildHref(item.path);
            const active = isNavItemActive(pathname, href);
            const label = t(item.id);
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    prefetch={true}
                    onMouseEnter={() => handleMouseEnter(href)}
                    data-testid={`sidebar-nav-${item.id}`}
                    className={cn(
                      "group icon-gap flex items-center rounded-2xl px-3 py-3.5 text-sm font-semibold transition justify-center 2xl:justify-start min-h-[48px]",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                        : "bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                    aria-label={label}
                  >
                    <Icon className="icon-base" aria-hidden="true" />
                    <span className="hidden 2xl:inline">{label}</span>
                  </Link>
                </TooltipTrigger>
                {/* Only show tooltip when sidebar is collapsed (< 2xl breakpoint) */}
                <TooltipContent 
                  side="right" 
                  className="2xl:hidden font-medium"
                  sideOffset={8}
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
