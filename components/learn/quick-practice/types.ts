export type {
  ClozeContext,
  PracticeItem,
  PracticeDirection,
  PracticeDrillMode,
} from '@mk/api-client';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type { PracticeDifficultyId, PracticeDifficultyPreset } from '@mk/practice';

export type QuickPracticeTalisman = {
  id: 'perfect' | 'streak';
  title: string;
  description: string;
  xpMultiplier: number;
};
