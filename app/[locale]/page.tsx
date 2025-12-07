import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, CircleUserRound, Languages, LayoutDashboard, Newspaper, Sparkles } from "lucide-react";
import { locales } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { buildLocalizedHref } from "@/components/shell/navItems";
import { auth } from "@/lib/auth";

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

  // Redirect authenticated users to the Learn page
  const session = await auth().catch(() => null);
  if (session?.user) {
    redirect(`/${safeLocale}/learn`);
  }

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
    <div className="mx-auto flex w-full min-w-0 flex-col gap-8 px-0 py-6 sm:gap-12 sm:py-10 md:gap-14">
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-5 py-8 shadow-2xl sm:rounded-3xl sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" aria-hidden />
        <div className="relative space-y-5 text-slate-50 sm:space-y-7">
          <Badge
            variant="outline"
            className="gap-2 break-words border-amber-400/60 bg-amber-400/10 text-xs uppercase tracking-[0.2em] text-amber-200 sm:tracking-[0.35em]"
          >
            {homeT("badge")}
          </Badge>
          <div className="space-y-3 text-balance sm:space-y-4">
            <p className="break-words text-xs font-semibold text-amber-300 sm:text-sm">{homeT("learn")}</p>
            <h1 className="break-words text-balance text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{homeT("title")}</h1>
            <p className="max-w-2xl break-words text-sm text-slate-200 sm:text-base md:text-lg">{homeT("subtitle")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className={`${primaryCtaClasses} min-h-[44px] sm:w-auto`}>
              <Link href={translateHref} className="gap-2">
                {homeT("ctaTranslate")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" className={`${secondaryCtaClasses} min-h-[44px] sm:w-auto`}>
              <Link href={practiceHref} className="gap-2">
                {homeT("actionCards.continue.cta")}
                <Sparkles className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <ul className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3" aria-label="Key highlights">
            {heroHighlights.map((highlight) => (
              <li
                key={highlight}
                className="flex min-w-0 items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-xs text-slate-200 shadow-lg sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm"
              >
                <div className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-amber-400" aria-hidden />
                <span className="break-words leading-snug text-pretty">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2 text-center sm:space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300 sm:text-sm sm:tracking-[0.35em]">{navT("dashboard")}</p>
          <h2 className="break-words text-balance text-xl font-semibold text-slate-50 sm:text-2xl">Build your session</h2>
          <p className="mx-auto max-w-2xl break-words text-sm text-slate-200 sm:text-base">
            Choose a focus area and jump directly into the tool you need.
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = featureIconMap[feature.id];
            return (
              <Card
                key={feature.id}
                className="h-full min-w-0 border border-slate-800 bg-slate-900 text-slate-50 shadow-xl transition hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-2xl"
              >
                <CardHeader className="min-w-0 space-y-2.5 sm:space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-amber-200">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 text-amber-300 sm:h-4 sm:w-4" aria-hidden />
                    <span className="break-words font-semibold text-slate-50">{navT(feature.id)}</span>
                  </div>
                  <h3 className="break-words text-balance text-base font-semibold leading-none text-slate-50 sm:text-lg">{feature.title}</h3>
                  <CardDescription className="break-words text-pretty text-sm leading-relaxed text-slate-200">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0">
                  <Button asChild className={`${primaryCtaClasses} min-h-[44px]`}>
                    <Link href={feature.href} className="gap-2">
                      <span className="break-words">{feature.cta}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden />
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
