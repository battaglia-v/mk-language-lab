import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client only if environment variables are configured
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;

// Translation API - Strict limits due to expensive Google Cloud API calls
// 10 requests per 10 seconds per IP
export const translateRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/translate',
}) : null;

// News API - Moderate limits to prevent scraping abuse
// 20 requests per 10 seconds per IP
export const newsRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/news',
}) : null;

// Word of the Day API - Generous limits, lightweight database query
// 30 requests per 10 seconds per IP
export const wordOfDayRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/wotd',
}) : null;

// Support API - Strict limits to prevent spam
// 5 requests per hour per IP
export const supportRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: '@upstash/ratelimit/support',
}) : null;

// Tutor API - Strict limits due to expensive OpenAI API calls
// 15 requests per minute per IP
export const tutorRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/tutor',
}) : null;

// Auth API - Strict limits to prevent brute force and spam registration
// 5 requests per minute per IP for registration and login
export const authRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/auth',
}) : null;

/**
 * Helper function to apply rate limiting to an API route
 * Returns true if request should proceed, false if rate limited
 */
export async function checkRateLimit(
  ratelimiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!ratelimiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  const { success, limit, reset, remaining } = await ratelimiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
