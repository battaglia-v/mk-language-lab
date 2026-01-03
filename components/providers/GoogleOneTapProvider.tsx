'use client';

import { ReactNode } from 'react';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

interface GoogleOneTapProviderProps {
  children: ReactNode;
}

/**
 * Provides Google One Tap sign-in prompt across the app.
 * Only shows for unauthenticated users and not on auth pages.
 *
 * NOTE: Google One Tap is currently disabled because it requires additional
 * configuration in Google Cloud Console:
 * 1. Add https://mklanguage.com as an authorized JavaScript origin
 * 2. Enable "Sign In With Google" for the OAuth client
 *
 * To re-enable, set NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP=true
 */
export function GoogleOneTapProvider({ children }: GoogleOneTapProviderProps) {
  // Google One Tap disabled until properly configured in Google Cloud Console
  const enableOneTap = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP === 'true';
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <>
      {enableOneTap && clientId && (
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
