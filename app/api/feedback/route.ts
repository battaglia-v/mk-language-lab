import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { sendFeedbackNotification } from '@/lib/email';

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
 * Stores feedback in the Feedback table for admin review.
 * Falls back to logging if database isn't available.
 */
export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const feedbackData = {
      type: data.type,
      message: data.message,
      email: data.email || session?.user?.email || null,
      rating: data.rating,
      context: data.context,
      submittedAt: new Date().toISOString(),
      userId: session?.user?.id || null,
      userName: session?.user?.name || null,
    };

    // Try to store in database
    let feedbackId = `fb_${Date.now()}`;
    
    try {
      // Check if user exists before creating notification
      if (session?.user?.id) {
        const feedback = await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'user_feedback',
            title: `[${data.type.toUpperCase()}] User Feedback`,
            body: JSON.stringify(feedbackData),
            isRead: false,
          },
        });
        feedbackId = feedback.id;
      } else {
        // For anonymous users, store without userId relation
        // Log it so it's captured somewhere
        console.log('[api.feedback] Anonymous feedback received:', JSON.stringify(feedbackData, null, 2));
        
        // Try to find a system/admin user to attach this to
        const adminUser = await prisma.user.findFirst({
          where: { role: 'admin' },
          select: { id: true },
        });
        
        if (adminUser) {
          const feedback = await prisma.notification.create({
            data: {
              userId: adminUser.id,
              type: 'user_feedback',
              title: `[${data.type.toUpperCase()}] Anonymous Feedback`,
              body: JSON.stringify(feedbackData),
              isRead: false,
            },
          });
          feedbackId = feedback.id;
        }
      }
    } catch (dbError) {
      // Database might not be available, log the feedback
      console.error('[api.feedback] Database error, logging feedback instead:', dbError);
      console.log('[api.feedback] Feedback data:', JSON.stringify(feedbackData, null, 2));
    }

    // Send email notification to admin
    await sendFeedbackNotification(feedbackData).catch((err) => {
      console.error('[api.feedback] Failed to send email notification:', err);
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
      id: feedbackId,
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

