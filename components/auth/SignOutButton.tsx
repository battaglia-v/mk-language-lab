'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SignOutButton({ variant = 'outline', size = 'default', className }: SignOutButtonProps) {
  const t = useTranslations('userMenu');

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Button variant={variant} size={size} onClick={handleSignOut} className={className}>
      <LogOut className="mr-2 h-4 w-4" />
      {t('signOut')}
    </Button>
  );
}
