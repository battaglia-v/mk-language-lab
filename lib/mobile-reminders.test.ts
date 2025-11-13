import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  REMINDER_WINDOW_IDS,
  computeNextReminderTimestamp,
  getDueReminderWindow,
  normalizeReminderWindows,
  type ReminderWindowId,
} from './mobile-reminders';

const BASE_TIME = new Date('2025-01-15T12:00:00.000Z');

describe('mobile reminders helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deduplicates and filters reminder windows', () => {
    const windows = normalizeReminderWindows([
      'midday',
      'midday',
      'unknown' as ReminderWindowId,
      'evening',
    ]);

    expect(windows).toEqual(['midday', 'evening']);
  });

  it('returns null when no reminder windows are enabled', () => {
    const timestamp = computeNextReminderTimestamp({
      reminderWindows: [],
      timeZone: 'UTC',
    });

    expect(timestamp).toBeNull();
  });

  it('computes the next reminder in UTC when timezone omitted', () => {
    const timestamp = computeNextReminderTimestamp({
      reminderWindows: ['midday'],
    });

    expect(timestamp).toBe('2025-01-16T11:00:00.000Z');
  });

  it('respects timezone offsets when computing the next reminder', () => {
    const timestamp = computeNextReminderTimestamp({
      reminderWindows: ['midday'],
      timeZone: 'America/Los_Angeles',
    });

    expect(timestamp).toBe('2025-01-15T19:00:00.000Z');
  });

  it('rolls over to the next day when the window already passed', () => {
    const timestamp = computeNextReminderTimestamp({
      reminderWindows: ['midday'],
      timeZone: 'UTC',
    });

    expect(timestamp).toBe('2025-01-16T11:00:00.000Z');

    vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));
    const nextTimestamp = computeNextReminderTimestamp({
      reminderWindows: ['midday'],
      timeZone: 'UTC',
    });
    expect(nextTimestamp).toBe('2025-01-16T11:00:00.000Z');
  });

  it('uses the nearest upcoming reminder when multiple windows exist', () => {
    const timestamp = computeNextReminderTimestamp({
      reminderWindows: REMINDER_WINDOW_IDS,
      timeZone: 'UTC',
    });

    expect(timestamp).toBe('2025-01-15T20:00:00.000Z');
  });
});

describe('getDueReminderWindow', () => {
  const baseOptions = {
    reminderWindows: ['midday'] as ReminderWindowId[],
    timeZone: 'UTC',
  };

  it('returns a window when within tolerance after scheduled time', () => {
    const result = getDueReminderWindow({
      ...baseOptions,
      now: new Date('2025-01-16T11:03:00.000Z'),
      pastToleranceMinutes: 5,
      futureToleranceMinutes: 1,
    });

    expect(result).toEqual({
      windowId: 'midday',
      scheduledAt: new Date('2025-01-16T11:00:00.000Z'),
    });
  });

  it('does not trigger before the reminder window', () => {
    const result = getDueReminderWindow({
      ...baseOptions,
      now: new Date('2025-01-16T10:57:00.000Z'),
      pastToleranceMinutes: 5,
      futureToleranceMinutes: 1,
    });

    expect(result).toBeNull();
  });

  it('respects the minimum interval when the same window fired recently', () => {
    const result = getDueReminderWindow({
      ...baseOptions,
      now: new Date('2025-01-16T11:03:00.000Z'),
      lastReminderWindowId: 'midday',
      lastReminderSentAt: new Date('2025-01-16T11:01:00.000Z'),
      minIntervalMinutes: 30,
      pastToleranceMinutes: 5,
      futureToleranceMinutes: 1,
    });

    expect(result).toBeNull();
  });

  it('allows different windows even if another fired recently', () => {
    const result = getDueReminderWindow({
      reminderWindows: ['midday', 'evening'],
      timeZone: 'UTC',
      now: new Date('2025-01-16T20:02:00.000Z'),
      lastReminderWindowId: 'midday',
      lastReminderSentAt: new Date('2025-01-16T11:01:00.000Z'),
      minIntervalMinutes: 30,
      pastToleranceMinutes: 5,
      futureToleranceMinutes: 1,
    });

    expect(result?.windowId).toBe('evening');
  });
});
