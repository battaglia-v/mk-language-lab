import { apiFetch } from './api';

export type LessonNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LessonNode {
  id: string;
  type: 'lesson' | 'review' | 'story' | 'checkpoint';
  title: string;
  titleMk?: string;
  description?: string;
  status: LessonNodeStatus;
  xpReward: number;
  href?: string;
  contentId?: string;
  progress?: number;
}

export interface LessonPath {
  id: string;
  title: string;
  description?: string;
  nodes: LessonNode[];
  completedCount: number;
  totalCount: number;
}

export interface CurriculumPaths {
  a1: LessonPath;
  a2: LessonPath;
  b1: LessonPath;
}

export async function fetchCurriculum(): Promise<CurriculumPaths> {
  const response = await apiFetch<{ paths: CurriculumPaths }>('/api/mobile/curriculum');
  return response.paths;
}
