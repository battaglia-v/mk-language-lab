"use client";

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthGuardProps {
  children: ReactNode;
  fallbackHeight?: string;
}

export default function AuthGuard({ children, fallbackHeight = 'min-h-[60vh]' }: AuthGuardProps) {
  const { status } = useSession();
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center ${fallbackHeight}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">{tCommon('loading')}</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className={`${fallbackHeight} flex items-center justify-center px-4`}>
        <Card className="max-w-md w-full bg-card/70 backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">{tAuth('authRequiredTitle')}</CardTitle>
            <CardDescription className="text-base">
              {tAuth('authRequiredDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="gap-2">
              <Link href={`/${locale}/auth/signin`}>
                {tAuth('goToSignIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
