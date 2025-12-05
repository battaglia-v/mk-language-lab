import type { AnalyzedTextData } from '@/components/translate/useReaderWorkspace';

export type ReaderHistoryEntry = {
  id: string;
  directionId: 'mk-en' | 'en-mk';
  sourceText: string;
  analyzedData: AnalyzedTextData;
  timestamp: number;
};

const STORAGE_KEY = 'mkll:reader-history';

export function readReaderHistory(limit = 6): ReaderHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, limit);
  } catch (error) {
    console.error('Failed to read reader history:', error);
    return [];
  }
}

export function writeReaderHistory(history: ReaderHistoryEntry[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to write reader history:', error);
  }
}
