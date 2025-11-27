"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, CircleUserRound, ArrowLeft } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { CommandMenuLazy } from "@/components/CommandMenuLazy";
import { buildLocalizedHref } from "./navItems";

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

  const backKey =
    section === "discover" || section === "lesson" || section === "daily-lessons"
      ? "lessons"
      : section;

  const backLabel = (() => {
    switch (backKey) {
      case "practice":
        return navT("practice");
      case "resources":
        return navT("resources");
      case "notifications":
        return navT("notifications");
      case "profile":
        return navT("profile");
      case "news":
        return navT("news");
      case "lessons":
        return navT("lessons");
      default:
        return navT("dashboard");
    }
  })();

  const backHref = backKey === "lessons"
    ? buildHref("/discover")
    : buildHref(backKey === "dashboard" ? "/dashboard" : `/${backKey}`);

  const backTarget = section === "dashboard" ? null : { label: backLabel, href: backHref };

  return (
    <header className="mx-auto mb-6 max-w-6xl shell-surface nav-toolbar px-4 md:px-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="touch-target inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm text-muted-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            {localeT("menu")}
          </button>
          {backTarget ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden items-center gap-2 rounded-full border border-border/60 px-3 text-muted-foreground sm:inline-flex"
            >
              <Link href={backTarget.href} aria-label={navT("backToDashboard")}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT("backToSection", { section: backTarget.label })}
              </Link>
            </Button>
          ) : null}
          <Link href={buildHref("/dashboard")} className="flex items-center gap-3" aria-label={t("full")}>
            <span className="title-gradient text-2xl lowercase">македонски</span>
            <span className="hidden text-[11px] uppercase tracking-[0.35em] text-muted-foreground md:inline">
              MK LANGUAGE LAB
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">⌘K</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">Ctrl+K</span>
            <span className="text-muted-foreground">{navT("quickActions")}</span>
          </div>
          <CommandMenuLazy />
          <LanguageSwitcher />
          <div className="hidden sm:inline-flex">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full border border-border/60 bg-transparent px-3 text-muted-foreground hover:text-foreground"
            >
              <Link href={buildHref("/profile")}
                className="inline-flex items-center gap-2"
              >
                <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                {localeT("profile")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 hidden text-xs text-muted-foreground sm:block">{localeT("tagline")}</p>
    </header>
  );
}
