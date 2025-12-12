import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Revalidate every 5 minutes for admin analytics
export const revalidate = 300;

const querySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30),
});

// Types for raw query results
type DateCount = { date: Date; count: bigint };
type DateCountCorrect = { date: Date; count: bigint; correct: bigint };
type LevelCount = { level: string; _count: number };

// Cached query for analytics data
const getCachedAnalytics = unstable_cache(
  async (days: number) => {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      dailyRegistrations,
      dailyActiveUsers,
      dailyExercises,
      topUsers,
      exerciseBreakdown,
      levelDistribution,
    ] = await Promise.all([
      // Daily new user registrations
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Daily active users (users who practiced)
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("attemptedAt") as date, COUNT(DISTINCT "userId") as count
        FROM "ExerciseAttempt"
        WHERE "attemptedAt" >= ${startDate}
        GROUP BY DATE("attemptedAt")
        ORDER BY date ASC
      `,

      // Daily exercise attempts
      prisma.$queryRaw<{ date: Date; count: bigint; correct: bigint }[]>`
        SELECT 
          DATE("attemptedAt") as date, 
          COUNT(*) as count,
          SUM(CASE WHEN "isCorrect" = true THEN 1 ELSE 0 END) as correct
        FROM "ExerciseAttempt"
        WHERE "attemptedAt" >= ${startDate}
        GROUP BY DATE("attemptedAt")
        ORDER BY date ASC
      `,

      // Top users by XP in period
      prisma.gameProgress.findMany({
        take: 10,
        orderBy: { xp: 'desc' },
        where: {
          updatedAt: { gte: startDate },
        },
        select: {
          xp: true,
          streak: true,
          level: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),

      // Exercise type breakdown
      prisma.exerciseAttempt.groupBy({
        by: ['exerciseId'],
        where: { attemptedAt: { gte: startDate } },
        _count: true,
      }),

      // User level distribution
      prisma.gameProgress.groupBy({
        by: ['level'],
        _count: true,
      }),
    ]);

    return {
      dailyRegistrations,
      dailyActiveUsers,
      dailyExercises,
      topUsers,
      exerciseBreakdown,
      levelDistribution,
      startDate,
    };
  },
  ['admin-analytics'],
  { revalidate: 300, tags: ['admin', 'analytics'] } // 5 minute cache
);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { days } = querySchema.parse({
      days: searchParams.get('days') || 30,
    });

    // Use cached analytics query
    const {
      dailyRegistrations,
      dailyActiveUsers,
      dailyExercises,
      topUsers,
      exerciseBreakdown,
      levelDistribution,
      startDate,
    } = await getCachedAnalytics(days);

    // Calculate summary stats
    const totalNewUsers = dailyRegistrations.reduce((sum: number, d: DateCount) => sum + Number(d.count), 0);
    const totalExercises = dailyExercises.reduce((sum: number, d: DateCountCorrect) => sum + Number(d.count), 0);
    const totalCorrect = dailyExercises.reduce((sum: number, d: DateCountCorrect) => sum + Number(d.correct || 0), 0);
    const avgDailyActiveUsers = dailyActiveUsers.length > 0
      ? Math.round(dailyActiveUsers.reduce((sum: number, d: DateCount) => sum + Number(d.count), 0) / dailyActiveUsers.length)
      : 0;

    return NextResponse.json(
      {
        period: { days, startDate, endDate: new Date() },
        summary: {
          totalNewUsers,
          avgDailyActiveUsers,
          totalExercises,
          overallAccuracy: totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0,
        },
        charts: {
          registrations: dailyRegistrations.map((d: DateCount) => ({
            date: d.date,
            count: Number(d.count),
          })),
          activeUsers: dailyActiveUsers.map((d: DateCount) => ({
            date: d.date,
            count: Number(d.count),
          })),
          exercises: dailyExercises.map((d: DateCountCorrect) => ({
            date: d.date,
            total: Number(d.count),
            correct: Number(d.correct || 0),
            accuracy: Number(d.count) > 0 ? Math.round((Number(d.correct || 0) / Number(d.count)) * 100) : 0,
          })),
        },
        leaderboard: topUsers.map((gp: typeof topUsers[number]) => ({
          user: gp.user,
          xp: gp.xp,
          streak: gp.streak,
          level: gp.level,
        })),
        distributions: {
          levels: levelDistribution.map((l: LevelCount) => ({
            level: l.level,
            count: l._count,
          })),
          exerciseTypes: exerciseBreakdown.length,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
          'x-analytics-source': 'cached',
        },
      }
    );
  } catch (error) {
    console.error('[ADMIN_ANALYTICS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
