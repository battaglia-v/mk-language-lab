/**
 * Duolingo-style Lesson Path Types
 *
 * Defines the structure for the vertical lesson path UI
 */

export type LessonNodeType = 'lesson' | 'review' | 'story' | 'checkpoint';

export type LessonNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LessonNode {
  id: string;
  type: LessonNodeType;
  title: string;
  titleMk?: string;
  description?: string;
  status: LessonNodeStatus;
  xpReward: number;
  /** Link to the lesson/session - can be grammar lesson, practice, or reader */
  href?: string;
  /** For lessons: grammar lesson ID; for stories: reader sample ID */
  contentId?: string;
  /** Icon override (default based on type) */
  icon?: string;
  /** Progress percentage (0-100) for in_progress nodes */
  progress?: number;
}

export interface LessonPath {
  id: string;
  title: string;
  description?: string;
  nodes: LessonNode[];
  /** Number of nodes completed */
  completedCount: number;
  /** Total number of nodes */
  totalCount: number;
}

/**
 * Get the next available node in the path
 */
export function getNextNode(path: LessonPath): LessonNode | undefined {
  return path.nodes.find(node => node.status === 'available' || node.status === 'in_progress');
}

/**
 * Calculate path progress percentage
 */
export function getPathProgress(path: LessonPath): number {
  if (path.totalCount === 0) return 0;
  return Math.round((path.completedCount / path.totalCount) * 100);
}
