/**
 * Custom error classes for better error handling and categorization
 */

export class NetworkError extends Error {
  name = 'NetworkError';
  constructor(message: string) {
    super(message);
  }
}

export class TimeoutError extends Error {
  name = 'TimeoutError';
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends Error {
  name = 'ValidationError';
  constructor(message: string) {
    super(message);
  }
}

export class RateLimitError extends Error {
  name = 'RateLimitError';
  constructor(message: string) {
    super(message);
  }
}

export class ExternalServiceError extends Error {
  name = 'ExternalServiceError';
  constructor(message: string, public statusCode?: number) {
    super(message);
  }
}

/**
 * Fetch wrapper with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
    }
    throw new NetworkError((error as Error).message);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 10000,
  shouldRetry: (error: Error) => {
    // Retry on network errors and timeouts, but not on validation errors
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error instanceof RateLimitError
    );
  },
};

/**
 * Fetch with exponential backoff retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        options,
        finalConfig.timeoutMs
      );

      // Check for rate limiting
      if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded');
      }

      // Only retry on 5xx server errors
      if (response.status >= 500 && attempt < finalConfig.maxRetries - 1) {
        throw new ExternalServiceError(
          `Server error: ${response.status}`,
          response.status
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if this is the last attempt
      if (attempt === finalConfig.maxRetries - 1) {
        break;
      }

      // Check if we should retry this error
      if (!finalConfig.shouldRetry(lastError, attempt)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.initialDelayMs * Math.pow(2, attempt),
        finalConfig.maxDelayMs
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Structured error response for API routes
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  retryable?: boolean;
  details?: unknown;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: Error | unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): { response: ErrorResponse; status: number } {
  // Validation errors
  if (error instanceof ValidationError) {
    return {
      response: {
        error: 'VALIDATION_ERROR',
        message: error.message,
        retryable: false,
      },
      status: 400,
    };
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    return {
      response: {
        error: 'RATE_LIMIT_ERROR',
        message: 'Too many requests. Please try again later.',
        retryable: true,
      },
      status: 429,
    };
  }

  // Timeout errors
  if (error instanceof TimeoutError) {
    return {
      response: {
        error: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
        retryable: true,
      },
      status: 504,
    };
  }

  // Network errors
  if (error instanceof NetworkError) {
    return {
      response: {
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        retryable: true,
      },
      status: 503,
    };
  }

  // External service errors
  if (error instanceof ExternalServiceError) {
    return {
      response: {
        error: 'EXTERNAL_SERVICE_ERROR',
        message: 'External service error. Please try again later.',
        retryable: true,
        details: error.statusCode,
      },
      status: 502,
    };
  }

  // Generic errors
  const message = error instanceof Error ? error.message : fallbackMessage;
  return {
    response: {
      error: 'INTERNAL_ERROR',
      message,
      retryable: false,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    },
    status: 500,
  };
}
