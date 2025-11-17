'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  buildSavedPhraseFingerprint,
  readSavedPhrases,
  removeSavedPhrase,
  SavedPhrasePayload,
  SavedPhraseRecord,
  upsertSavedPhrase,
  writeSavedPhrases,
} from '@/lib/saved-phrases';

export function useSavedPhrases() {
  const [phrases, setPhrases] = useState<SavedPhraseRecord[]>([]);

  useEffect(() => {
    setPhrases(readSavedPhrases());
  }, []);

  const persist = useCallback((next: SavedPhraseRecord[] | ((prev: SavedPhraseRecord[]) => SavedPhraseRecord[])) => {
    setPhrases((prev) => {
      const updated = typeof next === 'function' ? (next as (prev: SavedPhraseRecord[]) => SavedPhraseRecord[])(prev) : next;
      writeSavedPhrases(updated);
      return updated;
    });
  }, []);

  const savePhrase = useCallback(
    (payload: SavedPhrasePayload) => {
      persist((prev) => upsertSavedPhrase(prev, payload));
    },
    [persist],
  );

  const deletePhrase = useCallback(
    (id: string) => {
      persist((prev) => removeSavedPhrase(prev, id));
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const isSaved = useCallback(
    (payload: SavedPhrasePayload) => {
      const fingerprint = buildSavedPhraseFingerprint(payload);
      return phrases.some((phrase) => phrase.fingerprint === fingerprint);
    },
    [phrases],
  );

  const findMatchingPhrase = useCallback(
    (payload: SavedPhrasePayload) => {
      const fingerprint = buildSavedPhraseFingerprint(payload);
      return phrases.find((phrase) => phrase.fingerprint === fingerprint);
    },
    [phrases],
  );

  return {
    phrases,
    savePhrase,
    deletePhrase,
    clearAll,
    isSaved,
    findMatchingPhrase,
  };
}
