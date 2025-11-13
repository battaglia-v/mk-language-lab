import type { Level } from '@/components/learn/quick-practice/types';

export const formatCategory = (category?: string | null) => {
  if (!category) return '';
  return category
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
};

export const getLevelInfo = (level: Level) => {
  const levelConfig = {
    beginner: {
      label: 'Beginner',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      nextThreshold: 200,
    },
    intermediate: {
      label: 'Intermediate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      nextThreshold: 500,
    },
    advanced: {
      label: 'Advanced',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      nextThreshold: null,
    },
  } as const;

  return levelConfig[level];
};
