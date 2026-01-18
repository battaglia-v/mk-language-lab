import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import { getA1Path, getA2Path, getB1Path } from '@/lib/learn/curriculum-path';

/**
 * GET /api/mobile/curriculum
 *
 * Returns curriculum paths for all levels.
 * Works for both authenticated and unauthenticated users.
 *
 * - Authenticated: Returns paths with user progress (completed lessons tracked)
 * - Unauthenticated: Returns paths without progress (all lessons available)
 */
export async function GET(request: NextRequest) {
  // Try to get user session (optional)
  const mobileSession = await getMobileSessionFromRequest(request);
  const userId = mobileSession?.user?.id;

  try {
    // Fetch all curriculum paths (with user progress if authenticated)
    const [a1Path, a2Path, b1Path] = await Promise.all([
      getA1Path(userId),
      getA2Path(userId),
      getB1Path(userId),
    ]);

    return NextResponse.json({
      paths: {
        a1: a1Path,
        a2: a2Path,
        b1: b1Path,
      },
      authenticated: !!userId,
    }, {
      headers: {
        // Cache for 5 minutes for unauthenticated, no cache for authenticated
        'Cache-Control': userId
          ? 'private, no-cache'
          : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[api.mobile.curriculum] Failed to fetch curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to load curriculum' },
      { status: 500 }
    );
  }
}
