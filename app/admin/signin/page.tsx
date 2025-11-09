'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function AdminSignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // If user is already signed in as admin, redirect to admin panel
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin');
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn('google', { callbackUrl: '/admin' });
    } catch (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  // Show error if user is signed in but not admin
  const isNonAdmin = status === 'authenticated' && session?.user?.role !== 'admin';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-none font-semibold">Admin Sign In</h2>
              <CardDescription className="mt-2">
                Sign in with an authorized admin account to access the admin panel
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isNonAdmin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Access Denied</p>
                  <p className="text-sm mt-1">
                    Your account ({session?.user?.email}) does not have admin privileges.
                    Please contact the site administrator if you believe this is an error.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {!isNonAdmin && (
              <>
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full gap-3 py-6"
                  size="lg"
                  disabled={signingIn || status === 'loading'}
                >
                  <Chrome className="h-5 w-5" />
                  {signingIn ? 'Signing in...' : 'Continue with Google'}
                </Button>

                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      This area is restricted to authorized administrators only.
                      Only pre-approved Google accounts will be granted access.
                    </p>
                  </AlertDescription>
                </Alert>
              </>
            )}

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

export default function AdminSignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AdminSignInContent />
    </Suspense>
  );
}
