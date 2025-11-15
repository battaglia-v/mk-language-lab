'use client';

import { type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { SignInButton } from './SignInButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthGuardProps {
  children: ReactNode;
  fallbackHeight?: string;
}

export default function AuthGuard({ children, fallbackHeight = 'min-h-[400px]' }: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARD === 'true') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center ${fallbackHeight}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`flex items-center justify-center ${fallbackHeight}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
