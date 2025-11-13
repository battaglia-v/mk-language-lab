import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { auth } from '@/lib/auth';

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const redirectTarget = request.nextUrl.searchParams.get('redirect_uri');
  if (!redirectTarget) {
    return NextResponse.json({ error: 'Missing redirect_uri' }, { status: 400 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('[mobile-auth:expo-complete] Missing NEXTAUTH_SECRET');
    return buildClientRedirect(redirectTarget, { error: 'server_error' });
  }

  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return buildClientRedirect(redirectTarget, { error: 'unauthorized' });
  }

  const token = await encode({
    token: {
      sub: session.user.id,
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      picture: session.user.image ?? undefined,
      role: (session.user as Record<string, unknown>)?.role as string | undefined,
    },
    secret,
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  const expiresAt = new Date(Date.now() + TOKEN_MAX_AGE_SECONDS * 1000).toISOString();

  return buildClientRedirect(redirectTarget, {
    token,
    expiresAt,
  });
}

function buildClientRedirect(target: string, params: Record<string, string | undefined>) {
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(target);
  } catch (error) {
    console.error('[mobile-auth:expo-complete] Invalid redirect URI', target, error);
    return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      redirectUrl.searchParams.set(key, value);
    }
  });

  const encoded = redirectUrl.toString();
  const escaped = encoded.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${escaped}" />
    <title>Returning to MK Language Lab</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 2rem; line-height: 1.4; }
    </style>
  </head>
  <body>
    <p>Redirecting back to the MK Language Lab app&hellip;</p>
    <p>If you are not redirected automatically, <a href="${escaped}">tap here</a>.</p>
    <script>
      window.location.replace(${JSON.stringify(encoded)});
    </script>
  </body>
</html>`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
