'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Verification Failed',
    description: 'The sign in link is no longer valid. It may have already been used.',
  },
  OAuthSignin: {
    title: 'OAuth Sign-In Error',
    description: 'Error occurred during the OAuth sign-in process.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred during the OAuth callback process.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create OAuth provider account.',
  },
  EmailCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create email provider account.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error occurred during callback to the application.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'To confirm your identity, sign in with the same account you used originally.',
  },
  EmailSignin: {
    title: 'Email Sign-In Error',
    description: 'Check your email address and try again.',
  },
  CredentialsSignin: {
    title: 'Sign-In Error',
    description: 'Sign in failed. Check the details you provided are correct.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'Please sign in to access this page.',
  },
  default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'default';
  const errorInfo = errorMessages[error] || errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/60 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription className="mt-2">{errorInfo.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <strong>Debug Info:</strong> Error type: {error}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin" data-testid="auth-error-try-again">
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/" data-testid="auth-error-go-home">
                Go to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
