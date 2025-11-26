'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chrome, ArrowLeft, Loader2 } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Sign in to access your learning progress and personalized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign-In */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full gap-3 py-6"
              size="lg"
              disabled={isLoading}
              aria-label="Continue with Google"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
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

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-sm text-red-500" role="alert" aria-live="assertive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                {fieldErrors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-500"
                    role="alert"
                    aria-live="assertive"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-6"
                size="lg"
                disabled={isLoading}
                aria-label="Sign in with email and password"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Sign-Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                By signing in, you agree to our{' '}
                <Link href="/about" className="underline hover:text-foreground">
                  Terms of Service
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
