import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkReviewerOrAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/content-history
 * 
 * Fetch edit history for a specific content item.
 * Requires reviewer or admin role.
 * 
 * Note: This endpoint requires the ContentEditLog model to be migrated.
 * Until migration is applied, returns empty history.
 * 
 * Query params:
 * - contentType: 'curriculum_lesson' | 'practice_vocabulary' | 'word_of_the_day' | 'practice_audio'
 * - contentId: ID of the content item
 */
export async function GET(request: NextRequest) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is reviewer or admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!checkReviewerOrAdmin(user?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get('contentType');
  const contentId = searchParams.get('contentId');

  if (!contentType || !contentId) {
    return NextResponse.json(
      { error: 'Missing contentType or contentId' },
      { status: 400 }
    );
  }

  try {
    // Check if ContentEditLog model exists (migration applied)
    // For now, return empty array until migration is applied
    // TODO: Remove this check after running prisma migrate
    const hasContentEditLog = 'contentEditLog' in prisma;
    
    if (!hasContentEditLog) {
      // Migration not yet applied - return empty history
      return NextResponse.json([]);
    }

    const editLogs = await prisma.contentEditLog.findMany({
      where: {
        contentType,
        contentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Fetch user names for the logs
    const userIds = [...new Set(editLogs.map((log: { userId: string }) => log.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    // Enrich logs with user names
    interface EditLog {
      id: string;
      action: string;
      userId: string;
      changes: unknown;
      previousStatus: string | null;
      newStatus: string | null;
      notes: string | null;
      createdAt: Date;
    }
    
    const enrichedLogs = editLogs.map((log: EditLog) => ({
      id: log.id,
      action: log.action,
      userId: log.userId,
      userName: userMap.get(log.userId) || 'Unknown',
      changes: log.changes,
      previousStatus: log.previousStatus,
      newStatus: log.newStatus,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json(enrichedLogs);
  } catch (error) {
    console.error('[api.admin.content-history] Error:', error);
    // If error is due to missing table, return empty array
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: 'Failed to fetch edit history' },
      { status: 500 }
    );
  }
}
