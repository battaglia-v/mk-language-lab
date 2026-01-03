'use client';

import { ReactNode } from 'react';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

interface GoogleOneTapProviderProps {
  children: ReactNode;
}

/**
 * Provides Google One Tap sign-in prompt across the app.
 * Only shows for unauthenticated users and not on auth pages.
 */
export function GoogleOneTapProvider({ children }: GoogleOneTapProviderProps) {
  // Get client ID from environment variable
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <>
      {clientId && (
        <GoogleOneTap
          clientId={clientId}
          callbackUrl="/en/learn"
          autoPrompt={true}
          context="signin"
        />
      )}
      {children}
    </>
  );
}
