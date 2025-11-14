export type {
  ClozeContext,
  PracticeItem,
  PracticeDirection,
  PracticeDrillMode,
} from '@mk/api-client';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type { PracticeDifficultyId, PracticeDifficultyPreset } from '@mk/practice';

export type PracticeAudioClip = {
  url: string;
  slowUrl?: string | null;
  waveform?: number[] | null;
  duration?: number | null;
  autoplay?: boolean;
};

export type QuickPracticeTalisman = {
  id: 'perfect' | 'streak';
  title: string;
  description: string;
  xpMultiplier: number;
};
