'use client';

import { useCallback, useEffect, useState } from 'react';

type AppConfig = {
  paywallEnabled: boolean;
};

const DEFAULT_CONFIG: AppConfig = {
  paywallEnabled: false,
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
      if (typeof data.paywallEnabled === 'boolean') {
        setConfig({ paywallEnabled: data.paywallEnabled });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { config, isLoading, refresh };
}

