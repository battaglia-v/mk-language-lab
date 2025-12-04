export const ALL_CATEGORIES = 'all';
export const SESSION_TARGET = 20; // Number of correct answers to complete a session
export const INITIAL_HEARTS = 5;

export type PracticeDifficultyId = 'casual' | 'focus' | 'blitz';

export type PracticeDifficultyPreset = {
  id: PracticeDifficultyId;
  label: string;
  description: string;
  xpMultiplier: number;
  heartPenalty: number;
  timerSeconds?: number;
};

export const PRACTICE_DIFFICULTIES: PracticeDifficultyPreset[] = [
  {
    id: 'casual',
    label: 'Casual',
    description: 'No timer, standard XP for relaxed runs.',
    xpMultiplier: 1,
    heartPenalty: 1,
  },
  {
    id: 'focus',
    label: 'Focus',
    description: '45s timer, +25% XP, normal heart loss.',
    xpMultiplier: 1.25,
    heartPenalty: 1,
    timerSeconds: 45,
  },
  {
    id: 'blitz',
    label: 'Blitz',
    description: '20s timer, +50% XP, mistakes cost two hearts.',
    xpMultiplier: 1.5,
    heartPenalty: 2,
    timerSeconds: 20,
  },
];

const PRACTICE_DIFFICULTY_MAP = PRACTICE_DIFFICULTIES.reduce<Record<PracticeDifficultyId, PracticeDifficultyPreset>>(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<PracticeDifficultyId, PracticeDifficultyPreset>
);

export function getPracticeDifficultyPreset(id: PracticeDifficultyId): PracticeDifficultyPreset {
  return PRACTICE_DIFFICULTY_MAP[id] ?? PRACTICE_DIFFICULTIES[0];
}
