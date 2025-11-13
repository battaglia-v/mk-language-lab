import { NextRequest, NextResponse } from 'next/server';
import { isAllowedMobileRedirect } from '@/lib/mobile-auth-redirect';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');

  if (!redirectUri || !isAllowedMobileRedirect(redirectUri)) {
    return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
  }

  const callbackUrl = new URL(`${url.origin}/api/mobile/auth/callback`);
  callbackUrl.searchParams.set('redirect_uri', redirectUri);
  if (state) {
    callbackUrl.searchParams.set('state', state);
  }

  const signInUrl = new URL(`${url.origin}/api/auth/signin`);
  signInUrl.searchParams.set('callbackUrl', callbackUrl.toString());

  return NextResponse.redirect(signInUrl);
}
