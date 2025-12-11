import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  // Rate limiting - prevent spam
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const { success, limit: rateLimitMax, reset, remaining } = await checkRateLimit(authRateLimit, `resend-verification:${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitMax.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const validation = resendVerificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid email' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists and is not already verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'If your account exists and is not verified, you will receive a verification email.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'This email is already verified.' },
        { status: 400 }
      );
    }

    // Create and send verification email
    const token = await createEmailVerificationToken(email);
    if (token) {
      await sendVerificationEmail(email, token, user.name);
    }

    return NextResponse.json({
      success: true,
      message: 'If your account exists and is not verified, you will receive a verification email.',
    });
  } catch (error) {
    console.error('[RESEND_VERIFICATION ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
