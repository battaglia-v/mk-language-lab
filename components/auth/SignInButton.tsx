'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface SignInButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  dataTestId?: string;
}

export function SignInButton({
  variant = 'default',
  size = 'default',
  className,
  dataTestId = 'user-menu-signin',
}: SignInButtonProps) {
  const t = useTranslations('userMenu');
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignIn}
      className={className}
      data-testid={dataTestId}
    >
      <LogIn className="mr-2 h-4 w-4" />
      {t('signIn')}
    </Button>
  );
}
