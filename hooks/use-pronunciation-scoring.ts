'use client';

import { useState, useCallback, useRef } from 'react';
import {
  scorePronunciation,
  scorePronunciationFallback,
  isPronunciationScoringSupported,
  type PronunciationScore,
  type ScoringOptions,
} from '@/lib/pronunciation-scoring';

/**
 * State of the scoring process
 */
export type ScoringState = 'idle' | 'scoring' | 'complete' | 'error';

/**
 * Hook return type
 */
export interface UsePronunciationScoringResult {
  /** Current state of the scoring process */
  state: ScoringState;
  /** The scoring result when complete */
  score: PronunciationScore | null;
  /** Error message if scoring failed */
  error: string | null;
  /** Whether scoring is supported in this browser */
  isSupported: boolean;
  /** Current attempt number (1-indexed) */
  attemptNumber: number;
  /** Start scoring the user's recording against reference */
  scoreRecording: (userAudio: string | Blob, referenceAudio?: string | Blob) => Promise<PronunciationScore | null>;
  /** Reset to try again */
  reset: () => void;
  /** Mark the attempt as skipped */
  skip: () => void;
}

/**
 * Options for the usePronunciationScoring hook
 */
export interface UsePronunciationScoringOptions extends ScoringOptions {
  /** Maximum number of attempts allowed */
  maxAttempts?: number;
  /** Expected duration for fallback scoring (when no reference audio) */
  expectedDuration?: number;
  /** Callback when scoring completes */
  onScoreComplete?: (score: PronunciationScore) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<UsePronunciationScoringOptions, keyof ScoringOptions>> = {
  maxAttempts: 3,
  expectedDuration: 1.5,
  onScoreComplete: () => {},
  onError: () => {},
};

/**
 * React hook for pronunciation scoring
 * 
 * Provides a simple interface for scoring user recordings against
 * reference audio files.
 * 
 * @example
 * ```tsx
 * const { state, score, scoreRecording, reset } = usePronunciationScoring({
 *   onScoreComplete: (result) => console.log('Score:', result.similarity),
 * });
 * 
 * // When user finishes recording
 * await scoreRecording(recordedAudioUrl, referenceAudioUrl);
 * ```
 */
export function usePronunciationScoring(
  options: UsePronunciationScoringOptions = {}
): UsePronunciationScoringResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<ScoringState>('idle');
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  const isSupported = isPronunciationScoringSupported();

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Score a recording against reference audio
   */
  const scoreRecording = useCallback(async (
    userAudio: string | Blob,
    referenceAudio?: string | Blob
  ): Promise<PronunciationScore | null> => {
    if (!isSupported) {
      setError('Pronunciation scoring is not supported in this browser');
      setState('error');
      return null;
    }

    setState('scoring');
    setError(null);

    try {
      let result: PronunciationScore;

      if (referenceAudio) {
        // Full comparison scoring
        result = await scorePronunciation(
          userAudio,
          referenceAudio,
          attemptNumber,
          {
            passingThreshold: opts.passingThreshold,
            excellentThreshold: opts.excellentThreshold,
            analysisSegments: opts.analysisSegments,
            minDurationRatio: opts.minDurationRatio,
            maxDurationRatio: opts.maxDurationRatio,
          }
        );
      } else {
        // Fallback scoring (no reference audio)
        result = await scorePronunciationFallback(
          userAudio,
          opts.expectedDuration,
          attemptNumber
        );
      }

      if (isMountedRef.current) {
        setScore(result);
        setState('complete');
        opts.onScoreComplete(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to score pronunciation';
      
      if (isMountedRef.current) {
        setError(errorMessage);
        setState('error');
        opts.onError(err instanceof Error ? err : new Error(errorMessage));
      }

      return null;
    }
  }, [isSupported, attemptNumber, opts]);

  /**
   * Reset for another attempt
   */
  const reset = useCallback(() => {
    setScore(null);
    setError(null);
    setState('idle');
    setAttemptNumber(prev => Math.min(prev + 1, opts.maxAttempts));
  }, [opts.maxAttempts]);

  /**
   * Mark as skipped (resets attempt counter)
   */
  const skip = useCallback(() => {
    setScore(null);
    setError(null);
    setState('idle');
    setAttemptNumber(1);
  }, []);

  return {
    state,
    score,
    error,
    isSupported,
    attemptNumber,
    scoreRecording,
    reset,
    skip,
  };
}

/**
 * Get localized feedback message based on score
 */
export function getFeedbackMessage(
  score: PronunciationScore,
  messages: {
    excellent: string;
    good: string;
    almostThere: string;
    trySlower: string;
    tryLouder: string;
    tooShort: string;
    tooLong: string;
    needsWork: string;
  }
): string {
  return messages[score.feedbackKey];
}

/**
 * Get a color class for the score display
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-accent';
  if (score >= 50) return 'text-yellow-500';
  return 'text-destructive';
}

/**
 * Get background color class for the score display
 */
export function getScoreBgClass(score: number): string {
  if (score >= 90) return 'bg-green-500/10';
  if (score >= 70) return 'bg-accent/10';
  if (score >= 50) return 'bg-yellow-500/10';
  return 'bg-destructive/10';
}
