/**
 * Grammar Performance Tracker
 * 
 * Tracks user performance on grammar topics for:
 * - Identifying weak areas
 * - Surfacing focused practice suggestions
 * - Measuring learning progress over time
 * 
 * Storage: localStorage for immediate feedback, syncs to server when online.
 * 
 * Parity: This module works on both PWA and Android (via equivalent implementation).
 */

import { GrammarTopicId, GRAMMAR_TOPICS, getTopic } from './grammar-topics';
import {
  calculateConfidence,
  isWeakTopic,
  type ConfidenceResult,
  type PerformanceEntry,
} from './confidence-score';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const STORAGE_KEY = 'mk-grammar-performance';

/**
 * Performance record for a single grammar topic
 */
export interface TopicPerformance {
  topicId: GrammarTopicId;
  attempts: PerformanceEntry[];
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptDate: string; // ISO date
}

/**
 * All grammar performance data
 */
export interface GrammarPerformanceData {
  topics: Record<string, TopicPerformance>;
  lastUpdated: string; // ISO timestamp
}

/**
 * Weak topic with confidence info for display
 */
export interface WeakTopic {
  topicId: GrammarTopicId;
  nameEn: string;
  nameMk: string;
  level: string;
  confidence: ConfidenceResult;
  totalAttempts: number;
  correctAttempts: number;
}

/**
 * Get default empty performance data
 */
function getDefaultData(): GrammarPerformanceData {
  return {
    topics: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Load grammar performance from localStorage
 */
export function loadGrammarPerformance(): GrammarPerformanceData {
  if (typeof window === 'undefined') return getDefaultData();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    return JSON.parse(stored) as GrammarPerformanceData;
  } catch {
    return getDefaultData();
  }
}

/**
 * Save grammar performance to localStorage
 */
export function saveGrammarPerformance(data: GrammarPerformanceData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[GrammarPerformance] Failed to save:', error);
  }
}

/**
 * Record a performance entry for a grammar topic
 * 
 * @param topicId The grammar topic ID
 * @param correct Whether the answer was correct
 */
export function recordAttempt(topicId: GrammarTopicId, correct: boolean): void {
  const data = loadGrammarPerformance();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Get or create topic record
  if (!data.topics[topicId]) {
    data.topics[topicId] = {
      topicId,
      attempts: [],
      totalAttempts: 0,
      correctAttempts: 0,
      lastAttemptDate: today,
    };
  }

  const topic = data.topics[topicId];

  // Add new attempt
  topic.attempts.push({
    correct,
    timestamp: now,
  });

  // Keep only last 50 attempts to prevent unbounded growth
  if (topic.attempts.length > 50) {
    topic.attempts = topic.attempts.slice(-50);
  }

  // Update counters
  topic.totalAttempts++;
  if (correct) topic.correctAttempts++;
  topic.lastAttemptDate = today;

  // Update last modified
  data.lastUpdated = new Date().toISOString();

  // Save
  saveGrammarPerformance(data);

  // Track analytics
  const confidence = calculateConfidence(topic.attempts);
  trackEvent(AnalyticsEvents.GRAMMAR_PERFORMANCE_UPDATED, {
    topicId,
    correct,
    confidenceScore: Math.round(confidence.score * 100),
    totalAttempts: topic.totalAttempts,
  });
}

/**
 * Get confidence score for a specific topic
 */
export function getTopicConfidence(topicId: GrammarTopicId): ConfidenceResult {
  const data = loadGrammarPerformance();
  const topic = data.topics[topicId];

  if (!topic) {
    return {
      score: 0,
      level: 'weak',
      isReliable: false,
      suggestion: 'Start practicing to build your confidence!',
    };
  }

  return calculateConfidence(topic.attempts);
}

/**
 * Get all weak topics for the user (top 3)
 * 
 * @returns Array of weak topics sorted by confidence (lowest first)
 */
export function getWeakTopics(limit = 3): WeakTopic[] {
  const data = loadGrammarPerformance();
  const weakTopics: WeakTopic[] = [];

  for (const [topicId, performance] of Object.entries(data.topics)) {
    const confidence = calculateConfidence(performance.attempts);
    
    if (isWeakTopic(confidence)) {
      const topicInfo = getTopic(topicId as GrammarTopicId);
      if (topicInfo) {
        weakTopics.push({
          topicId: topicId as GrammarTopicId,
          nameEn: topicInfo.nameEn,
          nameMk: topicInfo.nameMk,
          level: topicInfo.level,
          confidence,
          totalAttempts: performance.totalAttempts,
          correctAttempts: performance.correctAttempts,
        });
      }
    }
  }

  // Sort by confidence score (lowest first)
  weakTopics.sort((a, b) => a.confidence.score - b.confidence.score);

  return weakTopics.slice(0, limit);
}

/**
 * Get performance summary for all topics
 */
export function getPerformanceSummary(): {
  totalTopicsPracticed: number;
  weakCount: number;
  strongCount: number;
  masteredCount: number;
} {
  const data = loadGrammarPerformance();
  let weakCount = 0;
  let strongCount = 0;
  let masteredCount = 0;

  for (const performance of Object.values(data.topics)) {
    const confidence = calculateConfidence(performance.attempts);
    
    if (!confidence.isReliable) continue;
    
    switch (confidence.level) {
      case 'weak':
      case 'developing':
        weakCount++;
        break;
      case 'strong':
        strongCount++;
        break;
      case 'mastered':
        masteredCount++;
        break;
    }
  }

  return {
    totalTopicsPracticed: Object.keys(data.topics).length,
    weakCount,
    strongCount,
    masteredCount,
  };
}

/**
 * Clear all grammar performance data (for testing/reset)
 */
export function clearGrammarPerformance(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export performance data for server sync
 */
export function exportPerformanceForSync(): GrammarPerformanceData {
  return loadGrammarPerformance();
}

/**
 * Import performance data from server
 * Merges with local data, keeping the most recent attempts
 */
export function importPerformanceFromServer(serverData: GrammarPerformanceData): void {
  const local = loadGrammarPerformance();

  for (const [topicId, serverTopic] of Object.entries(serverData.topics)) {
    const localTopic = local.topics[topicId];

    if (!localTopic) {
      // Topic only exists on server, use it directly
      local.topics[topicId] = serverTopic;
    } else {
      // Merge attempts, deduplicating by timestamp
      const allAttempts = [...localTopic.attempts, ...serverTopic.attempts];
      const uniqueAttempts = new Map<number, PerformanceEntry>();
      
      for (const attempt of allAttempts) {
        uniqueAttempts.set(attempt.timestamp, attempt);
      }
      
      localTopic.attempts = Array.from(uniqueAttempts.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
      
      // Recalculate counters
      localTopic.totalAttempts = localTopic.attempts.length;
      localTopic.correctAttempts = localTopic.attempts.filter(a => a.correct).length;
      
      // Use most recent date
      if (serverTopic.lastAttemptDate > localTopic.lastAttemptDate) {
        localTopic.lastAttemptDate = serverTopic.lastAttemptDate;
      }
    }
  }

  local.lastUpdated = new Date().toISOString();
  saveGrammarPerformance(local);
}
