/**
 * Learning Milestones System
 * 
 * Defines and tracks meaningful learning achievements that
 * celebrate user progress and encourage continued learning.
 * 
 * Milestone Categories:
 * - XP milestones (100, 500, 1000, etc.)
 * - Streak milestones (7 days, 30 days, 100 days)
 * - Learning milestones (words learned, lessons completed)
 * - Skill milestones (grammar topics mastered)
 * 
 * Parity: Shared logic for both PWA and Android
 */

export type MilestoneCategory = 
  | 'xp' 
  | 'streak' 
  | 'words' 
  | 'lessons' 
  | 'grammar' 
  | 'reading'
  | 'special';

export type MilestoneId = 
  // XP Milestones
  | 'xp-100' | 'xp-500' | 'xp-1000' | 'xp-2500' | 'xp-5000' | 'xp-10000'
  // Streak Milestones
  | 'streak-3' | 'streak-7' | 'streak-14' | 'streak-30' | 'streak-50' | 'streak-100' | 'streak-365'
  // Words Learned
  | 'words-10' | 'words-50' | 'words-100' | 'words-250' | 'words-500' | 'words-1000'
  // Lessons Completed
  | 'lessons-1' | 'lessons-5' | 'lessons-10' | 'lessons-25' | 'lessons-50' | 'lessons-100'
  // Grammar Topics Mastered
  | 'grammar-1' | 'grammar-5' | 'grammar-10' | 'grammar-all-a1'
  // Reading
  | 'reading-1' | 'reading-5' | 'reading-10'
  // Special
  | 'first-perfect-lesson' | 'weekly-goal-streak-4' | 'comeback-king';

