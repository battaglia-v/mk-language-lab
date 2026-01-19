/**
 * Confidence Score Calculator
 * 
 * Calculates a learner's confidence level on a grammar topic
 * based on their recent performance history.
 * 
 * Algorithm:
 * - Recent attempts weighted more heavily than older ones
 * - Minimum attempts required before confidence is meaningful
 * - Decays over time if topic not practiced
 * 
 * Score range: 0.0 (no confidence) to 1.0 (full confidence)
 */

export interface PerformanceEntry {
  correct: boolean;
  timestamp: number; // Unix timestamp
}

export interface ConfidenceResult {
  /** Confidence score 0-1 */
  score: number;
  /** Human-readable confidence level */
  level: 'weak' | 'developing' | 'strong' | 'mastered';
  /** Whether we have enough data for reliable score */
  isReliable: boolean;
  /** Suggested action for the learner */
  suggestion: string;
}

// Configuration
const MIN_ATTEMPTS_FOR_RELIABILITY = 3;
const MAX_ATTEMPTS_TO_CONSIDER = 10;
const RECENCY_DECAY_FACTOR = 0.9; // Each older attempt weighted 10% less
const TIME_DECAY_DAYS = 7; // Score decays after 7 days without practice
const TIME_DECAY_RATE = 0.05; // 5% decay per day after threshold

/**
 * Calculate confidence score from performance history
 * 
 * @param attempts Array of performance entries (most recent first)
 * @returns Confidence result with score, level, and recommendations
 */
export function calculateConfidence(attempts: PerformanceEntry[]): ConfidenceResult {
  // No attempts = no confidence
  if (attempts.length === 0) {
    return {
      score: 0,
      level: 'weak',
      isReliable: false,
      suggestion: 'Start practicing to build your confidence!',
    };
  }

  // Sort by timestamp descending (most recent first)
  const sorted = [...attempts].sort((a, b) => b.timestamp - a.timestamp);
  const recent = sorted.slice(0, MAX_ATTEMPTS_TO_CONSIDER);

  // Calculate weighted accuracy
  let weightedCorrect = 0;
  let totalWeight = 0;

  for (let i = 0; i < recent.length; i++) {
    const weight = Math.pow(RECENCY_DECAY_FACTOR, i);
    weightedCorrect += recent[i].correct ? weight : 0;
    totalWeight += weight;
  }

  let score = totalWeight > 0 ? weightedCorrect / totalWeight : 0;

  // Apply time decay if most recent attempt is old
  const mostRecentTimestamp = recent[0]?.timestamp || 0;
  const daysSinceLastAttempt = (Date.now() - mostRecentTimestamp) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastAttempt > TIME_DECAY_DAYS) {
    const decayDays = daysSinceLastAttempt - TIME_DECAY_DAYS;
    const decayMultiplier = Math.max(0.5, 1 - (decayDays * TIME_DECAY_RATE));
    score *= decayMultiplier;
  }

  // Clamp to 0-1 range
  score = Math.max(0, Math.min(1, score));

  // Determine confidence level
  const level = getConfidenceLevel(score);
  const isReliable = attempts.length >= MIN_ATTEMPTS_FOR_RELIABILITY;
  const suggestion = getSuggestion(level, isReliable, daysSinceLastAttempt);

  return {
    score,
    level,
    isReliable,
    suggestion,
  };
}

/**
 * Get confidence level from score
 */
function getConfidenceLevel(score: number): ConfidenceResult['level'] {
  if (score >= 0.85) return 'mastered';
  if (score >= 0.65) return 'strong';
  if (score >= 0.4) return 'developing';
  return 'weak';
}

/**
 * Get actionable suggestion for learner
 */
function getSuggestion(
  level: ConfidenceResult['level'],
  isReliable: boolean,
  daysSinceLastPractice: number
): string {
  if (!isReliable) {
    return 'Keep practicing to build a reliable picture of your skills.';
  }

  if (daysSinceLastPractice > 14) {
    return 'It\'s been a while! A quick refresher will help solidify this topic.';
  }

  switch (level) {
    case 'weak':
      return 'This needs some attention. Let\'s work on it together!';
    case 'developing':
      return 'You\'re making progress. A bit more practice will strengthen this.';
    case 'strong':
      return 'Great work! Occasional review will keep this fresh.';
    case 'mastered':
      return 'Excellent! You\'ve got this down.';
  }
}

/**
 * Calculate simple accuracy (for display)
 */
export function calculateAccuracy(attempts: PerformanceEntry[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter(a => a.correct).length;
  return correct / attempts.length;
}

/**
 * Determine if a topic should be flagged as "weak"
 * for surfacing in Focus Areas
 */
export function isWeakTopic(confidence: ConfidenceResult): boolean {
  // Must have enough data to be reliable AND be below threshold
  return confidence.isReliable && confidence.score < 0.6;
}
