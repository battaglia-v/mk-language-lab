import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/[id]/read - Mark notification as read
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: updated.id,
        isRead: updated.isRead,
        readAt: updated.readAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('[api.notifications.read] Failed to mark as read', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
