import { apiFetch } from './api';

export interface UserProgress {
  currentLevel: 'A1' | 'A2' | 'B1';
  currentLesson: number;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
  xp: number;
}

export async function fetchProgress(): Promise<UserProgress> {
  return apiFetch<UserProgress>('/api/progress');
}
