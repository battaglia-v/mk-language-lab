import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeEmailVerificationToken } from '@/lib/tokens';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid token' },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Verify and consume token
    const success = await consumeEmailVerificationToken(token);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link.' },
        { status: 400 }
      );
    }

    console.log('[VERIFY_EMAIL] Email verified successfully');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('[VERIFY_EMAIL ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
