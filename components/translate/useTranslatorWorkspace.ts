'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';

export type TranslationDirectionOption = {
  id: 'mk-en' | 'en-mk';
  sourceLang: 'mk' | 'en';
  targetLang: 'mk' | 'en';
  label: string;
  placeholder: string;
};

export type TranslationHistoryEntry = {
  id: string;
  directionId: TranslationDirectionOption['id'];
  sourceText: string;
  translatedText: string;
  timestamp: number;
};

type CopyState = 'idle' | 'copied';

type TranslatorWorkspaceMessages = {
  genericError: string;
  copyError: string;
};

type UseTranslatorWorkspaceOptions = {
  directionOptions: TranslationDirectionOption[];
  defaultDirectionId?: TranslationDirectionOption['id'];
  translatePath?: string;
  historyLimit?: number;
  messages: TranslatorWorkspaceMessages;
};

export function useTranslatorWorkspace({
  directionOptions,
  defaultDirectionId,
  translatePath = '/api/translate',
  historyLimit = 6,
  messages,
}: UseTranslatorWorkspaceOptions) {
  const initialDirection = defaultDirectionId ?? directionOptions[0]?.id ?? 'en-mk';
  const [directionId, setDirectionId] =
    useState<TranslationDirectionOption['id']>(initialDirection);
  const selectedDirection = useMemo(
    () => directionOptions.find((option) => option.id === directionId) ?? directionOptions[0],
    [directionId, directionOptions]
  );

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [copiedState, setCopiedState] = useState<CopyState>('idle');
  const [history, setHistory] = useState<TranslationHistoryEntry[]>([]);

  const handleTranslate = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const text = inputText.trim();

      if (!text) {
        setTranslatedText('');
        setDetectedLanguage(null);
        setErrorMessage(null);
        setCopiedState('idle');
        return;
      }

      setIsTranslating(true);
      setErrorMessage(null);
      setIsRetryable(false);

      trackEvent(AnalyticsEvents.TRANSLATION_REQUESTED, {
        direction: directionId,
        textLength: text.length,
      });

      try {
        const response = await fetch(translatePath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: selectedDirection?.sourceLang,
            targetLang: selectedDirection?.targetLang,
          }),
        });

        const data = (await response.json()) as {
          translatedText?: string;
          detectedSourceLang?: string | null;
          error?: string;
          message?: string;
          retryable?: boolean;
        };

        if (!response.ok || !data.translatedText) {
          const errorMsg = data.message || data.error || messages.genericError;
          setIsRetryable(Boolean(data.retryable));
          trackEvent(AnalyticsEvents.TRANSLATION_FAILED, {
            direction: directionId,
            retryable: Boolean(data.retryable),
          });
          throw new Error(errorMsg);
        }

        const trimmedTranslation = data.translatedText.trim();
        setTranslatedText(trimmedTranslation);
        setDetectedLanguage(data.detectedSourceLang ?? null);
        setCopiedState('idle');

        trackEvent(AnalyticsEvents.TRANSLATION_SUCCESS, {
          direction: directionId,
          textLength: text.length,
        });

        const newEntry: TranslationHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          directionId,
          sourceText: text,
          translatedText: trimmedTranslation,
          timestamp: Date.now(),
        };

        setHistory((previous) => {
          const filtered = previous.filter(
            (entry) => entry.sourceText !== text || entry.directionId !== directionId
          );
          return [newEntry, ...filtered].slice(0, historyLimit);
        });
      } catch (error) {
        console.error('Translation failed', error);
        setTranslatedText('');
        setDetectedLanguage(null);
        setErrorMessage(error instanceof Error ? error.message : messages.genericError);
      } finally {
        setIsTranslating(false);
      }
    },
    [directionId, historyLimit, inputText, messages.genericError, selectedDirection, translatePath]
  );

  const handleSwapDirections = useCallback(() => {
    setDirectionId((current) => (current === 'mk-en' ? 'en-mk' : 'mk-en'));
    setErrorMessage(null);
    setDetectedLanguage(null);
    setCopiedState('idle');
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!translatedText) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(translatedText);
        setCopiedState('copied');
        window.setTimeout(() => setCopiedState('idle'), 1500);
        trackEvent(AnalyticsEvents.TRANSLATION_COPIED, {
          direction: directionId,
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Copy failed', error);
      setErrorMessage(messages.copyError);
    }
  }, [directionId, messages.copyError, translatedText]);

  const handleHistoryLoad = useCallback((entry: TranslationHistoryEntry) => {
    setDirectionId(entry.directionId);
    setInputText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);

  return {
    directionId,
    setDirectionId,
    selectedDirection,
    inputText,
    setInputText,
    translatedText,
    detectedLanguage,
    isTranslating,
    errorMessage,
    isRetryable,
    copiedState,
    history,
    handleTranslate,
    handleSwapDirections,
    handleClear,
    handleCopy,
    handleHistoryLoad,
  };
}
