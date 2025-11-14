import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.number().int().min(0).max(23),
  quietHoursEnd: z.number().int().min(0).max(23),
  streakRemindersEnabled: z.boolean().default(true),
  dailyNudgesEnabled: z.boolean().default(true),
});

/**
 * GET /api/reminders/settings - Get user reminder settings
 */
export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // For now, we'll use Mission table to store reminder windows
    // In production, you might want a dedicated ReminderSettings table
    const mission = await prisma.mission.findUnique({
      where: { userId: session.user.id },
    });

    // Default settings if no mission exists
    const settings = {
      quietHoursEnabled: false,
      quietHoursStart: 22, // 10 PM
      quietHoursEnd: 8, // 8 AM
      streakRemindersEnabled: true,
      dailyNudgesEnabled: true,
      reminderWindows: mission?.reminderWindows || [],
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[api.reminders.settings] Failed to fetch settings', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminder settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders/settings - Update user reminder settings
 */
export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = settingsSchema.parse(body);

    // Store settings in user metadata or dedicated table
    // For now, we'll use a simple approach with Mission table
    await prisma.mission.upsert({
      where: { userId: session.user.id },
      update: {
        // Store as JSON in a metadata field (you might want to add this to schema)
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        goal: 'conversation', // default
        level: 'beginner', // default
        dailyGoalMinutes: 20,
        reminderWindows: [],
      },
    });

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.reminders.settings] Failed to update settings', error);
    return NextResponse.json(
      { error: 'Failed to update reminder settings' },
      { status: 500 }
    );
  }
}
