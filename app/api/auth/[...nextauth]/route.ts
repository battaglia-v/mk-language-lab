import { NextRequest, NextResponse } from 'next/server';
import { handlers } from '@/lib/auth';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';

export const { GET } = handlers;

// Wrap POST handler with rate limiting for credentials sign-in
export async function POST(request: NextRequest) {
  // Check if this is a credentials sign-in attempt
  const url = new URL(request.url);
  const isSignIn = url.pathname.includes('callback/credentials');

  if (isSignIn) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit: rateLimitMax, reset, remaining } = await checkRateLimit(authRateLimit, `signin:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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
  }

  // Delegate to NextAuth handler
  return handlers.POST(request);
}
