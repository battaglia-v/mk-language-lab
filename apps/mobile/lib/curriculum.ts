import { apiFetch, ApiError } from './api';

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

// Default empty curriculum for fallback
const EMPTY_PATH: LessonPath = {
  id: '',
  title: '',
  description: '',
  nodes: [],
  completedCount: 0,
  totalCount: 0,
};

const DEFAULT_CURRICULUM: CurriculumPaths = {
  a1: { ...EMPTY_PATH, id: 'a1', title: 'A1 Beginner', description: 'Build core basics' },
  a2: { ...EMPTY_PATH, id: 'a2', title: 'A2 Elementary', description: 'Everyday topics' },
  b1: { ...EMPTY_PATH, id: 'b1', title: 'B1 Intermediate', description: 'Strengthen fluency' },
};

export async function fetchCurriculum(): Promise<CurriculumPaths> {
  try {
    console.log('[Curriculum] Fetching curriculum...');
    const response = await apiFetch<{ paths: CurriculumPaths; authenticated?: boolean }>(
      '/api/mobile/curriculum',
      { skipAuth: true } // Allow unauthenticated access
    );
    
    if (response.paths) {
      console.log('[Curriculum] Successfully loaded paths');
      return response.paths;
    }
    
    console.warn('[Curriculum] No paths in response, using defaults');
    return DEFAULT_CURRICULUM;
  } catch (error) {
    console.error('[Curriculum] Failed to fetch:', error);
    
    // Return defaults on error so UI doesn't break
    if (error instanceof ApiError) {
      console.warn(`[Curriculum] API error ${error.status}: ${error.message}`);
    }
    
    // Return defaults - the app will still work with placeholder content
    // This allows offline browsing and viewing lesson structure
    console.log('[Curriculum] Using default curriculum (offline mode)');
    return DEFAULT_CURRICULUM;
  }
}
