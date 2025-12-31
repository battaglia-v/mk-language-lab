import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { awardXP } from '@/lib/gamification/xp';

/**
 * POST /api/practice/complete
 *
 * Awards XP for completing a practice session.
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth().catch(() => null);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { xp, mode, difficulty, correct: _correct, total: _total } = body;

    if (typeof xp !== 'number' || xp < 0 || xp > 100) {
      return NextResponse.json(
        { error: 'Invalid XP amount' },
        { status: 400 }
      );
    }

    // Award XP to user
    const result = await awardXP(
      session.user.id,
      xp,
      `PRACTICE_SESSION:${mode || 'word-sprint'}:${difficulty || 'unknown'}`
    );

    return NextResponse.json({
      success: true,
      xpAwarded: xp,
      totalXP: result.xp,
      level: result.levelName,
      leveledUp: result.leveledUp,
    });
  } catch (error) {
    console.error('[api.practice.complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
