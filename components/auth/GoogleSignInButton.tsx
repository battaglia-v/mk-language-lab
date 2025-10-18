'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleSignInButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = () => {
    setIsSubmitting(true);
    void signIn('google', { callbackUrl: `/${locale}` });
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full gap-2"
      size="lg"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('signingIn')}
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          {t('signInWith', { provider: 'Google' })}
        </>
      )}
    </Button>
  );
}
