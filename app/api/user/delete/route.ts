import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';

const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  password: z.string().optional(), // Required for password-based accounts
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const { success } = await checkRateLimit(authRateLimit, `delete-account:${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = deleteAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Get user with password to check if they need to verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has a password (not OAuth-only), require password verification
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required to delete your account.' },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Incorrect password.' },
          { status: 400 }
        );
      }
    }

    // Delete user - cascades to all related data
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    console.log('[ACCOUNT_DELETION] Account deleted:', {
      userId: session.user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted.',
    });
  } catch (error) {
    console.error('[ACCOUNT_DELETION ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
