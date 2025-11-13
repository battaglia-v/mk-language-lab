import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import fallbackMissionStatus from '../../../data/mission-status.json';

export type MissionChecklistItem = {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
};

export type MissionCoachTip = {
  id: string;
  title: string;
  body: string;
  tag: string;
};

export type MissionReviewCluster = {
  id: string;
  label: string;
  accuracy: number; // 0–1
};

export type MissionCommunityHighlight = {
  id: string;
  title: string;
  detail: string;
  accent: 'gold' | 'green' | 'red';
};

export type MissionLinks = {
  practice?: string;
  translatorInbox?: string;
  settings?: string;
};

export type MissionStatus = {
  missionId: string;
  name: string;
  cycle: {
    type: 'daily' | 'weekly' | 'quest';
    endsAt: string;
  };
  xp: {
    earned: number;
    target: number;
  };
  streakDays: number;
  heartsRemaining: number;
  translatorDirection: string;
  checklist: MissionChecklistItem[];
  coachTips: MissionCoachTip[];
  reviewClusters: MissionReviewCluster[];
  communityHighlights: MissionCommunityHighlight[];
  links?: MissionLinks;
};

const FALLBACK_MISSION_STATUS = fallbackMissionStatus as MissionStatus;

type MissionApiConfig = {
  baseUrl?: string;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export function getLocalMissionStatus(): MissionStatus {
  return FALLBACK_MISSION_STATUS;
}

export async function fetchMissionStatus(config: MissionApiConfig = {}): Promise<MissionStatus> {
  const { baseUrl, fetcher = fetch, signal } = config;
  const url = `${normalizeBaseUrl(baseUrl)}/api/missions/current`;
  const response = await fetcher(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch mission status (${response.status})`);
  }
  return (await response.json()) as MissionStatus;
}

export const missionStatusQueryKey = ['mission-status'] as const;

export type MissionStatusQueryOptions<TData = MissionStatus> = {
  baseUrl?: string;
  staleTime?: number;
  enabled?: boolean;
  fetcher?: typeof fetch;
  select?: UseQueryOptions<MissionStatus, Error, TData>['select'];
};

export function useMissionStatusQuery<TData = MissionStatus>({
  baseUrl,
  staleTime = 60_000,
  enabled,
  fetcher,
  select,
}: MissionStatusQueryOptions<TData> = {}) {
  return useQuery<MissionStatus, Error, TData>({
    queryKey: missionStatusQueryKey,
    queryFn: ({ signal }) => fetchMissionStatus({ baseUrl, signal, fetcher }),
    staleTime,
    enabled: enabled ?? Boolean(baseUrl),
    select,
  });
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable missions.');
  }
  return value.replace(/\/$/, '');
}
