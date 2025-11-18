'use client';

import type { TranslationHistoryEntry } from '@/components/translate/useTranslatorWorkspace';

const STORAGE_KEY = 'mkll:translator-history';

export function readTranslatorHistory(limit?: number): TranslationHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TranslationHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    const sorted = parsed
      .filter((entry) => Boolean(entry?.id && entry?.sourceText && entry?.translatedText))
      .sort((a, b) => b.timestamp - a.timestamp);
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  } catch (error) {
    console.warn('Failed to read translator history', error);
    return [];
  }
}

export function writeTranslatorHistory(entries: TranslationHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
