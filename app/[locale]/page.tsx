import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Play, Sparkles } from "lucide-react";
import { locales } from "@/i18n";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

// Force dynamic rendering to prevent caching issues with auth
export const dynamic = 'force-dynamic';

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: LocalePageProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as (typeof locales)[number]) ? locale : locales[0];

  // Check authentication
  const session = await auth().catch(() => null);

  // Redirect authenticated users to the Learn page
  if (session?.user) {
    redirect(`/${safeLocale}/learn`);
    return null;
  }

  // Explicitly pass locale to ensure proper translation loading
  const homeT = await getTranslations({ locale: safeLocale, namespace: "home" });

  // Guest lesson link - goes directly to practice session
  // Note: Using difficulty=all because vocabulary data defaults to 'mixed' difficulty
  const beginnerHref = `/${safeLocale}/learn?level=beginner`;
  const intermediateHref = `/${safeLocale}/learn?level=intermediate`;
  const signInHref = `/${safeLocale}/sign-in`;
  const signUpHref = `/auth/signup`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center pt-12 pb-8">
      <div className="w-full space-y-8 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {homeT("title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {homeT("guestSubtitle")}
          </p>
        </div>

        {/* Level Selection */}
        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {homeT("levelPrompt")}
          </div>
          <div className="grid gap-3">
            <Button
              asChild
              size="lg"
              className="w-full gap-2 text-lg min-h-[56px] text-black"
              data-testid="cta-start-here"
            >
              <Link href={beginnerHref}>
                <Play className="h-5 w-5" fill="currentColor" />
                {homeT("levelBeginner")} <span className="text-sm font-semibold">A1</span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full gap-2 text-lg min-h-[56px]"
              data-testid="home-level-intermediate"
            >
              <Link href={intermediateHref}>
                <Sparkles className="h-5 w-5" />
                {homeT("levelIntermediate")} <span className="text-sm font-semibold">A2</span>
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{homeT("levelHelper")}</p>
        </div>

        {/* Auth links */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {homeT("guestSignUp")}{" "}
            <Link
              href={signUpHref}
              className="font-medium text-primary hover:underline"
              data-testid="home-sign-up"
            >
              {homeT("guestSignUpLink")}
            </Link>
          </p>
          <p>
            {homeT("guestSignIn")}{" "}
            <Link
              href={signInHref}
              className="font-medium text-primary hover:underline"
              data-testid="home-sign-in"
            >
              {homeT("guestSignInLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
