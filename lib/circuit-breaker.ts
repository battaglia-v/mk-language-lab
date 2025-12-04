/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by tracking error rates and "opening" the circuit
 * when failures exceed a threshold. When open, requests fail fast without
 * hitting the database.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail immediately
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // % of failures to trigger opening (0-100)
  resetTimeout: number; // ms to wait before attempting recovery
  windowSize: number; // number of recent requests to track
  halfOpenMaxAttempts: number; // max attempts in half-open state before re-opening
}

interface RequestRecord {
  timestamp: number;
  success: boolean;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private requestHistory: RequestRecord[] = [];
  private openedAt: number | null = null;
  private halfOpenAttempts = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 50, // Open circuit at 50% failure rate
      resetTimeout: 60000, // Try recovery after 1 minute
      windowSize: 100, // Track last 100 requests
      halfOpenMaxAttempts: 3, // Allow 3 test requests in half-open
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should transition states
    this.checkStateTransition();

    // If circuit is open, fail fast
    if (this.state === 'OPEN') {
      throw new Error(`Circuit breaker '${this.name}' is OPEN - failing fast`);
    }

    // If half-open, limit concurrent attempts
    if (this.state === 'HALF_OPEN' && this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
      throw new Error(`Circuit breaker '${this.name}' is HALF_OPEN but max attempts exceeded`);
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenAttempts++;
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      success: true,
    });

    this.trimHistory();

    // If in half-open and got success, close the circuit
    if (this.state === 'HALF_OPEN') {
      console.log(`[CircuitBreaker:${this.name}] Half-open test succeeded, closing circuit`);
      this.state = 'CLOSED';
      this.openedAt = null;
      this.halfOpenAttempts = 0;
    }
  }

  private recordFailure(): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      success: false,
    });

    this.trimHistory();

    // Calculate failure rate
    const failureRate = this.getFailureRate();

    // If failure rate exceeds threshold, open the circuit
    if (failureRate >= this.config.failureThreshold && this.state === 'CLOSED') {
      console.warn(`[CircuitBreaker:${this.name}] Opening circuit - failure rate: ${failureRate.toFixed(1)}%`);
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }

    // If in half-open and got failure, re-open the circuit
    if (this.state === 'HALF_OPEN') {
      console.warn(`[CircuitBreaker:${this.name}] Half-open test failed, re-opening circuit`);
      this.state = 'OPEN';
      this.openedAt = Date.now();
      this.halfOpenAttempts = 0;
    }
  }

  private trimHistory(): void {
    // Keep only the most recent requests within window size
    if (this.requestHistory.length > this.config.windowSize) {
      this.requestHistory = this.requestHistory.slice(-this.config.windowSize);
    }
  }

  private getFailureRate(): number {
    if (this.requestHistory.length === 0) return 0;

    const failures = this.requestHistory.filter((r) => !r.success).length;
    return (failures / this.requestHistory.length) * 100;
  }

  private checkStateTransition(): void {
    // If circuit is open and reset timeout has passed, try half-open
    if (this.state === 'OPEN' && this.openedAt) {
      const timeSinceOpen = Date.now() - this.openedAt;
      if (timeSinceOpen >= this.config.resetTimeout) {
        console.log(`[CircuitBreaker:${this.name}] Reset timeout elapsed, entering half-open state`);
        this.state = 'HALF_OPEN';
        this.halfOpenAttempts = 0;
      }
    }
  }

  getState(): CircuitState {
    this.checkStateTransition();
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureRate: this.getFailureRate(),
      requestCount: this.requestHistory.length,
      openedAt: this.openedAt,
      halfOpenAttempts: this.halfOpenAttempts,
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.requestHistory = [];
    this.openedAt = null;
    this.halfOpenAttempts = 0;
    console.log(`[CircuitBreaker:${this.name}] Manually reset to CLOSED`);
  }
}

// Global circuit breakers for different services
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config as CircuitBreakerConfig));
  }
  return circuitBreakers.get(name)!;
}

export function getAllCircuitBreakers(): Map<string, CircuitBreaker> {
  return circuitBreakers;
}
