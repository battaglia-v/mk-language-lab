"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShellHeaderProps = {
  onToggleSidebar: () => void;
};

export function ShellHeader({ onToggleSidebar }: ShellHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("brand");
  const localeT = useTranslations("shell");
  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <header className="mb-8 flex flex-col gap-6 rounded-3xl glass-panel p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            {localeT("menu")}
          </button>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">{localeT("eyebrow")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-semibold leading-tight mk-gradient">македонски</span>
            <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <p className="mt-2 max-w-3xl text-base text-muted-foreground">{localeT("tagline")}</p>
        </div>
        <div className="hidden flex-col gap-3 text-right sm:flex">
          <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t("full")}</span>
          <p className="text-lg font-medium text-muted-foreground">{localeT("status")}</p>
          <span className="text-3xl font-semibold text-foreground">{localeT("statusValue")}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={buildHref("/translate")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg",
          )}
        >
          {localeT("ctaTranslate")}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={buildHref("/practice")}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-transparent px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {localeT("ctaPractice")}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={buildHref("/resources")}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-transparent px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {localeT("ctaResources")}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
