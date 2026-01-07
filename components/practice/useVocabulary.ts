'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Vocabulary word from the database
 */
export type VocabWord = {
  id: string;
  wordMk: string;
  wordEn: string;
  phonetic: string | null;
  category: string | null;
  mastery: number; // 0-5
  nextReviewAt: string | null;
  timesReviewed: number;
  timesCorrect: number;
  source: string | null;
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Vocabulary counts by status
 */
export type VocabCounts = {
  new: number;
  learning: number;
  mastered: number;
  due: number;
  total: number;
};

/**
 * Status filter for vocabulary queries
 */
export type VocabStatus = 'new' | 'learning' | 'mastered' | 'due' | 'all';

/**
 * Input for saving a new word
 */
export type SaveWordInput = {
  wordMk: string;
  wordEn: string;
  phonetic?: string;
  source: 'practice' | 'reader' | 'translator' | 'manual';
  sourceId?: string;
};

/**
 * Hook for managing user vocabulary state
 *
 * Provides CRUD operations for vocabulary words with SRS tracking.
 * All data is persisted to the database via API endpoints.
 */
export function useVocabulary() {
  const { status } = useSession();
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([]);
  const [counts, setCounts] = useState<VocabCounts>({
    new: 0,
    learning: 0,
    mastered: 0,
    due: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load vocabulary with optional status filter
   */
  const loadVocabulary = useCallback(async (filter: VocabStatus = 'all', limit = 50) => {
    if (status !== 'authenticated') {
      setVocabulary([]);
      setCounts({ new: 0, learning: 0, mastered: 0, due: 0, total: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ status: filter, limit: limit.toString() });
      const res = await fetch(`/api/user/vocabulary?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch vocabulary');
      }

      const data = await res.json();
      setVocabulary(data.words);
      setCounts(data.counts);
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setVocabulary([]);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  /**
   * Save a new word to vocabulary
   * Returns the created/existing word
   */
  const saveWord = useCallback(async (input: SaveWordInput): Promise<VocabWord | null> => {
    if (status !== 'authenticated') {
      return null;
    }

    try {
      const res = await fetch('/api/user/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save word');
      }

      const data = await res.json();
      const word = data.word as VocabWord;

      // Optimistically update local state
      setVocabulary((prev) => {
        const exists = prev.some((w) => w.id === word.id);
        if (exists) return prev;
        return [word, ...prev];
      });

      // Update counts
      setCounts((prev) => ({
        ...prev,
        new: prev.new + 1,
        total: prev.total + 1,
      }));

      return word;
    } catch (err) {
      console.error('Failed to save word:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [status]);

  /**
   * Record a review result for a word
   * Updates mastery and nextReviewAt based on SRS algorithm
   */
  const recordReview = useCallback(async (wordId: string, correct: boolean): Promise<VocabWord | null> => {
    if (status !== 'authenticated') {
      return null;
    }

    try {
      const res = await fetch(`/api/user/vocabulary/${wordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record review');
      }

      const data = await res.json();
      const updatedWord = data.word as VocabWord;

      // Optimistically update local state
      setVocabulary((prev) =>
        prev.map((w) => (w.id === wordId ? updatedWord : w))
      );

      return updatedWord;
    } catch (err) {
      console.error('Failed to record review:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [status]);

  /**
   * Get words that are due for review
   */
  const getDueWords = useCallback(async (limit = 20): Promise<VocabWord[]> => {
    if (status !== 'authenticated') {
      return [];
    }

    try {
      const params = new URLSearchParams({ status: 'due', limit: limit.toString() });
      const res = await fetch(`/api/user/vocabulary?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch due words');
      }

      const data = await res.json();
      return data.words;
    } catch (err) {
      console.error('Failed to get due words:', err);
      return [];
    }
  }, [status]);

  /**
   * Get new words (mastery = 0)
   */
  const getNewWords = useCallback(async (limit = 10): Promise<VocabWord[]> => {
    if (status !== 'authenticated') {
      return [];
    }

    try {
      const params = new URLSearchParams({ status: 'new', limit: limit.toString() });
      const res = await fetch(`/api/user/vocabulary?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch new words');
      }

      const data = await res.json();
      return data.words;
    } catch (err) {
      console.error('Failed to get new words:', err);
      return [];
    }
  }, [status]);

  // Load vocabulary on mount when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      loadVocabulary();
    } else if (status === 'unauthenticated') {
      setVocabulary([]);
      setCounts({ new: 0, learning: 0, mastered: 0, due: 0, total: 0 });
      setIsLoading(false);
    }
  }, [status, loadVocabulary]);

  return {
    // State
    vocabulary,
    counts,
    isLoading,
    error,

    // Actions
    loadVocabulary,
    saveWord,
    recordReview,
    getDueWords,
    getNewWords,
  };
}
