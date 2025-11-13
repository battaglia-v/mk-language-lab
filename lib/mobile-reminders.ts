const REMINDER_WINDOW_DEFINITIONS = [
  {
    id: 'midday',
    label: 'Midday focus',
    description: 'Friendly nudge around lunch to keep the streak alive.',
    hour: 11,
    minute: 0,
  },
  {
    id: 'evening',
    label: 'Evening rescue',
    description: 'Protect the streak before winding down.',
    hour: 20,
    minute: 0,
  },
] as const;

export type ReminderWindowDefinition = (typeof REMINDER_WINDOW_DEFINITIONS)[number];
export type ReminderWindowId = ReminderWindowDefinition['id'];

export const REMINDER_WINDOW_IDS: ReminderWindowId[] = REMINDER_WINDOW_DEFINITIONS.map(
  (window) => window.id
);

export const REMINDER_WINDOW_MESSAGES: Record<
  ReminderWindowId,
  { title: string; body: string }
> = {
  midday: {
    title: 'Midday mission boost',
    body: 'Quick reminder to bank XP during your lunch break.',
  },
  evening: {
    title: 'Evening streak rescue',
    body: 'Finish today’s mission before the streak resets at midnight.',
  },
};

const WINDOW_LOOKUP = new Map<ReminderWindowId, ReminderWindowDefinition>(
  REMINDER_WINDOW_DEFINITIONS.map((window) => [window.id, window])
);

const DEFAULT_TIME_ZONE = 'UTC';

export function normalizeReminderWindows(ids: ReminderWindowId[]): ReminderWindowId[] {
  const seen = new Set<ReminderWindowId>();
  const normalized: ReminderWindowId[] = [];

  ids.forEach((id) => {
    if (!WINDOW_LOOKUP.has(id) || seen.has(id)) {
      return;
    }
    seen.add(id);
    normalized.push(id);
  });

  return normalized;
}

export function computeNextReminderTimestamp({
  reminderWindows,
  timeZone,
}: {
  reminderWindows: ReminderWindowId[];
  timeZone?: string | null;
}): string | null {
  const normalized = normalizeReminderWindows(reminderWindows);
  if (normalized.length === 0) {
    return null;
  }

  const zone = sanitizeTimeZone(timeZone);
  const now = new Date();
  let nearest: Date | null = null;

  normalized.forEach((id) => {
    const definition = WINDOW_LOOKUP.get(id);
    if (!definition) {
      return;
    }

    let candidate = buildReminderDateForToday(definition, zone, now);
    if (candidate <= now) {
      candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (!nearest || candidate < nearest) {
      nearest = candidate;
    }
  });

  return nearest?.toISOString() ?? null;
}

type DueReminderOptions = {
  reminderWindows: ReminderWindowId[];
  timeZone?: string | null;
  now?: Date;
  lastReminderWindowId?: ReminderWindowId | null;
  lastReminderSentAt?: Date | string | null;
  pastToleranceMinutes?: number;
  futureToleranceMinutes?: number;
  minIntervalMinutes?: number;
};

export type DueReminderResult = {
  windowId: ReminderWindowId;
  scheduledAt: Date;
};

export function getDueReminderWindow(options: DueReminderOptions): DueReminderResult | null {
  const normalized = normalizeReminderWindows(options.reminderWindows);
  if (normalized.length === 0) {
    return null;
  }

  const zone = sanitizeTimeZone(options.timeZone);
  const now = options.now ? new Date(options.now) : new Date();
  const pastToleranceMinutes = options.pastToleranceMinutes ?? 5;
  const futureToleranceMinutes = options.futureToleranceMinutes ?? 1;
  const minIntervalMinutes = options.minIntervalMinutes ?? 45;

  const pastToleranceMs = pastToleranceMinutes * 60 * 1000;
  const futureToleranceMs = futureToleranceMinutes * 60 * 1000;
  const minIntervalMs = minIntervalMinutes * 60 * 1000;

  const lastSentAt = options.lastReminderSentAt
    ? new Date(options.lastReminderSentAt)
    : null;

  for (const id of normalized) {
    const definition = WINDOW_LOOKUP.get(id);
    if (!definition) {
      continue;
    }

    const scheduled = buildReminderDateForToday(definition, zone, now);
    const delta = scheduled.getTime() - now.getTime();

    if (delta > futureToleranceMs || delta < -pastToleranceMs) {
      continue;
    }

    if (
      lastSentAt &&
      options.lastReminderWindowId === id &&
      now.getTime() - lastSentAt.getTime() < minIntervalMs
    ) {
      continue;
    }

    return { windowId: id, scheduledAt: scheduled };
  }

  return null;
}

function buildReminderDateForToday(
  definition: ReminderWindowDefinition,
  timeZone: string,
  reference: Date
): Date {
  const parts = getTimeZoneParts(reference, timeZone);
  return buildZonedDate(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: definition.hour,
      minute: definition.minute,
    },
    timeZone
  );
}

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
};

function buildZonedDate(parts: DateParts, timeZone: string): Date {
  const utcDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second ?? 0)
  );

  const offset = getTimeZoneOffset(timeZone, utcDate);
  return new Date(utcDate.getTime() - offset);
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = getFormatter(timeZone);
  const formatted = formatter.formatToParts(date);
  const result: Record<string, number> = {};

  formatted.forEach((part) => {
    if (part.type === 'literal') {
      return;
    }
    result[part.type] = Number(part.value);
  });

  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
    minute: result.minute,
    second: result.second ?? 0,
  };
}

function getTimeZoneOffset(timeZone: string, date: Date) {
  const formatter = getFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};

  parts.forEach((part) => {
    if (part.type === 'literal') {
      return;
    }
    values[part.type] = Number(part.value);
  });

  const zonedTimestamp = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return zonedTimestamp - date.getTime();
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function sanitizeTimeZone(timeZone?: string | null) {
  if (!timeZone) {
    return DEFAULT_TIME_ZONE;
  }

  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export { REMINDER_WINDOW_DEFINITIONS };
