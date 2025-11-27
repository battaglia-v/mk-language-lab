// @ts-nocheck
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { GameProgress, MobilePushToken, Prisma, ReminderSettings } from '@prisma/client';
import { sendExpoPushNotifications, type ExpoPushTicketRecord } from '@/lib/expo-push';
import { REMINDER_WINDOW_IDS, getDueReminderWindow, type ReminderWindowId } from '@/lib/mobile-reminders';
import {
  shouldSendStreakReminder,
  generateStreakReminderNotification,
  generateDailyNudgeNotification,
  isQuietHours,
  type ReminderContext,
} from '@/lib/reminders/reminder-logic';

const REMINDER_DEEPLINK = 'mkll://practice/quick';
const XP_PER_REVIEW = 12;
const DAILY_TARGET_XP = 60;
const WINDOW_INTENT: Record<ReminderWindowId, 'daily' | 'streak'> = {
  midday: 'daily',
  evening: 'streak',
};
const DEFAULT_PAST_TOLERANCE_MINUTES = Number(process.env.REMINDER_PAST_TOLERANCE_MINUTES ?? '5');
const DEFAULT_FUTURE_TOLERANCE_MINUTES = Number(process.env.REMINDER_FUTURE_TOLERANCE_MINUTES ?? '1');
const DEFAULT_MIN_INTERVAL_MINUTES = Number(process.env.REMINDER_MIN_INTERVAL_MINUTES ?? '45');
const REVOKABLE_ERRORS = new Set(['DeviceNotRegistered', 'InvalidCredentials']);
const NOTIFICATION_TYPE_MAP: Record<string, string> = {
  streak_at_risk: 'streak_warning',
  daily_nudge: 'daily_nudge',
  quest_expiring: 'quest_invite',
  achievement_earned: 'achievement',
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = randomUUID();
  const startTime = Date.now();
  const now = new Date();
  const tokens: Array<
    Pick<
      MobilePushToken,
      'id' | 'userId' | 'expoPushToken' | 'reminderWindows' | 'timezone' | 'locale' | 'lastReminderSentAt' | 'lastReminderWindowId'
    >
  > = await prisma.mobilePushToken.findMany({
    where: {
      revokedAt: null,
      reminderWindows: {
        hasSome: REMINDER_WINDOW_IDS,
      },
    },
    select: {
      id: true,
      userId: true,
      expoPushToken: true,
      reminderWindows: true,
      timezone: true,
      locale: true,
      lastReminderSentAt: true,
      lastReminderWindowId: true,
    },
  });

  const userIds = Array.from(new Set(tokens.map((token) => token.userId).filter((id): id is string => id !== null)));

  const [settingsRecords, progressRecords, dailyPracticeCounts] = await Promise.all<[
    ReminderSettings[],
    Pick<GameProgress, 'userId' | 'streak' | 'lastPracticeDate'>[],
    Array<Prisma.ExerciseAttemptGroupByOutputType>,
  ]>([
    prisma.reminderSettings.findMany({ where: { userId: { in: userIds } } }),
    prisma.gameProgress.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, streak: true, lastPracticeDate: true },
    }),
    prisma.exerciseAttempt.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        attemptedAt: { gte: startOfDay(now) },
      },
      _count: { _all: true },
    }),
  ]);

  const settingsMap = new Map<string, ReminderSettings>(settingsRecords.map((record) => [record.userId, record]));
  const progressMap = new Map<string, Pick<GameProgress, 'userId' | 'streak' | 'lastPracticeDate'>>(
    progressRecords.map((record) => [record.userId, record])
  );
  const dailyCountMap = new Map<string, number>(dailyPracticeCounts.map((record) => [record.userId, record._count?._all ?? 0]));

  const due = tokens
    .map((token) => {
      const dueWindow = getDueReminderWindow({
        reminderWindows: (token.reminderWindows as (string | null)[]).filter((w): w is string => w !== null) as ReminderWindowId[],
        timeZone: token.timezone ?? 'UTC',
        now,
        lastReminderSentAt: token.lastReminderSentAt ?? undefined,
        lastReminderWindowId: token.lastReminderWindowId as ReminderWindowId | null,
        pastToleranceMinutes: DEFAULT_PAST_TOLERANCE_MINUTES,
        futureToleranceMinutes: DEFAULT_FUTURE_TOLERANCE_MINUTES,
        minIntervalMinutes: DEFAULT_MIN_INTERVAL_MINUTES,
      });

      if (!dueWindow) {
        return null;
      }

      const windowIntent = WINDOW_INTENT[dueWindow.windowId];
      if (!windowIntent) {
        return null;
      }

      if (!token.userId) {
        return null;
      }

      const settings = settingsMap.get(token.userId);
      const timezone = settings?.timezone ?? token.timezone ?? 'UTC';

      if (
        settings?.quietHoursEnabled &&
        isQuietHours(
          {
            enabled: settings.quietHoursEnabled,
            startHour: settings.quietHoursStart,
            endHour: settings.quietHoursEnd,
          },
          timezone
        )
      ) {
        return null;
      }

      if (windowIntent === 'streak' && settings?.streakRemindersEnabled === false) {
        return null;
      }

      if (windowIntent === 'daily' && settings?.dailyNudgesEnabled === false) {
        return null;
      }

      const progress = progressMap.get(token.userId);
      const dailyAttempts = dailyCountMap.get(token.userId) ?? 0;
      const context: ReminderContext = {
        userId: token.userId,
        streakDays: progress?.streak ?? 0,
        lastPracticeDate: progress?.lastPracticeDate ?? null,
        dailyXP: dailyAttempts * XP_PER_REVIEW,
        dailyXPTarget: DAILY_TARGET_XP,
        timezone,
      };

      let notificationCopy:
        | ReturnType<typeof generateStreakReminderNotification>
        | ReturnType<typeof generateDailyNudgeNotification>
        | null = null;

      if (windowIntent === 'streak') {
        if (!shouldSendStreakReminder(context)) {
          return null;
        }
        notificationCopy = generateStreakReminderNotification(context);
      } else {
        if (context.dailyXP >= context.dailyXPTarget) {
          return null;
        }
        notificationCopy = generateDailyNudgeNotification(context);
      }

      return {
        tokenId: token.id,
        userId: token.userId,
        expoPushToken: token.expoPushToken,
        reminderWindows: (token.reminderWindows as (string | null)[]).filter((w): w is string => w !== null) as ReminderWindowId[],
        locale: token.locale ?? 'en',
        windowId: dueWindow.windowId,
        scheduledAt: dueWindow.scheduledAt,
        copy: notificationCopy,
      };
    })
    .filter(Boolean) as Array<{
      tokenId: string;
      userId: string;
      expoPushToken: string;
      reminderWindows: ReminderWindowId[];
      locale: string;
      windowId: ReminderWindowId;
      scheduledAt: Date;
      copy: ReturnType<typeof generateStreakReminderNotification> | ReturnType<typeof generateDailyNudgeNotification>;
    }>;

  const tokenMetaByExpoPushToken = new Map(
    due.map((token) => [
      token.expoPushToken,
      {
        tokenId: token.tokenId,
        windowId: token.windowId,
        reminderWindows: token.reminderWindows,
        userId: token.userId,
        scheduledAt: token.scheduledAt,
        copy: token.copy,
      },
    ])
  );

  if (due.length === 0) {
    const durationMs = Date.now() - startTime;
    const summary = {
      ok: true,
      sent: 0,
      evaluated: tokens.length,
      windows: {},
      revoked: 0,
      errors: 0,
      durationMs,
      runId,
    };

    console.info('[cron.reminders] No reminders due', summary);
    if (tokens.length > 0) {
      console.warn('[cron.reminders] No reminders delivered despite active tokens', summary);
    }

    return NextResponse.json(summary);
  }

  const messages = due.map((item) => ({
    to: item.expoPushToken,
    sound: 'default' as const,
    title: item.copy.title,
    body: item.copy.body,
    data: {
      reason: item.copy.type,
      windowId: item.windowId,
      deeplink: item.copy.actionUrl ?? REMINDER_DEEPLINK,
    },
    ttl: 3600,
  }));

  const sendResults = await sendExpoPushNotifications(messages);
  const successfulTokenIds = new Set<string>();
  const erroredTickets: ExpoPushTicketRecord[] = [];
  const revokedTokenIds = new Set<string>();

  for (const result of sendResults) {
    const meta = tokenMetaByExpoPushToken.get(result.message.to);
    if (!meta) {
      continue;
    }

    if (result.ticket.status === 'ok') {
      successfulTokenIds.add(meta.tokenId);
      continue;
    }

    erroredTickets.push(result);
    const errorCode =
      typeof result.ticket.details?.error === 'string'
        ? result.ticket.details.error
        : undefined;

    if (errorCode && REVOKABLE_ERRORS.has(errorCode)) {
      revokedTokenIds.add(meta.tokenId);
    }
  }

  const successfulDue = due.filter((item) => successfulTokenIds.has(item.tokenId));

  await Promise.all(
    successfulDue.map((item) =>
      prisma.mobilePushToken.update({
        where: { id: item.tokenId },
        data: {
          lastReminderSentAt: now,
          lastReminderWindowId: item.windowId,
        },
      })
    )
  );

  if (successfulDue.length > 0) {
    await prisma.notification.createMany({
      data: successfulDue.map((item) => ({
        userId: item.userId,
        type: normalizeNotificationType(item.copy.type),
        title: item.copy.title,
        body: item.copy.body,
        actionUrl: item.copy.actionUrl ?? REMINDER_DEEPLINK,
        scheduledFor: item.scheduledAt,
        sentAt: now,
      })),
    });
  }

  if (revokedTokenIds.size > 0) {
    await prisma.mobilePushToken.updateMany({
      where: { id: { in: Array.from(revokedTokenIds) } },
      data: {
        revokedAt: now,
        reminderWindows: [],
      },
    });
  }

  const windowStats = due.reduce<Record<ReminderWindowId, number>>((acc, item) => {
    acc[item.windowId] = (acc[item.windowId] ?? 0) + 1;
    return acc;
  }, {} as Record<ReminderWindowId, number>);

  if (erroredTickets.length > 0) {
    console.warn('[cron.reminders] Expo ticket errors', {
      runId,
      errors: erroredTickets.map((ticket) => ({
        to: ticket.message.to,
        details: ticket.ticket.details,
        message: ticket.ticket.message,
      })),
    });
  }

  const durationMs = Date.now() - startTime;
  const summary = {
    ok: true,
    sent: successfulDue.length,
    evaluated: tokens.length,
    windows: windowStats,
    revoked: revokedTokenIds.size,
    errors: erroredTickets.length,
    durationMs,
    runId,
  };

  console.info('[cron.reminders] Completed run', summary);

  // Surface soft warning when no reminders were successfully delivered even though some were due.
  if (successfulDue.length === 0) {
    console.warn('[cron.reminders] No reminders delivered after push attempt', summary);
  }

  return NextResponse.json(summary);
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function normalizeNotificationType(type: string): string {
  return NOTIFICATION_TYPE_MAP[type] ?? type;
}
