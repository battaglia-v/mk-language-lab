import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, CircleUserRound, Languages, LayoutDashboard, Newspaper, Sparkles } from "lucide-react";
import { locales } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedHref } from "@/components/shell/navItems";

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

  const primaryCtaClasses =
    "w-full justify-center bg-amber-400 text-slate-900 shadow-[0_18px_50px_-25px_rgba(250,204,21,0.6)] hover:bg-amber-300 hover:shadow-[0_20px_60px_-20px_rgba(250,204,21,0.7)] active:bg-amber-500";

  const secondaryCtaClasses =
    "w-full justify-center bg-emerald-500 text-slate-950 shadow-[0_18px_50px_-25px_rgba(16,185,129,0.65)] hover:bg-emerald-400 hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.8)] active:bg-emerald-600";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6 md:gap-14 lg:px-0">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 px-6 py-10 shadow-2xl sm:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" aria-hidden />
        <div className="relative space-y-7 text-slate-50">
          <Badge
            variant="outline"
            className="gap-2 border-amber-400/60 bg-amber-400/10 text-xs uppercase tracking-[0.35em] text-amber-200"
          >
            {homeT("badge")}
          </Badge>
          <div className="space-y-4 text-balance">
            <p className="text-sm font-semibold text-amber-300">{homeT("learn")}</p>
            <h1 className="text-3xl font-bold leading-[1.1] sm:text-4xl">{homeT("title")}</h1>
            <p className="max-w-2xl text-base text-slate-200 sm:text-lg">{homeT("subtitle")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className={`${primaryCtaClasses} sm:w-auto`}>
              <Link href={translateHref} className="gap-2">
                {homeT("ctaTranslate")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" className={`${secondaryCtaClasses} sm:w-auto`}>
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
                className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200 shadow-lg"
              >
                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
                <span className="leading-snug text-pretty">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">{navT("dashboard")}</p>
          <h2 className="text-2xl font-semibold text-slate-50">Build your session</h2>
          <p className="mx-auto max-w-2xl text-slate-200">
            Choose a focus area, keep navigation consistent across screen sizes, and jump directly into the tool you need.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = featureIconMap[feature.id];
            return (
              <Card
                key={feature.id}
                className="h-full border border-slate-800 bg-slate-900 text-slate-50 shadow-xl transition hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-2xl"
              >
                <CardHeader className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-amber-200">
                    <Icon className="h-4 w-4 text-amber-300" aria-hidden />
                    <span className="font-semibold text-slate-50">{navT(feature.id)}</span>
                  </div>
                  <CardTitle className="text-lg text-slate-50">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-200 text-pretty">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className={primaryCtaClasses}>
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
    </div>
  );
}
