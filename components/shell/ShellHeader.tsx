"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, CircleUserRound, ArrowLeft } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { CommandMenuLazy } from "@/components/CommandMenuLazy";

export type ShellHeaderProps = {
  onToggleSidebar: () => void;
};

export function ShellHeader({ onToggleSidebar }: ShellHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("brand");
  const localeT = useTranslations("shell");
  const navT = useTranslations("nav");
  const pathname = usePathname();
  const buildHref = (path: string) => `/${locale}${path}`;

  const section = pathname.replace(`/${locale}`, "").split("/")[1] ?? "translate";

  const backLabels: Record<string, string> = {
    practice: navT("practice"),
    resources: navT("resources"),
    profile: navT("profile"),
    news: navT("news"),
  };

  const backTarget = (() => {
    if (section === "translate") {
      return null;
    }

    if (backLabels[section]) {
      return { label: backLabels[section], href: buildHref(`/${section}`) };
    }

    return { label: navT("dashboard"), href: buildHref("/translate") };
  })();

  return (
    <header className="mb-8 rounded-3xl border border-border/50 bg-black/30 p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm text-muted-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            {localeT("menu")}
          </button>
          {backTarget ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 text-muted-foreground"
            >
              <Link href={backTarget.href} aria-label={navT("backToDashboard")}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT("backToSection", { section: backTarget.label })}
              </Link>
            </Button>
          ) : null}
          <Link href={buildHref("/translate")} className="flex items-center gap-3" aria-label={t("full")}>
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
      <p className="mt-4 text-sm text-muted-foreground">{localeT("tagline")}</p>
    </header>
  );
}
