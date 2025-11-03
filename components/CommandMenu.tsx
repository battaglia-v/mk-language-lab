"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Command as CommandIcon,
  HelpCircle,
  Languages,
  Library,
  MessageCircle,
  Newspaper,
  RefreshCcw,
  Search,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavCommand = {
  key: string;
  path: string;
  icon: typeof Sparkles;
  labelKey: string;
  descriptionKey: string;
};

type CommandItem = {
  key: NavCommand['key'];
  href: string;
  Icon: NavCommand['icon'];
  label: string;
  description: string;
};

const NAV_COMMANDS: NavCommand[] = [
  { key: "journey", path: "", icon: Sparkles, labelKey: "journey", descriptionKey: "journeyDescription" },
  { key: "practice", path: "/practice", icon: RefreshCcw, labelKey: "practice", descriptionKey: "practiceDescription" },
  { key: "tutor", path: "/tutor", icon: MessageCircle, labelKey: "tutor", descriptionKey: "tutorDescription" },
  { key: "translate", path: "/translate", icon: Languages, labelKey: "translate", descriptionKey: "translateDescription" },
  { key: "news", path: "/news", icon: Newspaper, labelKey: "news", descriptionKey: "newsDescription" },
  { key: "library", path: "/library", icon: Library, labelKey: "library", descriptionKey: "libraryDescription" },
  { key: "resources", path: "/resources", icon: BookOpen, labelKey: "resources", descriptionKey: "resourcesDescription" },
];

export function CommandMenu() {
  const t = useTranslations("common.commandMenu");
  const navTranslations = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }

      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const localePrefix = `/${locale}`;

    return NAV_COMMANDS.map((item) => {
      const Icon = item.icon;
      const href = item.path === "" ? localePrefix : `${localePrefix}${item.path}`;

      return {
        key: item.key,
        href,
        Icon,
        label: navTranslations(item.labelKey),
        description: t(`items.${item.descriptionKey}`),
      };
    });
  }, [locale, navTranslations, t]);

  const filtered = useMemo<CommandItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden md:flex h-10 min-w-[200px] items-center justify-between border-border/40 bg-background/60 text-muted-foreground"
        >
          <span className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" />
            {t("trigger")}
          </span>
          <span className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/50 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide">
            <CommandIcon className="h-3 w-3" />K
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[80vh] w-[min(96vw,560px)] overflow-hidden border border-border/40 bg-background/95 p-0"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Search className="h-4 w-4 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("placeholder")}
            className="h-12 rounded-xl border-border/50 bg-background/80 text-base"
          />

          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/40 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              filtered.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 transition",
                    "hover:border-primary/40 hover:bg-primary/5"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <item.Icon className="h-5 w-5 text-primary" />
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    {t("continue")}
                    <CommandIcon className="h-3 w-3" />K
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-4 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-1.5">
              <CommandIcon className="h-3.5 w-3.5" />
              <span className="font-medium uppercase tracking-wide">{t("shortcutSearch")}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="font-medium uppercase tracking-wide">{t("shortcutHelp")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
