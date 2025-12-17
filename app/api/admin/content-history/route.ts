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
    const editLogs = await prisma.contentEditLog.findMany({
      where: {
        contentType,
        contentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 entries
    });

    // Fetch user names for the logs
    const userIds = [...new Set(editLogs.map((log) => log.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    // Enrich logs with user names
    const enrichedLogs = editLogs.map((log) => ({
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
    return NextResponse.json(
      { error: 'Failed to fetch edit history' },
      { status: 500 }
    );
  }
}

