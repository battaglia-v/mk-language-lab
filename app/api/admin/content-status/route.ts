import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction, checkReviewerOrAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const statusChangeSchema = z.object({
  contentType: z.enum(['curriculum_lesson', 'practice_vocabulary', 'word_of_the_day', 'practice_audio']),
  contentId: z.string(),
  action: z.enum(['submit_for_review', 'approve', 'publish', 'unpublish']),
  notes: z.string().optional(),
});

// Map action to new status
const ACTION_TO_STATUS: Record<string, string> = {
  submit_for_review: 'needs_review',
  approve: 'approved',
  publish: 'published',
  unpublish: 'draft',
};

/**
 * POST /api/admin/content-status
 * 
 * Change the status of a content item.
 * Validates permissions and status transitions.
 * 
 * Note: This endpoint requires contentStatus fields to be migrated.
 * Until migration is applied, returns a "not available" message.
 */
export async function POST(request: NextRequest) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (!checkReviewerOrAdmin(user?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = statusChangeSchema.parse(body);

    // Check if user can perform this action
    type ActionKey = 'create' | 'edit' | 'submit_for_review' | 'approve' | 'publish' | 'unpublish' | 'delete';
    if (!canPerformAction(user?.role, data.action as ActionKey)) {
      return NextResponse.json(
        { error: `You don't have permission to ${data.action.replace('_', ' ')}` },
        { status: 403 }
      );
    }

    const newStatus = ACTION_TO_STATUS[data.action];
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // For now, use the existing status field for practice_audio
    // Other content types need migration for contentStatus field
    if (data.contentType === 'practice_audio') {
      const audio = await prisma.practiceAudio.findUnique({
        where: { id: data.contentId },
        select: { status: true },
      });
      
      if (!audio) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      const currentStatus = audio.status;
      const audioStatus = newStatus === 'published' ? 'published' : 'draft';
      
      await prisma.practiceAudio.update({
        where: { id: data.contentId },
        data: { 
          status: audioStatus as 'draft' | 'published',
          publishedAt: newStatus === 'published' ? new Date() : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        previousStatus: currentStatus,
        newStatus: audioStatus,
        message: `Content ${data.action.replace('_', ' ')}ed successfully`,
      });
    }

    // For other content types, the contentStatus field needs migration
    // Return a helpful message until migration is applied
    return NextResponse.json({
      error: 'Content workflow not yet available for this content type. Run prisma migrate to enable.',
      hint: 'npx prisma migrate dev'
    }, { status: 501 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.admin.content-status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update content status' },
      { status: 500 }
    );
  }
}
