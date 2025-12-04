import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Languages, Sparkles, Newspaper, BookOpen, CircleUserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildLocalizedHref } from "@/components/shell/navItems";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

type ActionConfig = {
  id: "translate" | "practice" | "news" | "resources" | "profile";
  icon: LucideIcon;
  path: string;
  mobileHidden?: boolean;
  getDescription: (deps: { homeT: Translator; profileT: Translator }) => string;
};

const ACTIONS: ActionConfig[] = [
  {
    id: "translate",
    icon: Languages,
    path: "/translate",
    getDescription: ({ homeT }) => homeT("translateFeatureDescription"),
  },
  {
    id: "practice",
    icon: Sparkles,
    path: "/practice",
    getDescription: ({ homeT }) => homeT("actionCards.continue.description"),
  },
  {
    id: "news",
    icon: Newspaper,
    path: "/news",
    mobileHidden: true,
    getDescription: ({ homeT }) => homeT("newsFeatureDescription"),
  },
  {
    id: "resources",
    icon: BookOpen,
    path: "/resources",
    mobileHidden: true,
    getDescription: ({ homeT }) => homeT("resourcesFeatureDescription"),
  },
  {
    id: "profile",
    icon: CircleUserRound,
    path: "/profile",
    mobileHidden: true,
    getDescription: ({ profileT }) => profileT("profile"),
  },
];

export default async function DashboardPage() {
  const locale = await getLocale();
  const navT = await getTranslations("nav");
  const homeT = await getTranslations("home");
  const profileT = await getTranslations("shell");

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <div className="space-y-3 text-balance">
        <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">{navT("home")}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{navT("dashboard")}</h1>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{homeT("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const description = action.getDescription({ homeT, profileT });
          const href = buildLocalizedHref(locale, action.path);
          return (
            <Card
              key={action.id}
              className={cn(
                "glass-card flex h-full flex-col border border-border/50 shadow-xl transition hover:translate-y-[-2px] hover:border-border",
                action.mobileHidden && "hidden md:flex",
              )}
            >
              <CardHeader className="flex-1 space-y-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-black/40 px-3 py-1.5 text-xs text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <span className="font-semibold text-foreground">{navT(action.id)}</span>
                </div>
                <CardTitle className="text-xl font-bold">{navT(action.id)}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-card-text-muted">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full justify-center font-bold !text-black" size="lg">
                  <Link href={href}>{navT(action.id)}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
