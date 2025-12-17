import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canPerformAction, isValidStatusTransition, checkReviewerOrAdmin } from '@/lib/admin';

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
    if (!canPerformAction(user?.role, data.action as keyof typeof canPerformAction)) {
      return NextResponse.json(
        { error: `You don't have permission to ${data.action.replace('_', ' ')}` },
        { status: 403 }
      );
    }

    const newStatus = ACTION_TO_STATUS[data.action];
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get current content status based on type
    let currentStatus: string | null = null;

    switch (data.contentType) {
      case 'curriculum_lesson': {
        const lesson = await prisma.curriculumLesson.findUnique({
          where: { id: data.contentId },
          select: { contentStatus: true },
        });
        currentStatus = lesson?.contentStatus ?? null;
        break;
      }
      case 'practice_vocabulary': {
        const vocab = await prisma.practiceVocabulary.findUnique({
          where: { id: data.contentId },
          select: { contentStatus: true },
        });
        currentStatus = vocab?.contentStatus ?? null;
        break;
      }
      case 'word_of_the_day': {
        const wotd = await prisma.wordOfTheDay.findUnique({
          where: { id: data.contentId },
          select: { contentStatus: true },
        });
        currentStatus = wotd?.contentStatus ?? null;
        break;
      }
      case 'practice_audio': {
        const audio = await prisma.practiceAudio.findUnique({
          where: { id: data.contentId },
          select: { status: true },
        });
        // Map PracticeAudioStatus to ContentStatus
        currentStatus = audio?.status ?? null;
        break;
      }
    }

    if (!currentStatus) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Validate status transition
    if (!isValidStatusTransition(currentStatus as Parameters<typeof isValidStatusTransition>[0], newStatus)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Update content status and log the change
    const now = new Date();
    const updateData: Record<string, unknown> = {
      lastEditedBy: session.user.id,
      lastEditedAt: now,
    };

    // Add approval/publish metadata
    if (data.action === 'approve') {
      updateData.approvedBy = session.user.id;
      updateData.approvedAt = now;
    }
    if (data.action === 'publish') {
      updateData.publishedBy = session.user.id;
      updateData.publishedAt = now;
    }

    // Update the content based on type
    switch (data.contentType) {
      case 'curriculum_lesson':
        await prisma.curriculumLesson.update({
          where: { id: data.contentId },
          data: { ...updateData, contentStatus: newStatus as never },
        });
        break;
      case 'practice_vocabulary':
        await prisma.practiceVocabulary.update({
          where: { id: data.contentId },
          data: { ...updateData, contentStatus: newStatus as never },
        });
        break;
      case 'word_of_the_day':
        await prisma.wordOfTheDay.update({
          where: { id: data.contentId },
          data: { ...updateData, contentStatus: newStatus as never },
        });
        break;
      case 'practice_audio':
        // For practice audio, map to PracticeAudioStatus
        const audioStatus = newStatus === 'published' ? 'published' : 'draft';
        await prisma.practiceAudio.update({
          where: { id: data.contentId },
          data: { ...updateData, status: audioStatus as never },
        });
        break;
    }

    // Create edit log entry
    await prisma.contentEditLog.create({
      data: {
        contentType: data.contentType,
        contentId: data.contentId,
        userId: session.user.id,
        action: data.action,
        previousStatus: currentStatus,
        newStatus: newStatus,
        notes: data.notes,
      },
    });

    return NextResponse.json({
      success: true,
      previousStatus: currentStatus,
      newStatus: newStatus,
      message: `Content ${data.action.replace('_', ' ')}ed successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
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

