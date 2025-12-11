import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  role: z.enum(['all', 'user', 'admin']).default('all'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      role: searchParams.get('role') || 'all',
    });

    const { search, page, limit, sortBy, sortOrder, role } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ];
    }

    if (role !== 'all') {
      where.role = role;
    }

    // Get users and total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              exerciseAttempts: true,
              lessonProgress: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get additional stats for each user
    type UserWithCount = (typeof users)[number];
    const usersWithStats = await Promise.all(
      users.map(async (user: UserWithCount) => {
        const gameProgress = await prisma.gameProgress.findUnique({
          where: { userId: user.id },
          select: { streak: true, xp: true, level: true },
        });

        return {
          ...user,
          stats: {
            exerciseAttempts: user._count.exerciseAttempts,
            lessonsCompleted: user._count.lessonProgress,
            streak: gameProgress?.streak ?? 0,
            xp: gameProgress?.xp ?? 0,
            level: gameProgress?.level ?? 'beginner',
          },
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats.map(({ _count, ...user }) => user),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[ADMIN_USERS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
