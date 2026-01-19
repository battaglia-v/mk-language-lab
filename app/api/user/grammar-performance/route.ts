/**
 * Grammar Performance API
 * 
 * POST /api/user/grammar-performance - Record an exercise attempt
 * GET /api/user/grammar-performance - Get all performance data
 * 
 * Used for tracking user performance on grammar topics
 * and syncing between local storage and server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { GRAMMAR_TOPICS, type GrammarTopicId } from '@/lib/learn/grammar-topics';

// Validation schemas
const attemptSchema = z.object({
  topicId: z.string().refine(
    (id) => id in GRAMMAR_TOPICS,
    { message: 'Invalid grammar topic ID' }
  ),
  correct: z.boolean(),
  timestamp: z.number().optional(), // Unix timestamp, defaults to now
});

const syncSchema = z.object({
  topics: z.record(z.string(), z.object({
    topicId: z.string(),
    attempts: z.array(z.object({
      correct: z.boolean(),
      timestamp: z.number(),
    })),
    totalAttempts: z.number(),
    correctAttempts: z.number(),
    lastAttemptDate: z.string(),
  })),
  lastUpdated: z.string(),
});

/**
 * POST /api/user/grammar-performance
 * 
 * Record a single exercise attempt OR sync full performance data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if this is a single attempt or a full sync
    if ('topicId' in body && 'correct' in body) {
      // Single attempt recording
      const parsed = attemptSchema.parse(body);
      const timestamp = parsed.timestamp || Date.now();
      const today = new Date().toISOString().split('T')[0];

      // Upsert grammar performance record
      await prisma.grammarPerformance.upsert({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId: parsed.topicId,
          },
        },
        update: {
          attempts: {
            push: { correct: parsed.correct, timestamp },
          },
          totalAttempts: { increment: 1 },
          correctAttempts: parsed.correct ? { increment: 1 } : undefined,
          lastAttemptDate: today,
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          topicId: parsed.topicId,
          attempts: [{ correct: parsed.correct, timestamp }],
          totalAttempts: 1,
          correctAttempts: parsed.correct ? 1 : 0,
          lastAttemptDate: today,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Attempt recorded',
      });
    } else if ('topics' in body) {
      // Full sync from client
      const parsed = syncSchema.parse(body);

      // Process each topic
      for (const [topicId, topicData] of Object.entries(parsed.topics)) {
        await prisma.grammarPerformance.upsert({
          where: {
            userId_topicId: {
              userId: session.user.id,
              topicId,
            },
          },
          update: {
            attempts: topicData.attempts,
            totalAttempts: topicData.totalAttempts,
            correctAttempts: topicData.correctAttempts,
            lastAttemptDate: topicData.lastAttemptDate,
            updatedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            topicId,
            attempts: topicData.attempts,
            totalAttempts: topicData.totalAttempts,
            correctAttempts: topicData.correctAttempts,
            lastAttemptDate: topicData.lastAttemptDate,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Performance data synced',
      });
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Grammar Performance API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/grammar-performance
 * 
 * Fetch all grammar performance data for the user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const performances = await prisma.grammarPerformance.findMany({
      where: { userId: session.user.id },
    });

    // Convert to client format
    const topics: Record<string, {
      topicId: string;
      attempts: Array<{ correct: boolean; timestamp: number }>;
      totalAttempts: number;
      correctAttempts: number;
      lastAttemptDate: string;
    }> = {};

    for (const perf of performances) {
      topics[perf.topicId] = {
        topicId: perf.topicId,
        attempts: perf.attempts as Array<{ correct: boolean; timestamp: number }>,
        totalAttempts: perf.totalAttempts,
        correctAttempts: perf.correctAttempts,
        lastAttemptDate: perf.lastAttemptDate,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        topics,
        lastUpdated: performances.length > 0
          ? Math.max(...performances.map(p => p.updatedAt.getTime()))
          : Date.now(),
      },
    });
  } catch (error) {
    console.error('[Grammar Performance API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
