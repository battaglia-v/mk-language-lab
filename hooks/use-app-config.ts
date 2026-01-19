'use client';

import { useCallback, useEffect, useState } from 'react';

type AppConfig = {
  paywallEnabled: boolean;
  /** Enable adaptive difficulty in practice sessions */
  adaptiveDifficultyEnabled: boolean;
  /** Enable Focus Areas card (weak grammar topics) */
  focusAreasEnabled: boolean;
  /** Enable dialogue-based review mode */
  dialogueReviewEnabled: boolean;
};

const DEFAULT_CONFIG: AppConfig = {
  paywallEnabled: false,
  adaptiveDifficultyEnabled: true,
  focusAreasEnabled: true,
  dialogueReviewEnabled: true,
};

export function useAppConfig(): {
  config: AppConfig;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) return;
      const data = (await response.json()) as Partial<AppConfig>;
      setConfig(prev => ({
        ...prev,
        ...(typeof data.paywallEnabled === 'boolean' && { paywallEnabled: data.paywallEnabled }),
        ...(typeof data.adaptiveDifficultyEnabled === 'boolean' && { adaptiveDifficultyEnabled: data.adaptiveDifficultyEnabled }),
        ...(typeof data.focusAreasEnabled === 'boolean' && { focusAreasEnabled: data.focusAreasEnabled }),
        ...(typeof data.dialogueReviewEnabled === 'boolean' && { dialogueReviewEnabled: data.dialogueReviewEnabled }),
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { config, isLoading, refresh };
}

