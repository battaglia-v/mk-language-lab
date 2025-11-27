import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BookOpen,
  CircleUserRound,
  Languages,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { locales } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedHref, shellNavItems } from "@/components/shell/navItems";

const featureIconMap = {
  translate: Languages,
  practice: Sparkles,
  news: Newspaper,
  resources: BookOpen,
  profile: CircleUserRound,
  dashboard: LayoutDashboard,
};

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: LocalePageProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as (typeof locales)[number]) ? locale : locales[0];

  const navT = await getTranslations("nav");
  const homeT = await getTranslations("home");

  const translateHref = buildLocalizedHref(safeLocale, "/translate");
  const practiceHref = buildLocalizedHref(safeLocale, "/practice");
  const newsHref = buildLocalizedHref(safeLocale, "/news");
  const resourcesHref = buildLocalizedHref(safeLocale, "/resources");

  const heroHighlights = [
    homeT("heroHighlightTranslate"),
    homeT("heroHighlightResources"),
    homeT("heroHighlightNews"),
  ];

  const featureCards = [
    {
      id: "translate" as const,
      title: homeT("translateFeatureTitle"),
      description: homeT("translateFeatureDescription"),
      href: translateHref,
      cta: homeT("ctaTranslate"),
    },
    {
      id: "practice" as const,
      title: homeT("actionCards.continue.title"),
      description: homeT("actionCards.continue.description"),
      href: practiceHref,
      cta: homeT("actionCards.continue.cta"),
    },
    {
      id: "resources" as const,
      title: homeT("resourcesFeatureTitle"),
      description: homeT("resourcesFeatureDescription"),
      href: resourcesHref,
      cta: homeT("ctaResources"),
    },
    {
      id: "news" as const,
      title: homeT("newsFeatureTitle"),
      description: homeT("newsFeatureDescription"),
      href: newsHref,
      cta: homeT("ctaNews"),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:gap-16 md:px-6 lg:px-0">
      <section className="glass-card relative overflow-hidden rounded-3xl border border-border/40 bg-card/70 p-8 shadow-xl sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="gap-2 bg-background/60 text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {homeT("badge")}
            </Badge>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">{homeT("learn")}</p>
              <h1 className="text-3xl font-bold leading-[1.15] sm:text-4xl">{homeT("title")}</h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{homeT("subtitle")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="w-full justify-center sm:w-auto">
                <Link href={translateHref} className="gap-2">
                  {homeT("ctaTranslate")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full justify-center sm:w-auto">
                <Link href={practiceHref} className="gap-2">
                  {homeT("actionCards.continue.cta")}
                  <Sparkles className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Key highlights">
              {heroHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/40 p-4 text-sm text-muted-foreground"
                >
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                  <span className="leading-snug">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-border/30 bg-gradient-to-br from-background/60 via-card/70 to-primary/5 p-6 shadow-lg">
            <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-3 text-sm text-muted-foreground">
              <Smartphone className="h-5 w-5 text-primary" aria-hidden />
              <span>Mobile-first navigation with consistent icons</span>
            </div>
            <div className="mt-4 space-y-3 rounded-2xl border border-border/30 bg-background/50 p-4">
              {shellNavItems.slice(0, 4).map((item) => {
                const Icon = featureIconMap[item.id];
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-card/70 p-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold">{navT(item.id)}</p>
                        <p className="text-xs text-muted-foreground">{buildLocalizedHref(safeLocale, item.path)}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              <span>Improved routing clarity for every destination</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">{navT("dashboard")}</p>
          <h2 className="text-2xl font-semibold">Build your session</h2>
          <p className="max-w-2xl text-muted-foreground">
            Choose a focus area, keep navigation consistent across screen sizes, and jump directly into the tool you need.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = featureIconMap[feature.id];
            return (
              <Card
                key={feature.id}
                className="h-full border border-border/50 bg-card/70 shadow-sm transition hover:-translate-y-1 hover:border-border"
              >
                <CardHeader className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <span className="font-semibold text-foreground">{navT(feature.id)}</span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full justify-center">
                    <Link href={feature.href} className="gap-2">
                      {feature.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Navigation audit</p>
          <h2 className="text-2xl font-semibold">Every tab, mapped clearly</h2>
          <p className="max-w-3xl text-muted-foreground">
            Use this navigation map to verify that each icon routes to the expected page. All links respect the current locale and
            maintain consistent labeling for screen readers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shellNavItems.map((item) => {
            const Icon = featureIconMap[item.id];
            const href = buildLocalizedHref(safeLocale, item.path);
            const description =
              item.id === "dashboard"
                ? navT("dashboard")
                : item.id === "profile"
                  ? navT("profile")
                  : featureCards.find((feature) => feature.id === item.id)?.description ?? navT(item.id);
            return (
              <Card key={item.id} className="border border-border/50 bg-card/70">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{navT(item.id)}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">{description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="truncate" title={href}>
                    {href}
                  </span>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href={href}>
                      {navT(item.id)}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
