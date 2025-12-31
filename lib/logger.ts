/**
 * Structured Logger
 *
 * A lightweight logger that:
 * - Uses structured JSON output in production
 * - Falls back to readable console output in development
 * - Integrates with Sentry for error tracking
 * - Preserves the existing [context] prefix pattern
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   const log = logger.child({ context: 'api.users' });
 *   log.info('User created', { userId: '123' });
 *   log.error('Failed to create user', { error });
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  context?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Determine current log level from environment
const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  // Default to 'info' in production, 'debug' in development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const isProduction = process.env.NODE_ENV === 'production';
const currentLogLevel = getCurrentLogLevel();

/**
 * Format error object for logging
 */
function formatError(error: unknown): LogEntry['error'] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

/**
 * Check if logging is enabled for a given level
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production log aggregation
    return JSON.stringify(entry);
  }

  // Readable format for development
  const prefix = entry.context ? `[${entry.context}]` : '';
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const level = entry.level.toUpperCase().padEnd(5);

  let output = `${timestamp} ${level} ${prefix} ${entry.message}`;

  if (entry.data && Object.keys(entry.data).length > 0) {
    output += '\n  ' + JSON.stringify(entry.data, null, 2).replace(/\n/g, '\n  ');
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.message}`;
    if (entry.error.stack) {
      output += `\n  ${entry.error.stack}`;
    }
  }

  return output;
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
  context?: string
): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  // Extract error from data if present
  if (data?.error) {
    entry.error = formatError(data.error);
    // Remove error from data to avoid duplication
    const { error: _err, ...restData } = data;
    if (Object.keys(restData).length > 0) {
      entry.data = restData;
    }
  } else if (data && Object.keys(data).length > 0) {
    entry.data = data;
  }

  const formatted = formatLogEntry(entry);

  // Output to console
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }

  // Send errors and warnings to Sentry in production
  if (isProduction && (level === 'error' || level === 'warn')) {
    if (entry.error) {
      const sentryError = new Error(entry.error.message);
      sentryError.name = entry.error.name;
      if (entry.error.stack) {
        sentryError.stack = entry.error.stack;
      }
      Sentry.captureException(sentryError, {
        level: level === 'error' ? 'error' : 'warning',
        tags: { context: context || 'unknown' },
        extra: entry.data,
      });
    } else {
      Sentry.captureMessage(message, {
        level: level === 'error' ? 'error' : 'warning',
        tags: { context: context || 'unknown' },
        extra: entry.data,
      });
    }
  }
}

/**
 * Logger interface with child context support
 */
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  child(context: LogContext): Logger;
}

/**
 * Create a logger instance with optional context
 */
function createLogger(parentContext?: string): Logger {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      log('debug', message, data, parentContext);
    },
    info(message: string, data?: Record<string, unknown>) {
      log('info', message, data, parentContext);
    },
    warn(message: string, data?: Record<string, unknown>) {
      log('warn', message, data, parentContext);
    },
    error(message: string, data?: Record<string, unknown>) {
      log('error', message, data, parentContext);
    },
    child(context: LogContext): Logger {
      const childContext = context.context
        ? parentContext
          ? `${parentContext}.${context.context}`
          : context.context
        : parentContext;
      return createLogger(childContext);
    },
  };
}

/**
 * Root logger instance
 *
 * Usage:
 *   // Simple logging
 *   logger.info('Server started');
 *
 *   // With context
 *   const log = logger.child({ context: 'api.auth' });
 *   log.info('User logged in', { userId: '123' });
 *
 *   // With error
 *   log.error('Authentication failed', { error: err, userId: '123' });
 */
export const logger = createLogger();

/**
 * Helper to create a scoped logger for a specific module/route
 *
 * Usage:
 *   const log = createScopedLogger('api.users');
 *   log.info('Fetching users');
 */
export function createScopedLogger(context: string): Logger {
  return logger.child({ context });
}

/**
 * Performance timing utility
 *
 * Usage:
 *   const timer = startTimer('api.users.list');
 *   // ... do work ...
 *   timer.end({ count: users.length });
 */
export function startTimer(context: string) {
  const start = performance.now();
  const log = createScopedLogger(context);

  return {
    end(data?: Record<string, unknown>) {
      const duration = Math.round(performance.now() - start);
      log.info('Operation completed', { ...data, durationMs: duration });
    },
  };
}
