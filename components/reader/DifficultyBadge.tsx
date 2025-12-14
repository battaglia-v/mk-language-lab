'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

interface DifficultyBadgeProps {
  /** CEFR difficulty level */
  level: CEFRLevel;
  /** Show label text (default: true) */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

const LEVEL_CONFIG: Record<CEFRLevel, {
  label: { en: string; mk: string };
  description: { en: string; mk: string };
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  A1: {
    label: { en: 'Beginner', mk: 'Почетник' },
    description: { en: 'Simple greetings, numbers, basic vocabulary', mk: 'Едноставни поздрави, броеви' },
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
  },
  A2: {
    label: { en: 'Elementary', mk: 'Елементарно' },
    description: { en: 'Everyday situations, simple sentences', mk: 'Секојдневни ситуации' },
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/30',
  },
  B1: {
    label: { en: 'Intermediate', mk: 'Средно ниво' },
    description: { en: 'News articles, opinions, longer texts', mk: 'Новински статии, мислења' },
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
  },
  B2: {
    label: { en: 'Upper Intermediate', mk: 'Повисоко средно' },
    description: { en: 'Complex texts, abstract topics', mk: 'Комплексни текстови' },
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
  },
  C1: {
    label: { en: 'Advanced', mk: 'Напредно' },
    description: { en: 'Literary texts, nuanced expression', mk: 'Литературни текстови' },
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/30',
  },
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

/**
 * DifficultyBadge - CEFR level indicator for Reader content
 * 
 * Displays the difficulty level (A1-C1) with appropriate color
 * coding and optional label.
 */
export function DifficultyBadge({
  level,
  showLabel = true,
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold inline-flex items-center gap-1.5",
        config.color,
        config.bgColor,
        config.borderColor,
        SIZE_CLASSES[size],
        className
      )}
    >
      <Sparkles className={cn(
        size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
      )} />
      <span>{level}</span>
      {showLabel && (
        <span className="opacity-80">{config.label.en}</span>
      )}
    </Badge>
  );
}

/**
 * Get difficulty config for a level
 */
export function getDifficultyConfig(level: CEFRLevel) {
  return LEVEL_CONFIG[level];
}

/**
 * Estimate difficulty level based on text analysis
 * 
 * This is a simple heuristic based on:
 * - Average word length
 * - Sentence complexity
 * - Vocabulary frequency
 */
export function estimateDifficulty(text: string): CEFRLevel {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const sentenceCount = (text.match(/[.!?]/g) || []).length;
  const avgWordsPerSentence = sentenceCount > 0 ? words.length / sentenceCount : words.length;

  // Simple heuristic scoring
  let score = 0;
  
  // Word length factor
  if (avgWordLength < 4) score += 1;
  else if (avgWordLength < 5) score += 2;
  else if (avgWordLength < 6) score += 3;
  else if (avgWordLength < 7) score += 4;
  else score += 5;

  // Sentence length factor
  if (avgWordsPerSentence < 6) score += 1;
  else if (avgWordsPerSentence < 10) score += 2;
  else if (avgWordsPerSentence < 15) score += 3;
  else if (avgWordsPerSentence < 20) score += 4;
  else score += 5;

  // Total word count factor
  if (words.length < 50) score += 0;
  else if (words.length < 100) score += 1;
  else if (words.length < 200) score += 2;
  else score += 3;

  // Map score to CEFR level
  if (score <= 4) return 'A1';
  if (score <= 6) return 'A2';
  if (score <= 8) return 'B1';
  if (score <= 10) return 'B2';
  return 'C1';
}
