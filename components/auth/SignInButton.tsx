'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface SignInButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SignInButton({ variant = 'default', size = 'default', className }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <Button variant={variant} size={size} onClick={handleSignIn} className={className}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  );
}
