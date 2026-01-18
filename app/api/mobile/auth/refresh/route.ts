import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import { encode } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * POST /api/mobile/auth/refresh
 *
 * Refresh the mobile auth token.
 * Requires a valid existing token in the Authorization header.
 *
 * Request: Authorization: Bearer <current-token>
 *
 * Response:
 * {
 *   token: "<new-jwt-token>",
 *   user: { id, name, email, image }
 * }
 */
export async function POST(request: NextRequest) {
  const mobileSession = await getMobileSessionFromRequest(request);

  if (!mobileSession?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('[mobile-auth-refresh] Missing NEXTAUTH_SECRET');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: mobileSession.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Generate new token with extended expiry (30 days)
    const newToken = await encode({
      token: {
        sub: user.id,
        name: user.name,
        email: user.email,
        picture: user.image,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      secret,
      salt: '',
    });

    return NextResponse.json({
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('[mobile-auth-refresh] Token refresh failed:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
