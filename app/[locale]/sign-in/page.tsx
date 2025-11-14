'use client';

import SignInPage from '@/app/auth/signin/page';

/**
 * Locale-aware wrapper that reuses the global sign-in experience so
 * /en/sign-in and /mk/sign-in behave identically to /auth/signin.
 */
export default function LocalizedSignInPage() {
  return <SignInPage />;
}
