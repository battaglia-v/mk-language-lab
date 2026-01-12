"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { buildLocalizedHref } from "./navItems";
import { UserMenu } from "@/components/auth/UserMenu";

export function ShellHeader() {
  const locale = useLocale();
  const appT = useTranslations("app");
  const localeT = useTranslations("shell");
  const buildHref = (path: string) => buildLocalizedHref(locale, path);

  return (
    <header className="mx-auto mb-6 w-full shell-surface nav-toolbar px-3 sm:px-4 md:px-6 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={buildHref("/learn")}
            className="flex items-center gap-2 sm:gap-3"
            aria-label={appT("displayName")}
            data-testid="shell-brand-link"
          >
            <span className="title-gradient text-xl sm:text-2xl lowercase whitespace-nowrap">македонски</span>
            <span className="hidden text-[11px] uppercase tracking-[0.35em] text-foreground/60 whitespace-nowrap md:inline">
              {appT("shortName").toUpperCase()}
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
