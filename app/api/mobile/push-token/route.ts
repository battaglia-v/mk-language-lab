import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  REMINDER_WINDOW_IDS,
  type ReminderWindowId,
  computeNextReminderTimestamp,
  normalizeReminderWindows,
} from '@/lib/mobile-reminders';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';

const reminderWindowEnum = z.enum(REMINDER_WINDOW_IDS as [ReminderWindowId, ...ReminderWindowId[]]);

const requestSchema = z.object({
  expoPushToken: z.string().min(10).max(255),
  platform: z.enum(['ios', 'android']),
  reminderWindows: z.array(reminderWindowEnum).optional(),
  appVersion: z.string().trim().min(1).max(32).optional(),
  locale: z.string().trim().min(2).max(16).optional(),
  timezone: z.string().trim().min(2).max(50).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth().catch(() => null);
  let userId = session?.user?.id ?? null;

  if (!userId) {
    const mobileSession = await getMobileSessionFromRequest(request);
    userId = mobileSession?.user.id ?? null;
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const reminderWindows = normalizeReminderWindows(payload.reminderWindows ?? []);

  try {
    if (reminderWindows.length === 0) {
      await prisma.mobilePushToken.deleteMany({ where: { expoPushToken: payload.expoPushToken } });
      return NextResponse.json(
        {
          success: true,
          reminderWindows: [],
          nextReminderAt: null,
          removed: true,
        },
        { status: 200 }
      );
    }

    const timestamp = new Date();
    const record = await prisma.mobilePushToken.upsert({
      where: { expoPushToken: payload.expoPushToken },
      update: {
        userId,
        platform: payload.platform,
        appVersion: payload.appVersion ?? null,
        locale: payload.locale ?? null,
        timezone: payload.timezone ?? null,
        reminderWindows,
        lastSuccessfulSync: timestamp,
        revokedAt: null,
      },
      create: {
        userId,
        expoPushToken: payload.expoPushToken,
        platform: payload.platform,
        appVersion: payload.appVersion ?? null,
        locale: payload.locale ?? null,
        timezone: payload.timezone ?? null,
        reminderWindows,
        lastSuccessfulSync: timestamp,
      },
    });

    const nextReminderAt = computeNextReminderTimestamp({
      reminderWindows: record.reminderWindows as ReminderWindowId[],
      timeZone: record.timezone,
    });

    return NextResponse.json(
      {
        success: true,
        reminderWindows: record.reminderWindows,
        nextReminderAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[api.mobile.push-token] Failed to register token', error);
    return NextResponse.json({ error: 'Unable to register push token' }, { status: 500 });
  }
}