export interface Milestone {
  id: MilestoneId;
  category: MilestoneCategory;
  /** Display name */
  title: string;
  /** Macedonian title */
  titleMk: string;
  /** Description of achievement */
  description: string;
  /** Emoji or icon identifier */
  icon: string;
  /** Threshold value to reach */
  threshold: number;
  /** XP reward for reaching milestone */
  xpReward: number;
  /** Rarity tier for visual styling */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * All defined milestones
 */
export const MILESTONES: Record<MilestoneId, Milestone> = {
  // XP Milestones
  'xp-100': {
    id: 'xp-100',
    category: 'xp',
    title: 'First Steps',
    titleMk: 'Први чекори',
    description: 'Earn your first 100 XP',
    icon: '⭐',
    threshold: 100,
    xpReward: 10,
    rarity: 'common',
  },
  'xp-500': {
    id: 'xp-500',
    category: 'xp',
    title: 'Rising Star',
    titleMk: 'Ѕвезда во подем',
    description: 'Earn 500 XP total',
    icon: '🌟',
    threshold: 500,
    xpReward: 25,
    rarity: 'common',
  },
  'xp-1000': {
    id: 'xp-1000',
    category: 'xp',
    title: 'XP Champion',
    titleMk: 'XP шампион',
    description: 'Earn 1,000 XP total',
    icon: '🏆',
    threshold: 1000,
    xpReward: 50,
    rarity: 'rare',
  },
  'xp-2500': {
    id: 'xp-2500',
    category: 'xp',
    title: 'XP Master',
    titleMk: 'XP мајстор',
    description: 'Earn 2,500 XP total',
    icon: '💫',
    threshold: 2500,
    xpReward: 75,
    rarity: 'rare',
  },
  'xp-5000': {
    id: 'xp-5000',
    category: 'xp',
    title: 'XP Legend',
    titleMk: 'XP легенда',
    description: 'Earn 5,000 XP total',
    icon: '👑',
    threshold: 5000,
    xpReward: 100,
    rarity: 'epic',
  },
  'xp-10000': {
    id: 'xp-10000',
    category: 'xp',
    title: 'XP Immortal',
    titleMk: 'XP бесмртник',
    description: 'Earn 10,000 XP total',
    icon: '🌌',
    threshold: 10000,
    xpReward: 200,
    rarity: 'legendary',
  },

  // Streak Milestones
  'streak-3': {
    id: 'streak-3',
    category: 'streak',
    title: 'Getting Started',
    titleMk: 'Почеток',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    threshold: 3,
    xpReward: 15,
    rarity: 'common',
  },
  'streak-7': {
    id: 'streak-7',
    category: 'streak',
    title: 'Week Warrior',
    titleMk: 'Неделен воин',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    threshold: 7,
    xpReward: 30,
    rarity: 'common',
  },
  'streak-14': {
    id: 'streak-14',
    category: 'streak',
    title: 'Fortnight Fighter',
    titleMk: 'Двонеделен борец',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    threshold: 14,
    xpReward: 50,
    rarity: 'rare',
  },
  'streak-30': {
    id: 'streak-30',
    category: 'streak',
    title: 'Monthly Master',
    titleMk: 'Месечен мајстор',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    threshold: 30,
    xpReward: 100,
    rarity: 'rare',
  },
  'streak-50': {
    id: 'streak-50',
    category: 'streak',
    title: 'Halfway Hero',
    titleMk: 'Полпат херој',
    description: 'Maintain a 50-day streak',
    icon: '🔥',
    threshold: 50,
    xpReward: 150,
    rarity: 'epic',
  },
  'streak-100': {
    id: 'streak-100',
    category: 'streak',
    title: 'Century Club',
    titleMk: 'Клуб на сто',
    description: 'Maintain a 100-day streak',
    icon: '💯',
    threshold: 100,
    xpReward: 250,
    rarity: 'epic',
  },
  'streak-365': {
    id: 'streak-365',
    category: 'streak',
    title: 'Year of Dedication',
    titleMk: 'Година посветеност',
    description: 'Maintain a 365-day streak',
    icon: '🎖️',
    threshold: 365,
    xpReward: 1000,
    rarity: 'legendary',
  },

  // Words Learned
  'words-10': {
    id: 'words-10',
    category: 'words',
    title: 'Word Collector',
    titleMk: 'Собирач на зборови',
    description: 'Learn 10 words',
    icon: '📚',
    threshold: 10,
    xpReward: 10,
    rarity: 'common',
  },
  'words-50': {
    id: 'words-50',
    category: 'words',
    title: 'Vocabulary Builder',
    titleMk: 'Градител на речник',
    description: 'Learn 50 words',
    icon: '📖',
    threshold: 50,
    xpReward: 25,
    rarity: 'common',
  },
  'words-100': {
    id: 'words-100',
    category: 'words',
    title: 'Word Enthusiast',
    titleMk: 'Ентузијаст за зборови',
    description: 'Learn 100 words',
    icon: '📕',
    threshold: 100,
    xpReward: 50,
    rarity: 'rare',
  },
  'words-250': {
    id: 'words-250',
    category: 'words',
    title: 'Lexicon Explorer',
    titleMk: 'Истражувач на лексикон',
    description: 'Learn 250 words',
    icon: '🗃️',
    threshold: 250,
    xpReward: 75,
    rarity: 'rare',
  },
  'words-500': {
    id: 'words-500',
    category: 'words',
    title: 'Word Wizard',
    titleMk: 'Волшебник со зборови',
    description: 'Learn 500 words',
    icon: '🧙',
    threshold: 500,
    xpReward: 100,
    rarity: 'epic',
  },
  'words-1000': {
    id: 'words-1000',
    category: 'words',
    title: 'Vocabulary Master',
    titleMk: 'Мајстор на речник',
    description: 'Learn 1,000 words',
    icon: '🏛️',
    threshold: 1000,
    xpReward: 200,
    rarity: 'legendary',
  },

  // Lessons Completed
  'lessons-1': {
    id: 'lessons-1',
    category: 'lessons',
    title: 'First Lesson',
    titleMk: 'Прва лекција',
    description: 'Complete your first lesson',
    icon: '🎓',
    threshold: 1,
    xpReward: 10,
    rarity: 'common',
  },
  'lessons-5': {
    id: 'lessons-5',
    category: 'lessons',
    title: 'Eager Learner',
    titleMk: 'Желен ученик',
    description: 'Complete 5 lessons',
    icon: '📝',
    threshold: 5,
    xpReward: 20,
    rarity: 'common',
  },
  'lessons-10': {
    id: 'lessons-10',
    category: 'lessons',
    title: 'Lesson Explorer',
    titleMk: 'Истражувач на лекции',
    description: 'Complete 10 lessons',
    icon: '🗺️',
    threshold: 10,
    xpReward: 40,
    rarity: 'common',
  },
  'lessons-25': {
    id: 'lessons-25',
    category: 'lessons',
    title: 'Knowledge Seeker',
    titleMk: 'Барач на знаење',
    description: 'Complete 25 lessons',
    icon: '🔍',
    threshold: 25,
    xpReward: 75,
    rarity: 'rare',
  },
  'lessons-50': {
    id: 'lessons-50',
    category: 'lessons',
    title: 'Dedicated Student',
    titleMk: 'Посветен студент',
    description: 'Complete 50 lessons',
    icon: '🎯',
    threshold: 50,
    xpReward: 100,
    rarity: 'epic',
  },
  'lessons-100': {
    id: 'lessons-100',
    category: 'lessons',
    title: 'Lesson Legend',
    titleMk: 'Легенда на лекции',
    description: 'Complete 100 lessons',
    icon: '🏆',
    threshold: 100,
    xpReward: 200,
    rarity: 'legendary',
  },

  // Grammar Topics Mastered
  'grammar-1': {
    id: 'grammar-1',
    category: 'grammar',
    title: 'Grammar Beginner',
    titleMk: 'Почетник во граматика',
    description: 'Master your first grammar topic',
    icon: '📐',
    threshold: 1,
    xpReward: 15,
    rarity: 'common',
  },
  'grammar-5': {
    id: 'grammar-5',
    category: 'grammar',
    title: 'Grammar Student',
    titleMk: 'Студент по граматика',
    description: 'Master 5 grammar topics',
    icon: '📏',
    threshold: 5,
    xpReward: 40,
    rarity: 'rare',
  },
  'grammar-10': {
    id: 'grammar-10',
    category: 'grammar',
    title: 'Grammar Expert',
    titleMk: 'Експерт за граматика',
    description: 'Master 10 grammar topics',
    icon: '🎓',
    threshold: 10,
    xpReward: 75,
    rarity: 'epic',
  },
  'grammar-all-a1': {
    id: 'grammar-all-a1',
    category: 'grammar',
    title: 'A1 Grammar Complete',
    titleMk: 'A1 Граматика завршена',
    description: 'Master all A1 grammar topics',
    icon: '🏅',
    threshold: 10, // A1 has 10 topics
    xpReward: 100,
    rarity: 'epic',
  },

  // Reading
  'reading-1': {
    id: 'reading-1',
    category: 'reading',
    title: 'First Story',
    titleMk: 'Прва приказна',
    description: 'Complete your first reader',
    icon: '📖',
    threshold: 1,
    xpReward: 15,
    rarity: 'common',
  },
  'reading-5': {
    id: 'reading-5',
    category: 'reading',
    title: 'Bookworm',
    titleMk: 'Книжен црв',
    description: 'Complete 5 readers',
    icon: '🐛',
    threshold: 5,
    xpReward: 40,
    rarity: 'rare',
  },
  'reading-10': {
    id: 'reading-10',
    category: 'reading',
    title: 'Avid Reader',
    titleMk: 'Страствен читател',
    description: 'Complete 10 readers',
    icon: '📚',
    threshold: 10,
    xpReward: 75,
    rarity: 'epic',
  },

  // Special
  'first-perfect-lesson': {
    id: 'first-perfect-lesson',
    category: 'special',
    title: 'Perfectionist',
    titleMk: 'Перфекционист',
    description: 'Complete a lesson with 100% accuracy',
    icon: '💎',
    threshold: 1,
    xpReward: 25,
    rarity: 'rare',
  },
  'weekly-goal-streak-4': {
    id: 'weekly-goal-streak-4',
    category: 'special',
    title: 'Monthly Champion',
    titleMk: 'Месечен шампион',
    description: 'Meet your weekly goal 4 weeks in a row',
    icon: '🏆',
    threshold: 4,
    xpReward: 100,
    rarity: 'epic',
  },
  'comeback-king': {
    id: 'comeback-king',
    category: 'special',
    title: 'Comeback King',
    titleMk: 'Крал на враќањето',
    description: 'Return after 7+ days and complete a lesson',
    icon: '👑',
    threshold: 1,
    xpReward: 50,
    rarity: 'rare',
  },
};

/**
 * User progress for milestone checking
 */
export interface MilestoneProgress {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  grammarTopicsMastered: number;
  readersCompleted: number;
  perfectLessons: number;
  weeklyGoalStreak: number;
  daysSinceLastActivity?: number;
}

/**
 * Check which milestones a user has newly achieved
 */
export function checkNewMilestones(
  progress: MilestoneProgress,
  earnedMilestoneIds: Set<string>
): Milestone[] {
  const newMilestones: Milestone[] = [];

  for (const milestone of Object.values(MILESTONES)) {
    // Skip if already earned
    if (earnedMilestoneIds.has(milestone.id)) continue;

    // Check if threshold is met
    let currentValue = 0;
    switch (milestone.category) {
      case 'xp':
        currentValue = progress.totalXP;
        break;
      case 'streak':
        currentValue = Math.max(progress.currentStreak, progress.longestStreak);
        break;
      case 'words':
        currentValue = progress.wordsLearned;
        break;
      case 'lessons':
        currentValue = progress.lessonsCompleted;
        break;
      case 'grammar':
        currentValue = progress.grammarTopicsMastered;
        break;
      case 'reading':
        currentValue = progress.readersCompleted;
        break;
      case 'special':
        // Special milestones have custom logic
        if (milestone.id === 'first-perfect-lesson') {
          currentValue = progress.perfectLessons;
        } else if (milestone.id === 'weekly-goal-streak-4') {
          currentValue = progress.weeklyGoalStreak;
        } else if (milestone.id === 'comeback-king') {
          currentValue = progress.daysSinceLastActivity && progress.daysSinceLastActivity >= 7 ? 1 : 0;
        }
        break;
    }

    if (currentValue >= milestone.threshold) {
      newMilestones.push(milestone);
    }
  }

  return newMilestones;
}

/**
 * Get next milestone to achieve in each category
 */
export function getNextMilestones(
  progress: MilestoneProgress,
  earnedMilestoneIds: Set<string>
): Partial<Record<MilestoneCategory, Milestone & { progress: number }>> {
  const nextByCategory: Partial<Record<MilestoneCategory, Milestone & { progress: number }>> = {};

  const categories: MilestoneCategory[] = ['xp', 'streak', 'words', 'lessons', 'grammar', 'reading'];

  for (const category of categories) {
    const categoryMilestones = Object.values(MILESTONES)
      .filter(m => m.category === category && !earnedMilestoneIds.has(m.id))
      .sort((a, b) => a.threshold - b.threshold);

    if (categoryMilestones.length > 0) {
      const next = categoryMilestones[0];
      let currentValue = 0;

      switch (category) {
        case 'xp': currentValue = progress.totalXP; break;
        case 'streak': currentValue = progress.currentStreak; break;
        case 'words': currentValue = progress.wordsLearned; break;
        case 'lessons': currentValue = progress.lessonsCompleted; break;
        case 'grammar': currentValue = progress.grammarTopicsMastered; break;
        case 'reading': currentValue = progress.readersCompleted; break;
      }

      nextByCategory[category] = {
        ...next,
        progress: Math.min(100, Math.round((currentValue / next.threshold) * 100)),
      };
    }
  }

  return nextByCategory;
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: Milestone['rarity']): string {
  switch (rarity) {
    case 'common': return '#9ca3af'; // Gray
    case 'rare': return '#3b82f6'; // Blue
    case 'epic': return '#a855f7'; // Purple
    case 'legendary': return '#f59e0b'; // Gold
  }
}

/**
 * Get rarity background for UI
 */
export function getRarityBackground(rarity: Milestone['rarity']): string {
  switch (rarity) {
    case 'common': return 'rgba(156, 163, 175, 0.1)';
    case 'rare': return 'rgba(59, 130, 246, 0.1)';
    case 'epic': return 'rgba(168, 85, 247, 0.1)';
    case 'legendary': return 'rgba(245, 158, 11, 0.15)';
  }
}
