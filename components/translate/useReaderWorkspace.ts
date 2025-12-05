'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import { readReaderHistory, writeReaderHistory, type ReaderHistoryEntry } from '@/lib/reader-history';

export type WordAnalysis = {
  id: string;
  original: string;
  translation: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  index: number;
};

export type TokenData = {
  token: string;
  isWord: boolean;
  index: number;
};

export type AnalyzedTextData = {
  words: WordAnalysis[];
  tokens: TokenData[];
  fullTranslation: string;
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
    factors: {
      avgWordLength: number;
      longWords: number;
      totalWords: number;
    };
  };
  metadata: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
  };
};

export type ReaderDirectionOption = {
  id: 'mk-en' | 'en-mk';
  sourceLang: 'mk' | 'en';
  targetLang: 'mk' | 'en';
  label: string;
  placeholder: string;
};

type RevealMode = 'hidden' | 'revealed';

type ReaderWorkspaceMessages = {
  genericError: string;
  importError: string;
};

type UseReaderWorkspaceOptions = {
  directionOptions: ReaderDirectionOption[];
  defaultDirectionId?: ReaderDirectionOption['id'];
  analyzePath?: string;
  importPath?: string;
  historyLimit?: number;
  messages: ReaderWorkspaceMessages;
};

export function useReaderWorkspace({
  directionOptions,
  defaultDirectionId,
  analyzePath = '/api/translate/analyze',
  importPath = '/api/translate/import',
  historyLimit = 6,
  messages,
}: UseReaderWorkspaceOptions) {
  const initialDirection = defaultDirectionId ?? directionOptions[0]?.id ?? 'en-mk';
  const [directionId, setDirectionId] = useState<ReaderDirectionOption['id']>(initialDirection);
  const selectedDirection = directionOptions.find((option) => option.id === directionId) ?? directionOptions[0];

  const [inputText, setInputText] = useState('');
  const [analyzedData, setAnalyzedData] = useState<AnalyzedTextData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [revealMode, setRevealMode] = useState<RevealMode>('hidden');
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
  const [history, setHistory] = useState<ReaderHistoryEntry[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setHistory(readReaderHistory(historyLimit));
  }, [historyLimit]);

  const persistHistory = useCallback(
    (updater: ReaderHistoryEntry[] | ((previous: ReaderHistoryEntry[]) => ReaderHistoryEntry[])) => {
      setHistory((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater;
        writeReaderHistory(next);
        return next;
      });
    },
    [],
  );

  const handleAnalyze = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const text = inputText.trim();

      if (!text) {
        setErrorMessage('Please enter some text to analyze');
        return;
      }

      setIsAnalyzing(true);
      setErrorMessage(null);
      setIsRetryable(false);
      setAnalyzedData(null);

      trackEvent(AnalyticsEvents.READER_ANALYSIS_REQUESTED, {
        textLength: text.length,
        direction: directionId,
      });

      try {
        const response = await fetch(analyzePath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: selectedDirection?.sourceLang,
            targetLang: selectedDirection?.targetLang,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error || `Analysis failed (${response.status})`;

          if (response.status === 429) {
            setIsRetryable(true);
            setErrorMessage('Rate limit exceeded. Please try again in a moment.');
          } else if (response.status >= 500) {
            setIsRetryable(true);
            setErrorMessage(message);
          } else {
            setIsRetryable(false);
            setErrorMessage(message);
          }

          trackEvent(AnalyticsEvents.READER_ANALYSIS_FAILED, {
            status: response.status,
            direction: directionId,
          });

          return;
        }

        const data: AnalyzedTextData = await response.json();
        setAnalyzedData(data);
        setErrorMessage(null);

        // Add to history
        const entry: ReaderHistoryEntry = {
          id: `reader-${Date.now()}`,
          directionId,
          sourceText: text,
          analyzedData: data,
          timestamp: Date.now(),
        };

        persistHistory((prev) => {
          const filtered = prev.filter(
            (item) => item.sourceText !== text || item.directionId !== directionId
          );
          return [entry, ...filtered].slice(0, historyLimit);
        });

        trackEvent(AnalyticsEvents.READER_ANALYSIS_SUCCESS, {
          wordCount: data.metadata.wordCount,
          difficulty: data.difficulty.level,
          direction: directionId,
        });
      } catch (error) {
        console.error('Analysis error:', error);
        setErrorMessage(messages.genericError);
        setIsRetryable(true);
        trackEvent(AnalyticsEvents.READER_ANALYSIS_FAILED, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [inputText, directionId, selectedDirection, analyzePath, messages, persistHistory, historyLimit],
  );

  const handleToggleReveal = useCallback(() => {
    setRevealMode((prev) => (prev === 'hidden' ? 'revealed' : 'hidden'));
    trackEvent(AnalyticsEvents.READER_REVEAL_TOGGLED, {
      mode: revealMode === 'hidden' ? 'revealed' : 'hidden',
    });
  }, [revealMode]);

  const handleWordClick = useCallback((word: WordAnalysis) => {
    setSelectedWord(word);
    trackEvent(AnalyticsEvents.READER_WORD_CLICKED, {
      word: word.original,
      pos: word.pos,
      difficulty: word.difficulty,
    });
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setAnalyzedData(null);
    setErrorMessage(null);
    setSelectedWord(null);
    setRevealMode('hidden');
  }, []);

  const handleSwapDirections = useCallback(() => {
    setDirectionId((prev) => (prev === 'mk-en' ? 'en-mk' : 'mk-en'));
  }, []);

  const handleHistoryLoad = useCallback((entry: ReaderHistoryEntry) => {
    setInputText(entry.sourceText);
    setAnalyzedData(entry.analyzedData);
    setDirectionId(entry.directionId);
    setErrorMessage(null);
    setRevealMode('hidden');
  }, []);

  const handleImportFromURL = useCallback(
    async (url: string) => {
      setIsImporting(true);
      setErrorMessage(null);

      try {
        const response = await fetch(importPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'url', url }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error || 'Failed to import from URL';
          setErrorMessage(message);
          trackEvent(AnalyticsEvents.READER_IMPORT_FAILED, {
            type: 'url',
            error: message,
          });
          return null;
        }

        const data = await response.json();
        setInputText(data.text);
        setErrorMessage(null);

        trackEvent(AnalyticsEvents.READER_IMPORT_SUCCESS, {
          type: 'url',
          wordCount: data.metadata.wordCount,
        });

        return data;
      } catch (error) {
        console.error('Import error:', error);
        setErrorMessage(messages.importError);
        trackEvent(AnalyticsEvents.READER_IMPORT_FAILED, {
          type: 'url',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [importPath, messages],
  );

  const handleImportFromFile = useCallback(
    async (file: File) => {
      setIsImporting(true);
      setErrorMessage(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(importPath, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error || 'Failed to import file';
          setErrorMessage(message);
          trackEvent(AnalyticsEvents.READER_IMPORT_FAILED, {
            type: 'file',
            error: message,
          });
          return null;
        }

        const data = await response.json();
        setInputText(data.text);
        setErrorMessage(null);

        trackEvent(AnalyticsEvents.READER_IMPORT_SUCCESS, {
          type: 'file',
          wordCount: data.metadata.wordCount,
        });

        return data;
      } catch (error) {
        console.error('Import error:', error);
        setErrorMessage(messages.importError);
        trackEvent(AnalyticsEvents.READER_IMPORT_FAILED, {
          type: 'file',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [importPath, messages],
  );

  return {
    directionId,
    setDirectionId,
    selectedDirection,
    inputText,
    setInputText,
    analyzedData,
    isAnalyzing,
    errorMessage,
    isRetryable,
    revealMode,
    selectedWord,
    history,
    isImporting,
    handleAnalyze,
    handleToggleReveal,
    handleWordClick,
    handleClear,
    handleSwapDirections,
    handleHistoryLoad,
    handleImportFromURL,
    handleImportFromFile,
  };
}
