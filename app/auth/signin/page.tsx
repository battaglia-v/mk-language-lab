'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { locales, type Locale } from '@/i18n';

/** Official Google "G" logo SVG */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pathLocale = pathname?.split('/').filter(Boolean)[0];
  const resolvedLocale = locales.includes(pathLocale as Locale) ? (pathLocale as Locale) : 'mk';
  const dashboardPath = `/${resolvedLocale}/learn`;
  const callbackUrl = searchParams?.get('callbackUrl') || dashboardPath;
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleGoogleSignIn = () => {
    // Track sign-in initiation
    trackEvent(AnalyticsEvents.SIGNIN_INITIATED, {
      provider: 'google',
    });

    signIn('google', { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const nextErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      nextErrors.email = 'Email is required';
    }
    if (!formData.password) {
      nextErrors.password = 'Password is required';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Track sign-in initiation
      trackEvent(AnalyticsEvents.SIGNIN_INITIATED, {
        provider: 'credentials',
      });

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setFieldErrors({ general: 'Invalid email or password' });
        return;
      }

      // Redirect to callback URL or home
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setFieldErrors({ general: 'An error occurred during sign-in' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="p-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={dashboardPath} aria-label="Back to home" data-testid="auth-signin-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-8">
          {/* App branding */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 shadow-lg shadow-primary/25">
              <span className="text-3xl font-bold text-black">М</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your Macedonian journey
            </p>
          </div>

          <Card className="border-0 bg-card/80 shadow-xl backdrop-blur">
            <CardContent className="p-6 space-y-4">
              {/* Google Sign-In - Primary CTA */}
              {/* eslint-disable-next-line react/forbid-elements -- Custom Google-branded button styling */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/50 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                aria-label="Continue with Google"
                data-testid="auth-signin-google"
              >
                <GoogleLogo className="h-5 w-5" />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
                </div>
              </div>

            {/* Error Message */}
            {fieldErrors.general && (
              <div
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600"
                role="alert"
                aria-live="assertive"
              >
                {fieldErrors.general}
              </div>
            )}

            {/* Email Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  data-testid="auth-signin-email"
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-red-500" role="alert" aria-live="assertive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  data-testid="auth-signin-password"
                />
                {fieldErrors.password && (
                  <p id="password-error" className="text-xs text-red-500" role="alert" aria-live="assertive">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-black font-medium mt-2"
                disabled={isLoading}
                aria-label="Sign in with email and password"
                data-testid="auth-signin-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in with Email
                  </>
                )}
              </Button>
            </form>
            </CardContent>
          </Card>

          {/* Footer links */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
                data-testid="auth-signin-signup-link"
              >
                Sign up
              </Link>
            </p>
            <p className="text-xs text-muted-foreground/70">
              By signing in, you agree to our{' '}
              <Link
                href={`/${resolvedLocale}/about`}
                className="underline hover:text-foreground"
                data-testid="auth-signin-terms-link"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
