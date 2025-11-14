import type { NextRequest } from 'next/server';
import { decode } from 'next-auth/jwt';

export type MobileSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
};

export async function getMobileSessionFromRequest(request: NextRequest): Promise<MobileSession | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return null;
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('[mobile-auth] Missing NEXTAUTH_SECRET');
    return null;
  }

  try {
    const payload = await decode({ token, secret, salt: '' });
    if (!payload?.sub) {
      return null;
    }

    return {
      user: {
        id: payload.sub,
        name: typeof payload.name === 'string' ? payload.name : null,
        email: typeof payload.email === 'string' ? payload.email : null,
        image: typeof payload.picture === 'string' ? payload.picture : null,
        role: typeof payload.role === 'string' ? payload.role : null,
      },
    };
  } catch (error) {
    console.warn('[mobile-auth] Failed to decode bearer token', error);
    return null;
  }
}
