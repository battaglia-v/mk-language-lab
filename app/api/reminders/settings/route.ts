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
  reminderWindows: z.array(z.string()).default([]),
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
    const [mission, storedSettings] = await Promise.all([
      prisma.mission.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.reminderSettings.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const settings = {
      quietHoursEnabled: storedSettings?.quietHoursEnabled ?? false,
      quietHoursStart: storedSettings?.quietHoursStart ?? 22,
      quietHoursEnd: storedSettings?.quietHoursEnd ?? 8,
      streakRemindersEnabled: storedSettings?.streakRemindersEnabled ?? true,
      dailyNudgesEnabled: storedSettings?.dailyNudgesEnabled ?? true,
      reminderWindows: mission?.reminderWindows ?? [],
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

    const [settings] = await Promise.all([
      prisma.reminderSettings.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          quietHoursEnabled: data.quietHoursEnabled,
          quietHoursStart: data.quietHoursStart,
          quietHoursEnd: data.quietHoursEnd,
          streakRemindersEnabled: data.streakRemindersEnabled,
          dailyNudgesEnabled: data.dailyNudgesEnabled,
        },
        update: {
          quietHoursEnabled: data.quietHoursEnabled,
          quietHoursStart: data.quietHoursStart,
          quietHoursEnd: data.quietHoursEnd,
          streakRemindersEnabled: data.streakRemindersEnabled,
          dailyNudgesEnabled: data.dailyNudgesEnabled,
        },
      }),
      prisma.mission.upsert({
        where: { userId: session.user.id },
        update: {
          reminderWindows: data.reminderWindows,
        },
        create: {
          userId: session.user.id,
          goal: 'conversation',
          level: 'beginner',
          dailyGoalMinutes: 20,
          reminderWindows: data.reminderWindows,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      settings: {
        quietHoursEnabled: settings.quietHoursEnabled,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
        streakRemindersEnabled: settings.streakRemindersEnabled,
        dailyNudgesEnabled: settings.dailyNudgesEnabled,
        reminderWindows: data.reminderWindows,
      },
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
