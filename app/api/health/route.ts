import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllCircuitBreakers } from '@/lib/circuit-breaker';

export const dynamic = 'force-dynamic'; // Disable caching for health checks

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  gitSha: string;
  buildTime: string;
  env: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
    circuitBreakers: Record<string, {
      state: string;
      failureRate: number;
      requestCount: number;
    }>;
  };
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck['checks'] = {
    database: { status: 'error' },
    circuitBreakers: {},
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const dbResponseTime = Date.now() - dbStart;

    checks.database = {
      status: 'ok',
      responseTime: dbResponseTime,
    };
  } catch (error) {
    checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }

  // Check circuit breaker states
  const breakers = getAllCircuitBreakers();
  breakers.forEach((breaker, name) => {
    const stats = breaker.getStats();
    checks.circuitBreakers[name] = {
      state: stats.state,
      failureRate: stats.failureRate,
      requestCount: stats.requestCount,
    };
  });

  // Determine overall health status
  let status: HealthCheck['status'] = 'healthy';

  // Database error = unhealthy
  if (checks.database.status === 'error') {
    status = 'unhealthy';
  }
  // Slow database (> 100ms) = degraded
  else if (checks.database.responseTime && checks.database.responseTime > 100) {
    status = 'degraded';
  }

  // Any open circuit breakers = degraded
  const hasOpenCircuits = Object.values(checks.circuitBreakers).some(
    (cb) => cb.state === 'OPEN' || cb.state === 'HALF_OPEN'
  );
  if (hasOpenCircuits && status === 'healthy') {
    status = 'degraded';
  }

  const response: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    gitSha: process.env.NEXT_PUBLIC_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    checks,
  };

  const responseTime = Date.now() - startTime;

  // Return appropriate HTTP status code
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'x-response-time': `${responseTime}ms`,
    },
  });
}
