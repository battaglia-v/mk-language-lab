import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import { issueMobileAuthToken } from '@/lib/mobile-auth-token';
import { createScopedLogger } from '@/lib/logger';

const log = createScopedLogger('api.mobile.auth.google');

// All valid Google Client IDs that can issue tokens
// Web client ID is used by both web app and native SDK for token exchange
const GOOGLE_WEB_CLIENT_ID = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
// Android client ID - tokens from native Android SDK
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID;
// iOS client ID - tokens from native iOS SDK
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID;

// Accept tokens from any of our client IDs
const VALID_AUDIENCES = [
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
].filter(Boolean) as string[];

const client = new OAuth2Client();

/**
 * POST /api/mobile/auth/google
 * 
 * Authenticate with Google ID token from native mobile app.
 * Verifies the token with Google, creates/updates user, returns JWT.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    log.info('Google auth request received', { hasToken: !!idToken });

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    if (VALID_AUDIENCES.length === 0) {
      log.error('No Google Client IDs configured');
      return NextResponse.json(
        { error: 'Google authentication not configured' },
        { status: 500 }
      );
    }

    log.info('Verifying token with audiences', { audiences: VALID_AUDIENCES });

    // Verify the ID token with Google - accept any of our client IDs as audience
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: VALID_AUDIENCES,
      });
      payload = ticket.getPayload();
      log.info('Token verified successfully', { email: payload?.email });
    } catch (verifyError) {
      log.error('Failed to verify Google token', { error: verifyError });
      return NextResponse.json(
        { error: 'Invalid Google token. Please try again.' },
        { status: 401 }
      );
    }

    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          image: picture,
          emailVerified: new Date(), // Google emails are verified
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      // Initialize game progress for new user
      await prisma.gameProgress.create({
        data: {
          userId: user.id,
          xp: 0,
          streak: 0,
        },
      });

      log.info('New user created via Google', { userId: user.id, email });
    } else {
      // Update existing user's image if changed
      if (picture && user.image !== picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: picture },
        });
        user.image = picture;
      }

      log.info('Existing user signed in via Google', { userId: user.id, email });
    }

    // Link Google account if not already linked
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'google',
      },
    });

    if (!existingAccount && googleId) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleId,
        },
      });
    }

    // Generate mobile JWT token
    const { token, expiresAt } = await issueMobileAuthToken({
      id: user.id,
      email: user.email!,
      name: user.name,
      image: user.image,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token,
      expiresAt,
    });
  } catch (error) {
    log.error('Google auth error', { error });
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
