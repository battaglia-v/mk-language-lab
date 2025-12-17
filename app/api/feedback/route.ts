import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'content']),
  message: z.string().min(10).max(2000),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5).optional(),
  context: z.object({
    page: z.string().optional(),
    userAgent: z.string().optional(),
    locale: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/feedback
 * 
 * Submit user feedback for the app.
 * Stores feedback in the Notification table with type 'user_feedback'
 * for admin review.
 */
export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    // Store feedback as a notification for admins to review
    // Using the Notification model with a special type
    const feedback = await prisma.notification.create({
      data: {
        userId: session?.user?.id || 'anonymous',
        type: 'user_feedback',
        title: `[${data.type.toUpperCase()}] User Feedback`,
        body: JSON.stringify({
          message: data.message,
          email: data.email || session?.user?.email,
          rating: data.rating,
          context: data.context,
          submittedAt: new Date().toISOString(),
          userId: session?.user?.id || 'anonymous',
          userName: session?.user?.name,
        }),
        isRead: false,
      },
    });

    // Track the feedback submission
    trackEvent(AnalyticsEvents.FEEDBACK_SUBMITTED, {
      type: data.type,
      rating: data.rating ?? 0,
      hasEmail: !!data.email,
      isAuthenticated: !!session?.user?.id,
    });

    return NextResponse.json({
      success: true,
      id: feedback.id,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.feedback] Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * 
 * Admin endpoint to retrieve all user feedback.
 * Requires admin role.
 */
export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const feedback = await prisma.notification.findMany({
      where: { type: 'user_feedback' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Parse the body JSON for each feedback item
    const parsedFeedback = feedback.map((f: { id: string; createdAt: Date; isRead: boolean; body: string }) => ({
      id: f.id,
      createdAt: f.createdAt,
      isRead: f.isRead,
      ...JSON.parse(f.body),
    }));

    return NextResponse.json(parsedFeedback);
  } catch (error) {
    console.error('[api.feedback] Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

