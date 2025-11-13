import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TranslateLanguage } from '@mk/api-client';

export type TranslatorHistoryEntry = {
  id: string;
  directionId: 'en-mk' | 'mk-en';
  sourceLang: TranslateLanguage;
  targetLang: TranslateLanguage;
  sourceText: string;
  translatedText: string;
  detectedLanguage: TranslateLanguage | null;
  timestamp: number;
};

export type AddTranslatorHistoryInput = {
  directionId: TranslatorHistoryEntry['directionId'];
  sourceLang: TranslateLanguage;
  targetLang: TranslateLanguage;
  sourceText: string;
  translatedText: string;
  detectedLanguage: TranslateLanguage | null;
};

const HISTORY_STORAGE_KEY = 'mk.translator.history';
const HISTORY_LIMIT = 20;

type TranslatorHistoryContextValue = {
  history: TranslatorHistoryEntry[];
  isHydrated: boolean;
  addEntry: (input: AddTranslatorHistoryInput) => Promise<TranslatorHistoryEntry>;
  clearHistory: () => Promise<void>;
};

const TranslatorHistoryContext = createContext<TranslatorHistoryContextValue | undefined>(undefined);

async function readHistoryFromStorage(): Promise<TranslatorHistoryEntry[]> {
  try {
    const payload = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!payload) {
      return [];
    }
    const parsed = JSON.parse(payload) as TranslatorHistoryEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is TranslatorHistoryEntry => typeof entry?.id === 'string');
  } catch (error) {
    console.warn('Translator history: failed to load from storage', error);
    return [];
  }
}

async function writeHistoryToStorage(entries: TranslatorHistoryEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Translator history: failed to persist entries', error);
  }
}

type ProviderProps = {
  children: ReactNode;
};

export function TranslatorHistoryProvider({ children }: ProviderProps) {
  const [history, setHistory] = useState<TranslatorHistoryEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void readHistoryFromStorage().then((entries) => {
      if (!isMounted) {
        return;
      }
      setHistory(entries);
      setIsHydrated(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addEntry = useCallback(async (input: AddTranslatorHistoryInput) => {
    const trimmedSource = input.sourceText.trim();
    const trimmedResult = input.translatedText.trim();

    const entry: TranslatorHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      directionId: input.directionId,
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      sourceText: trimmedSource,
      translatedText: trimmedResult,
      detectedLanguage: input.detectedLanguage,
      timestamp: Date.now(),
    };

    setHistory((previous) => {
      const deduped = previous.filter(
        (existing) =>
          !(
            existing.sourceText === trimmedSource &&
            existing.directionId === input.directionId &&
            existing.translatedText === trimmedResult
          )
      );
      const updated = [entry, ...deduped].slice(0, HISTORY_LIMIT);
      void writeHistoryToStorage(updated);
      return updated;
    });

    return entry;
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.warn('Translator history: failed to clear storage', error);
    }
  }, []);

  const value = useMemo<TranslatorHistoryContextValue>(
    () => ({
      history,
      isHydrated,
      addEntry,
      clearHistory,
    }),
    [addEntry, clearHistory, history, isHydrated]
  );

  return <TranslatorHistoryContext.Provider value={value}>{children}</TranslatorHistoryContext.Provider>;
}

export function useTranslatorHistory(): TranslatorHistoryContextValue {
  const ctx = useContext(TranslatorHistoryContext);
  if (!ctx) {
    throw new Error('useTranslatorHistory must be used within TranslatorHistoryProvider');
  }
  return ctx;
}
