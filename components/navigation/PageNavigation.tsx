"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageNavBreadcrumb = {
  label: string;
  href?: string;
};

export type PageNavTab = {
  id: string;
  href: string;
  label?: string;
  messageKey?: string;
  isActive?: (pathname: string) => boolean;
};

const LEARNING_SECTION_TABS: PageNavTab[] = [
  { id: "translate", href: "/translate", messageKey: "translate" },
  {
    id: "daily-lessons",
    href: "/daily-lessons",
    messageKey: "dailyLessons",
    isActive: (pathname: string) => pathname.includes("/lesson/") || pathname.includes("/daily-lessons"),
  },
  { id: "practice", href: "/practice", messageKey: "practice" },
  { id: "discover", href: "/discover", messageKey: "discover" },
  { id: "resources", href: "/resources", messageKey: "resources" },
  { id: "news", href: "/news", messageKey: "news" },
  { id: "profile", href: "/profile", messageKey: "profile" },
];

function prefixWithLocale(locale: string, href: string) {
  const normalized = href.startsWith("/") ? href : `/${href}`;
  if (normalized.startsWith(`/${locale}`)) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

function getDirection() {
  if (typeof document === "undefined") return "ltr" as const;
  return (document.dir || "ltr") as const;
}

export type PageNavigationProps = {
  breadcrumbs?: PageNavBreadcrumb[];
  tabs?: PageNavTab[];
  actions?: ReactNode;
};

export function PageNavigation({ breadcrumbs = [], tabs = [], actions }: PageNavigationProps) {
  const t = useTranslations("pageNav");
  const navT = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [direction] = useState<"ltr" | "rtl">(() => getDirection());

  const Chevron = direction === "rtl" ? ChevronLeft : ChevronRight;
  const homeHref = useMemo(() => `/${locale}`, [locale]);
  const crumbTrail = useMemo<PageNavBreadcrumb[]>(
    () => [
      { label: t("home"), href: homeHref },
      ...breadcrumbs,
    ],
    [breadcrumbs, homeHref, t],
  );

  const renderHref = useMemo(
    () => (href: string) => prefixWithLocale(locale, href),
    [locale],
  );

  const resolvedTabs = useMemo(
    () => tabs.filter((tab): tab is PageNavTab => Boolean(tab)),
    [tabs],
  );

  return (
    <div className="space-y-3" dir={direction} data-testid="page-navigation">
      <nav aria-label={t("breadcrumbsLabel")}> 
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-black/30 px-4 py-3 shadow-lg">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {crumbTrail.map((crumb, index) => {
              const isLast = index === crumbTrail.length - 1;
              const content = (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                    isLast ? "bg-primary/10 text-foreground" : "hover:text-foreground",
                  )}
                >
                  {index === 0 ? <Home className="h-4 w-4" aria-hidden="true" /> : null}
                  <span>{crumb.label}</span>
                </span>
              );

              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href && !isLast ? (
                    <Link href={renderHref(crumb.href)} className="focus:outline-none">
                      {content}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>{content}</span>
                  )}
                  {!isLast ? <Chevron className="h-4 w-4 text-border" aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ol>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </nav>

      {resolvedTabs.length ? (
        <nav
          aria-label={t("sectionsLabel")}
          title={t("sectionsHelp")}
          className="rounded-2xl border border-border/60 bg-black/20 p-1"
        >
          <div className="flex flex-wrap gap-2 md:flex-nowrap md:overflow-x-auto">
            {resolvedTabs.map((tab) => {
              const href = renderHref(tab.href);
              const isActive = tab.isActive ? tab.isActive(pathname) : pathname === href || pathname.startsWith(`${href}/`);
              const label = tab.label ?? (tab.messageKey ? navT(tab.messageKey) : tab.id);
              return (
                <Link
                  key={tab.id}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                    isActive
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export function getLearningTabs(): PageNavTab[] {
  return [...LEARNING_SECTION_TABS];
}
