/**
 * Structured Logger Tests
 *
 * Tests for the logging utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createScopedLogger, startTimer } from '@/lib/logger';

describe('Logger', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger', () => {
    it('should have all log level methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should log info messages', () => {
      logger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include data in log output', () => {
      logger.info('Message with data', { userId: '123', action: 'test' });
      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('123');
    });
  });

  describe('createScopedLogger', () => {
    it('should create a logger with context', () => {
      const log = createScopedLogger('api.users');
      log.info('Scoped message');
      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('api.users');
    });

    it('should have all log level methods', () => {
      const log = createScopedLogger('test');
      expect(typeof log.debug).toBe('function');
      expect(typeof log.info).toBe('function');
      expect(typeof log.warn).toBe('function');
      expect(typeof log.error).toBe('function');
    });
  });

  describe('child logger', () => {
    it('should create a child logger with combined context', () => {
      const parentLog = logger.child({ context: 'api' });
      const childLog = parentLog.child({ context: 'users' });
      childLog.info('Child message');
      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('api.users');
    });
  });

  describe('startTimer', () => {
    it('should return a timer with end method', () => {
      const timer = startTimer('test.operation');
      expect(typeof timer.end).toBe('function');
    });

    it('should log duration when ended', async () => {
      const timer = startTimer('test.operation');
      // Small delay to ensure measurable duration
      await new Promise((resolve) => setTimeout(resolve, 10));
      timer.end({ itemCount: 5 });
      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('durationMs');
    });

    it('should include custom data in timer end', () => {
      const timer = startTimer('test.operation');
      timer.end({ records: 100 });
      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('100');
    });
  });

  describe('error handling', () => {
    it('should format Error objects correctly', () => {
      const error = new Error('Test error');
      logger.error('Something failed', { error });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Test error');
    });

    it('should handle string errors', () => {
      logger.error('Something failed', { error: 'String error message' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
