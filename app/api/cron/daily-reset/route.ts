import { NextResponse } from 'next/server';
import { resetDailyXP } from '@/lib/gamification/xp';

/**
 * Cron job to reset daily XP at midnight UTC
 * Schedule: 0 0 * * * (midnight UTC daily)
 *
 * This ensures todayXP is reset in the database for all users,
 * maintaining consistency even if users don't open the app.
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require authorization
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await resetDailyXP();

    console.log(`[CRON] Daily XP reset complete: ${result.reset} users updated`);

    return NextResponse.json({
      success: true,
      message: `Daily XP reset for ${result.reset} users`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Daily reset failed:', error);
    return NextResponse.json(
      { error: 'Daily reset failed' },
      { status: 500 }
    );
  }
}
