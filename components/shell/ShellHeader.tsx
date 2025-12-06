"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { buildLocalizedHref } from "./navItems";
import { UserMenu } from "@/components/auth/UserMenu";

export type ShellHeaderProps = {
  onToggleSidebar: () => void;
};

export function ShellHeader({ onToggleSidebar }: ShellHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("brand");
  const localeT = useTranslations("shell");
  const navT = useTranslations("nav");
  const pathname = usePathname();
  const buildHref = (path: string) => buildLocalizedHref(locale, path);

  const section = pathname.replace(`/${locale}`, "").split("/")[1] || "dashboard";

  // Pages that handle their own back navigation - don't show header back button
  const pagesWithOwnBackButton = ["practice", "resources", "notifications", "profile", "news", "discover", "translate"];

  const backKey =
    section === "discover" || section === "lesson" || section === "daily-lessons"
      ? "lessons"
      : section;

  const backLabel = (() => {
    switch (backKey) {
      case "lessons":
        return navT("lessons");
      default:
        return navT("dashboard");
    }
  })();

  const backHref = backKey === "lessons"
    ? buildHref("/discover")
    : buildHref("/dashboard");

  // Only show back button for sections that don't have their own back navigation
  const backTarget = (section === "dashboard" || pagesWithOwnBackButton.includes(section))
    ? null
    : { label: backLabel, href: backHref };

  return (
    <header className="mx-auto mb-6 w-full max-w-full shell-surface nav-toolbar px-3 sm:px-4 md:px-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm text-muted-foreground lg:hidden"
          >
            <Menu className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{localeT("menu")}</span>
          </button>
          {backTarget ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden min-h-[44px] max-w-[200px] items-center gap-2 rounded-full border border-border/60 px-3 text-muted-foreground sm:inline-flex"
            >
              <Link href={backTarget.href} aria-label={navT("backToDashboard")}>
                <ArrowLeft className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{navT("backToSection", { section: backTarget.label })}</span>
              </Link>
            </Button>
          ) : null}
          <Link href={buildHref("/dashboard")} className="flex items-center gap-2 sm:gap-3" aria-label={t("full")}>
            <span className="title-gradient text-xl sm:text-2xl lowercase whitespace-nowrap">македонски</span>
            <span className="hidden text-[11px] uppercase tracking-[0.35em] text-muted-foreground whitespace-nowrap md:inline">
              MK LANGUAGE LAB
            </span>
          </Link>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
      <p className="mt-2 hidden text-xs text-muted-foreground sm:block">{localeT("tagline")}</p>
    </header>
  );
}
