import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendExpoPushNotifications, type ExpoPushTicketRecord } from '@/lib/expo-push';
import {
  REMINDER_WINDOW_IDS,
  REMINDER_WINDOW_MESSAGES,
  getDueReminderWindow,
  type ReminderWindowId,
} from '@/lib/mobile-reminders';

const REMINDER_DEEPLINK = 'mkll://practice/quick';
const DEFAULT_PAST_TOLERANCE_MINUTES = Number(process.env.REMINDER_PAST_TOLERANCE_MINUTES ?? '5');
const DEFAULT_FUTURE_TOLERANCE_MINUTES = Number(process.env.REMINDER_FUTURE_TOLERANCE_MINUTES ?? '1');
const DEFAULT_MIN_INTERVAL_MINUTES = Number(process.env.REMINDER_MIN_INTERVAL_MINUTES ?? '45');
const REVOKABLE_ERRORS = new Set(['DeviceNotRegistered', 'InvalidCredentials']);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = randomUUID();
  const startTime = Date.now();
  const now = new Date();
  const tokens = await prisma.mobilePushToken.findMany({
    where: {
      revokedAt: null,
      reminderWindows: {
        hasSome: REMINDER_WINDOW_IDS,
      },
    },
    select: {
      id: true,
      expoPushToken: true,
      reminderWindows: true,
      timezone: true,
      locale: true,
      lastReminderSentAt: true,
      lastReminderWindowId: true,
    },
  });

  const due = tokens
    .map((token) => {
      const dueWindow = getDueReminderWindow({
        reminderWindows: token.reminderWindows as ReminderWindowId[],
        timeZone: token.timezone,
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

      return {
        tokenId: token.id,
        expoPushToken: token.expoPushToken,
        reminderWindows: token.reminderWindows as ReminderWindowId[],
        locale: token.locale ?? 'en',
        windowId: dueWindow.windowId,
      };
    })
    .filter(Boolean) as Array<{
      tokenId: string;
      expoPushToken: string;
      reminderWindows: ReminderWindowId[];
      locale: string;
      windowId: ReminderWindowId;
    }>;

  const tokenMetaByExpoPushToken = new Map(
    due.map((token) => [
      token.expoPushToken,
      {
        tokenId: token.tokenId,
        windowId: token.windowId,
        reminderWindows: token.reminderWindows,
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

  const messages = due.map((item) => {
    const copy = REMINDER_WINDOW_MESSAGES[item.windowId];
    return {
      to: item.expoPushToken,
      sound: 'default' as const,
      title: copy.title,
      body: copy.body,
      data: {
        reason: 'mission-reminder',
        windowId: item.windowId,
        deeplink: REMINDER_DEEPLINK,
      },
      ttl: 3600,
    };
  });

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
