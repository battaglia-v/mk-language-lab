'use client';

import type { PracticeItem } from '@mk/api-client';

export type SavedPhraseDirection = 'mk-en' | 'en-mk';

export type SavedPhrasePayload = {
  sourceText: string;
  translatedText: string;
  directionId: SavedPhraseDirection;
};

export type SavedPhraseRecord = SavedPhrasePayload & {
  id: string;
  createdAt: string;
  fingerprint: string;
};

const STORAGE_KEY = 'mkll:saved-phrases';

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function buildSavedPhraseFingerprint(payload: SavedPhrasePayload) {
  return `${payload.directionId}::${normalize(payload.sourceText).toLowerCase()}::${normalize(payload.translatedText).toLowerCase()}`;
}

export function readSavedPhrases(): SavedPhraseRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPhraseRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => Boolean(entry.id && entry.sourceText && entry.translatedText && entry.directionId));
  } catch (error) {
    console.warn('Failed to read saved phrases', error);
    return [];
  }
}

export function writeSavedPhrases(entries: SavedPhraseRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function upsertSavedPhrase(entries: SavedPhraseRecord[], payload: SavedPhrasePayload): SavedPhraseRecord[] {
  const fingerprint = buildSavedPhraseFingerprint(payload);
  const nextEntries = [...entries];
  const existingIndex = nextEntries.findIndex((entry) => entry.fingerprint === fingerprint);
  if (existingIndex >= 0) {
    nextEntries[existingIndex] = {
      ...nextEntries[existingIndex],
      sourceText: normalize(payload.sourceText),
      translatedText: normalize(payload.translatedText),
      createdAt: new Date().toISOString(),
    };
    return nextEntries;
  }
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `phrase-${Date.now()}`;
  nextEntries.unshift({
    ...payload,
    sourceText: normalize(payload.sourceText),
    translatedText: normalize(payload.translatedText),
    id,
    createdAt: new Date().toISOString(),
    fingerprint,
  });
  return nextEntries;
}

export function removeSavedPhrase(entries: SavedPhraseRecord[], id: string): SavedPhraseRecord[] {
  return entries.filter((entry) => entry.id !== id);
}

export function clearSavedPhrases(): SavedPhraseRecord[] {
  return [];
}

export function mapSavedPhrasesToPracticeItems(entries: SavedPhraseRecord[]): PracticeItem[] {
  return entries.map((entry) => {
    const macedonian = entry.directionId === 'en-mk' ? entry.translatedText : entry.sourceText;
    const english = entry.directionId === 'en-mk' ? entry.sourceText : entry.translatedText;
    return {
      id: entry.id,
      macedonian,
      english,
      category: 'saved-phrases',
    } satisfies PracticeItem;
  });
}

export function getSavedPhrasePracticePrompts(): PracticeItem[] {
  return mapSavedPhrasesToPracticeItems(readSavedPhrases());
}
