import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { auth } from '@/lib/auth';
import { isAllowedMobileRedirect } from '@/lib/mobile-auth-redirect';

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');

  if (!redirectUri || !isAllowedMobileRedirect(redirectUri)) {
    return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
  }

  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    const authorizeUrl = new URL(`${url.origin}/api/mobile/auth/authorize`);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    if (state) {
      authorizeUrl.searchParams.set('state', state);
    }
    return NextResponse.redirect(authorizeUrl);
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('[api.mobile.auth.callback] Missing NEXTAUTH_SECRET');
    return NextResponse.json({ error: 'Auth misconfigured' }, { status: 500 });
  }

  const token = await encode({
    token: {
      sub: session.user.id,
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      picture: session.user.image ?? undefined,
      role: session.user.role ?? undefined,
    },
    secret,
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  const expiresAt = new Date(Date.now() + TOKEN_MAX_AGE_SECONDS * 1000).toISOString();
  const params = new URLSearchParams({
    token,
    expiresAt,
  });
  if (state) {
    params.set('state', state);
  }
  if (session.user.name) {
    params.set('name', session.user.name);
  }
  if (session.user.email) {
    params.set('email', session.user.email);
  }

  return NextResponse.redirect(appendParams(redirectUri, params));
}

function appendParams(uri: string, params: URLSearchParams) {
  const separator = uri.includes('?') ? '&' : '?';
  return `${uri}${separator}${params.toString()}`;
}
