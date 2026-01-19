/**
 * Weak Topics API
 * 
 * GET /api/user/weak-topics - Get user's weak grammar topics
 * 
 * Returns the top 3 topics where the user has:
 * - At least 3 attempts (reliable data)
 * - Confidence score below 0.6 (needs work)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GRAMMAR_TOPICS, type GrammarTopicId } from '@/lib/learn/grammar-topics';
import { calculateConfidence, isWeakTopic } from '@/lib/learn/confidence-score';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export interface WeakTopicResponse {
  topicId: GrammarTopicId;
  nameEn: string;
  nameMk: string;
  level: string;
  category: string;
  confidence: {
    score: number;
    level: string;
    suggestion: string;
  };
  totalAttempts: number;
  correctAttempts: number;
}

/**
 * GET /api/user/weak-topics
 * 
 * Fetch user's weak grammar topics for Focus Areas display
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

    // Fetch all grammar performance records
    const performances = await prisma.grammarPerformance.findMany({
      where: { userId: session.user.id },
    });

    // Calculate confidence and filter weak topics
    const weakTopics: WeakTopicResponse[] = [];

    for (const perf of performances) {
      const attempts = perf.attempts as Array<{ correct: boolean; timestamp: number }>;
      const confidence = calculateConfidence(attempts);

      if (isWeakTopic(confidence)) {
        const topicInfo = GRAMMAR_TOPICS[perf.topicId as GrammarTopicId];
        
        if (topicInfo) {
          weakTopics.push({
            topicId: perf.topicId as GrammarTopicId,
            nameEn: topicInfo.nameEn,
            nameMk: topicInfo.nameMk,
            level: topicInfo.level,
            category: topicInfo.category,
            confidence: {
              score: Math.round(confidence.score * 100),
              level: confidence.level,
              suggestion: confidence.suggestion,
            },
            totalAttempts: perf.totalAttempts,
            correctAttempts: perf.correctAttempts,
          });
        }
      }
    }

    // Sort by confidence score (lowest first) and limit to top 3
    weakTopics.sort((a, b) => a.confidence.score - b.confidence.score);
    const topWeakTopics = weakTopics.slice(0, 3);

    // Track view event (server-side for authenticated users)
    if (topWeakTopics.length > 0) {
      // Note: This is logged on the server; client should also track
      console.log('[Weak Topics] User has', topWeakTopics.length, 'weak topics');
    }

    return NextResponse.json({
      success: true,
      weakTopics: topWeakTopics,
      totalWeakTopics: weakTopics.length,
    });
  } catch (error) {
    console.error('[Weak Topics API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
