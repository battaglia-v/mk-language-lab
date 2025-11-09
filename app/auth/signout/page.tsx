'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignOutPage() {
  const [status, setStatus] = useState<'confirming' | 'signing-out' | 'signed-out'>('confirming');

  const handleSignOut = async () => {
    setStatus('signing-out');
    try {
      await signOut({ callbackUrl: '/', redirect: true });
      setStatus('signed-out');
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback to home page if there's an error
      window.location.href = '/';
    }
  };

  // Auto sign out after a short delay if status is signing-out
  useEffect(() => {
    if (status === 'signing-out') {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/60 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          {status === 'confirming' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LogOut className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sign Out</CardTitle>
                <CardDescription className="mt-2">Are you sure you want to sign out?</CardDescription>
              </div>
            </>
          )}

          {status === 'signing-out' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Signing Out</CardTitle>
                <CardDescription className="mt-2">Please wait while we sign you out...</CardDescription>
              </div>
            </>
          )}

          {status === 'signed-out' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Signed Out</CardTitle>
                <CardDescription className="mt-2">You have been successfully signed out</CardDescription>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {status === 'confirming' && (
            <>
              <Button onClick={handleSignOut} variant="destructive" className="w-full" size="lg">
                <LogOut className="mr-2 h-4 w-4" />
                Yes, Sign Out
              </Button>
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/">Cancel</Link>
              </Button>
            </>
          )}

          {status === 'signing-out' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Redirecting you to the homepage...</p>
            </div>
          )}

          {status === 'signed-out' && (
            <Button asChild className="w-full" size="lg">
              <Link href="/">Go to Home</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
