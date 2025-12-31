import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Play } from "lucide-react";
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

  const homeT = await getTranslations("home");

  // Guest lesson link - goes directly to practice session
  // Note: Using difficulty=all because vocabulary data defaults to 'mixed' difficulty
  const startLessonHref = `/${safeLocale}/practice/session?deck=curated&difficulty=all`;
  const signInHref = `/${safeLocale}/auth/signin`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {homeT("title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {homeT("guestSubtitle", { default: "5 minutes a day to start speaking." })}
          </p>
        </div>

        {/* Primary CTA */}
        <Button asChild size="lg" className="w-full gap-2 text-lg min-h-[56px]">
          <Link href={startLessonHref}>
            <Play className="h-5 w-5" fill="currentColor" />
            {homeT("guestCta", { default: "Start Learning" })}
          </Link>
        </Button>

        {/* Sign in link */}
        <p className="text-sm text-muted-foreground">
          {homeT("guestSignIn", { default: "Already have an account?" })}{" "}
          <Link href={signInHref} className="font-medium text-primary hover:underline">
            {homeT("guestSignInLink", { default: "Sign in" })}
          </Link>
        </p>
      </div>
    </div>
  );
}
