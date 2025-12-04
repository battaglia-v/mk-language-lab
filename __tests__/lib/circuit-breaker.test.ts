import { describe, expect, it, beforeEach, vi } from 'vitest';
import { CircuitBreaker } from '@/lib/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-breaker', {
      failureThreshold: 50, // 50% failure rate opens circuit
      resetTimeout: 1000, // 1 second
      windowSize: 10, // Track last 10 requests
      halfOpenMaxAttempts: 2,
    });
  });

  describe('CLOSED state', () => {
    it('executes operations successfully when circuit is closed', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await breaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledOnce();
    });

    it('tracks successful requests', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      await breaker.execute(operation);
      await breaker.execute(operation);

      const stats = breaker.getStats();
      expect(stats.successCount).toBe(2);
      expect(stats.failureCount).toBe(0);
    });

    it('tracks failed requests', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('test error'));

      await expect(breaker.execute(operation)).rejects.toThrow('test error');

      const stats = breaker.getStats();
      expect(stats.failureCount).toBe(1);
      expect(stats.successCount).toBe(0);
    });
  });

  describe('OPEN state', () => {
    it('opens circuit when failure threshold is exceeded', async () => {
      const failOperation = vi.fn().mockRejectedValue(new Error('fail'));

      // Exceed 50% failure rate with 6 failures out of 10 requests
      for (let i = 0; i < 6; i++) {
        await expect(breaker.execute(failOperation)).rejects.toThrow();
      }

      const stats = breaker.getStats();
      expect(stats.state).toBe('OPEN');
    });

    it('fails fast when circuit is open', async () => {
      const failOperation = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 6; i++) {
        await expect(breaker.execute(failOperation)).rejects.toThrow();
      }

      // Next call should fail fast without executing operation
      const newOperation = vi.fn().mockResolvedValue('success');
      await expect(breaker.execute(newOperation)).rejects.toThrow('Circuit breaker \'test-breaker\' is OPEN');

      expect(newOperation).not.toHaveBeenCalled();
    });

    it('transitions to HALF_OPEN after reset timeout', async () => {
      const failOperation = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 6; i++) {
        await expect(breaker.execute(failOperation)).rejects.toThrow();
      }

      expect(breaker.getStats().state).toBe('OPEN');

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Check state before executing - should be HALF_OPEN now
      expect(breaker.getState()).toBe('HALF_OPEN');
    });
  });

  describe('HALF_OPEN state', () => {
    async function openCircuit() {
      const failOp = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 6; i++) {
        await expect(breaker.execute(failOp)).rejects.toThrow();
      }
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    it('allows limited attempts in half-open state', async () => {
      await openCircuit();

      // Verify we're in HALF_OPEN state before executing
      expect(breaker.getState()).toBe('HALF_OPEN');

      const successOp = vi.fn().mockResolvedValue('success');
      await breaker.execute(successOp);

      // After one success in HALF_OPEN, circuit closes
      expect(breaker.getStats().state).toBe('CLOSED');
      expect(successOp).toHaveBeenCalledOnce();
    });

    it('closes circuit after successful half-open attempts', async () => {
      await openCircuit();

      const successOp = vi.fn().mockResolvedValue('success');

      // Perform successful half-open attempts
      await breaker.execute(successOp);
      await breaker.execute(successOp);

      expect(breaker.getStats().state).toBe('CLOSED');
    });

    it('reopens circuit if half-open attempt fails', async () => {
      await openCircuit();

      const failOp = vi.fn().mockRejectedValue(new Error('still failing'));

      await expect(breaker.execute(failOp)).rejects.toThrow();

      expect(breaker.getStats().state).toBe('OPEN');
    });
  });

  describe('getStats', () => {
    it('returns current circuit breaker statistics', async () => {
      const successOp = vi.fn().mockResolvedValue('success');
      const failOp = vi.fn().mockRejectedValue(new Error('fail'));

      await breaker.execute(successOp);
      await breaker.execute(successOp);
      await expect(breaker.execute(failOp)).rejects.toThrow();

      const stats = breaker.getStats();

      expect(stats.name).toBe('test-breaker');
      expect(stats.state).toBe('CLOSED');
      expect(stats.successCount).toBe(2);
      expect(stats.failureCount).toBe(1);
      expect(stats.failureRate).toBe(33); // 1 out of 3 = 33%
    });

    it('calculates failure rate correctly', async () => {
      const failOp = vi.fn().mockRejectedValue(new Error('fail'));

      // 3 failures out of 3 requests = 100%
      await expect(breaker.execute(failOp)).rejects.toThrow();
      await expect(breaker.execute(failOp)).rejects.toThrow();
      await expect(breaker.execute(failOp)).rejects.toThrow();

      const stats = breaker.getStats();
      expect(stats.failureRate).toBe(100);
    });
  });

  describe('reset', () => {
    it('manually resets circuit to closed state', async () => {
      const failOp = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 6; i++) {
        await expect(breaker.execute(failOp)).rejects.toThrow();
      }

      expect(breaker.getStats().state).toBe('OPEN');

      breaker.reset();

      const stats = breaker.getStats();
      expect(stats.state).toBe('CLOSED');
      expect(stats.successCount).toBe(0);
      expect(stats.failureCount).toBe(0);
    });
  });

  describe('window size', () => {
    it('maintains only the configured window size of requests', async () => {
      const successOp = vi.fn().mockResolvedValue('success');

      // Execute 15 successful operations (window size is 10)
      for (let i = 0; i < 15; i++) {
        await breaker.execute(successOp);
      }

      const stats = breaker.getStats();
      // Should only count the last 10 requests
      expect(stats.successCount).toBeLessThanOrEqual(10);
    });
  });
});
