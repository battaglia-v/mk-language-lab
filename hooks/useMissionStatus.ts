'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getLocalMissionStatus, type MissionStatus } from '@mk/api-client';

export type MissionLoadState = 'loading' | 'ready' | 'error';

export type MissionResource = {
  mission: MissionStatus;
  state: MissionLoadState;
  error?: string;
  refresh: () => void;
};

export function useMissionStatusResource(initialMission?: MissionStatus): MissionResource {
  const { status } = useSession();
  const fallback = useMemo(
    () => initialMission ?? getLocalMissionStatus(),
    [initialMission]
  );
  const [mission, setMission] = useState<MissionStatus>(fallback);
  const [state, setState] = useState<MissionLoadState>(initialMission ? 'ready' : 'loading');
  const [error, setError] = useState<string>();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      setState('ready');
      setError(undefined);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setState((current) => (current === 'loading' ? current : 'loading'));
      setError(undefined);
      try {
        const response = await fetch('/api/missions/current', {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload = (await response.json()) as MissionStatus;
        if (!cancelled) {
          setMission(payload);
          setState('ready');
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.warn('Failed to load mission status', err);
        setState('error');
        setError('Using cached mission data. Retry to refresh.');
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshToken, status]);

  const refresh = () => setRefreshToken((token) => token + 1);

  return { mission, state, error, refresh };
}
