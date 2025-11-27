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

  const primaryCtaClasses =
    "w-full justify-center bg-amber-400 text-slate-900 shadow-[0_18px_50px_-25px_rgba(250,204,21,0.6)] hover:bg-amber-300 hover:shadow-[0_20px_60px_-20px_rgba(250,204,21,0.7)] active:bg-amber-500";

  const secondaryCtaClasses =
    "w-full justify-center bg-emerald-500 text-slate-950 shadow-[0_18px_50px_-25px_rgba(16,185,129,0.65)] hover:bg-emerald-400 hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.8)] active:bg-emerald-600";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 md:gap-16 md:px-6 lg:px-0">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 px-8 py-10 shadow-2xl sm:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" aria-hidden />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7 text-slate-50">
            <Badge
              variant="outline"
              className="gap-2 border-amber-400/60 bg-amber-400/10 text-xs uppercase tracking-[0.35em] text-amber-200"
            >
              {homeT("badge")}
            </Badge>
            <div className="space-y-4">
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
                  <span className="leading-snug">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-800/70 p-3 text-sm text-slate-200">
              <Smartphone className="h-5 w-5 text-amber-300" aria-hidden />
              <span>Mobile-first navigation with consistent icons</span>
            </div>
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              {shellNavItems.slice(0, 4).map((item) => {
                const Icon = featureIconMap[item.id];
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-800/70 p-3 text-slate-50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-amber-300" aria-hidden />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-50">{navT(item.id)}</p>
                        <p className="text-xs text-slate-300">{buildLocalizedHref(safeLocale, item.path)}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-200" aria-hidden />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-sm text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden />
              <span>Improved routing clarity for every destination</span>
            </div>
          </div>
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                  <CardDescription className="text-sm leading-relaxed text-slate-200">
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

      <section className="space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Navigation audit</p>
          <h2 className="text-2xl font-semibold text-slate-50">Every tab, mapped clearly</h2>
          <p className="mx-auto max-w-3xl text-slate-200">
            Use this navigation map to verify that each icon routes to the expected page. All links respect the current locale and
            maintain consistent labeling for screen readers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Card key={item.id} className="border border-slate-800 bg-slate-900 text-slate-50 shadow-xl">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 text-amber-300 shadow-inner">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base text-slate-50">{navT(item.id)}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-slate-200">{description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-slate-200">
                  <span className="truncate" title={href}>
                    {href}
                  </span>
                  <Button asChild size="sm" className="gap-2 bg-slate-800 text-slate-50 hover:bg-slate-700 active:bg-slate-600">
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
