'use client';

/**
 * RegisterBadge - Visual indicator for formal/informal speech register
 * 
 * Helps learners understand when to use formal vs informal language.
 * Essential for Macedonian where "Вие" vs "ти" matters socially.
 * 
 * Features:
 * - Clear visual distinction (🎩 Formal / 👋 Casual)
 * - Compact for inline use in vocabulary cards
 * - Accessible with ARIA labels
 * - Works on both Android and PWA
 */

import { cn } from '@/lib/utils';

export type SpeechRegister = 'formal' | 'informal' | 'neutral';

export interface RegisterBadgeProps {
  /** The speech register */
  register: SpeechRegister;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show icon only (no text) */
  iconOnly?: boolean;
  /** Additional class name */
  className?: string;
}

const REGISTER_CONFIG: Record<SpeechRegister, {
  icon: string;
  label: string;
  labelMk: string;
  description: string;
  colors: string;
}> = {
  formal: {
    icon: '🎩',
    label: 'Formal',
    labelMk: 'Формално',
    description: 'Use with elders, teachers, officials, or people you just met',
    colors: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
  informal: {
    icon: '👋',
    label: 'Casual',
    labelMk: 'Неформално',
    description: 'Use with friends, family, and peers',
    colors: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  neutral: {
    icon: '💬',
    label: 'Neutral',
    labelMk: 'Неутрално',
    description: 'Appropriate in any context',
    colors: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
};

/**
 * RegisterBadge - Compact badge showing speech formality level
 * 
 * @example
 * <RegisterBadge register="formal" />
 * <RegisterBadge register="informal" size="sm" iconOnly />
 */
export function RegisterBadge({
  register,
  size = 'sm',
  iconOnly = false,
  className,
}: RegisterBadgeProps) {
  const config = REGISTER_CONFIG[register];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        config.colors,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      role="img"
      aria-label={`${config.label} speech register: ${config.description}`}
      title={config.description}
    >
      <span aria-hidden="true">{config.icon}</span>
      {!iconOnly && (
        <span className="font-medium">{config.label}</span>
      )}
    </span>
  );
}

/**
 * RegisterWarning - Inline warning when mixing formal/informal registers
 * 
 * Shows when user might be making a social faux pas
 */
export function RegisterWarning({
  expectedRegister,
  usedRegister,
  className,
}: {
  expectedRegister: SpeechRegister;
  usedRegister: SpeechRegister;
  className?: string;
}) {
  if (expectedRegister === usedRegister || expectedRegister === 'neutral' || usedRegister === 'neutral') {
    return null;
  }

  const message = expectedRegister === 'formal'
    ? 'This context calls for formal language (Вие). Using informal "ти" may seem disrespectful.'
    : 'This is a casual context! You can use informal "ти" with friends and family.';

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm',
        className
      )}
      role="alert"
    >
      <span className="text-amber-500">⚠️</span>
      <div>
        <p className="font-medium text-amber-600 dark:text-amber-400">
          Register mismatch
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Get register from vocabulary item or dialogue context
 */
export function inferRegister(text: string): SpeechRegister {
  const formalIndicators = ['Вие', 'Вас', 'Ваш', 'сте', 'имате', 'можете'];
  const informalIndicators = ['ти', 'тебе', 'твој', 'си', 'имаш', 'можеш'];

  const lowerText = text.toLowerCase();
  const hasFormal = formalIndicators.some(word => text.includes(word) || lowerText.includes(word.toLowerCase()));
  const hasInformal = informalIndicators.some(word => text.includes(word) || lowerText.includes(word.toLowerCase()));

  if (hasFormal && !hasInformal) return 'formal';
  if (hasInformal && !hasFormal) return 'informal';
  return 'neutral';
}

export default RegisterBadge;
