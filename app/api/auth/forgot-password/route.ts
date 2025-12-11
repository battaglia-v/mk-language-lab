import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  // Rate limiting - prevent email enumeration
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const { success, limit: rateLimitMax, reset, remaining } = await checkRateLimit(authRateLimit, `forgot-password:${ip}`);

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
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid email' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Always return success to prevent email enumeration
    // But only actually send email if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true },
    });

    // Only send reset email for users who have a password (not OAuth-only)
    if (user?.password) {
      const token = await createPasswordResetToken(email);
      if (token) {
        await sendPasswordResetEmail(email, token, user.name);
      }
    }

    // Always return generic success message
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
