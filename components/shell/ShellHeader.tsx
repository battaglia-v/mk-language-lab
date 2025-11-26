"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu, CircleUserRound } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";

export type ShellHeaderProps = {
  onToggleSidebar: () => void;
};

export function ShellHeader({ onToggleSidebar }: ShellHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("brand");
  const localeT = useTranslations("shell");
  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <header className="mb-6 shell-surface nav-toolbar px-4 md:px-6">
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
          <Link href={buildHref("/translate")} className="flex items-center gap-3" aria-label={t("full")}>
            <span className="title-gradient text-2xl lowercase">македонски</span>
            <span className="hidden text-[11px] uppercase tracking-[0.35em] text-muted-foreground md:inline">
              MK LANGUAGE LAB
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden rounded-full border border-border/60 bg-transparent px-3 text-muted-foreground hover:text-foreground sm:inline-flex"
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
      <p className="mt-2 hidden text-xs text-muted-foreground sm:block">{localeT("tagline")}</p>
    </header>
  );
}
