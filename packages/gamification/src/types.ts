export type XPSource =
  | 'exercise_correct'
  | 'lesson_complete'
  | 'quest_complete'
  | 'streak_bonus'
  | 'daily_bonus'
  | 'talisman_multiplier';

export type HeartLossReason =
  | 'exercise_incorrect'
  | 'lesson_failed';

export type HeartGainReason =
  | 'time_regeneration'
  | 'lesson_complete'
  | 'admin_grant'
  | 'purchase';

export type StreakStatus = 'active' | 'at_risk' | 'broken' | 'perfect';

export type XPCalculationContext = {
  baseXP: number;
  source: XPSource;
  difficulty?: 'easy' | 'medium' | 'hard';
  talismanMultiplier?: number;
  streakBonus?: number;
};

export type HeartRegenerationContext = {
  currentHearts: number;
  maxHearts: number;
  lastPracticeDate: Date | null;
  currentDate: Date;
};

export type StreakCalculationContext = {
  lastPracticeDate: Date | null;
  currentStreakDays: number;
  currentDate: Date;
  timezone?: string;
};

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type QuestType = 'daily' | 'weekly' | 'squad';

export type QuestCategory = 'practice' | 'translation' | 'social' | 'lesson';

export type QuestStatus = 'active' | 'completed' | 'expired';
