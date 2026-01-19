'use client';

/**
 * CultureTipCard - Displays Macedonian cultural tips in lessons
 * 
 * Shows practical, concise cultural insights that help learners
 * understand real-world usage and cultural context.
 * 
 * Features:
 * - Emoji flag visual identifier
 * - Concise, A1/A2 friendly language
 * - Optional related vocabulary
 * - Works on both Android and PWA
 */

import { cn } from '@/lib/utils';

export interface CultureTipProps {
  /** The cultural tip content (1-2 sentences, beginner-friendly) */
  tip: string;
  /** Optional Macedonian version of the tip */
  tipMk?: string;
  /** Optional category (e.g., "Greetings", "Food", "Social") */
  category?: string;
  /** Optional related vocabulary words */
  relatedWords?: Array<{
    mk: string;
    en: string;
  }>;
  /** Additional class name */
  className?: string;
}

/**
 * CultureTipCard - Inline cultural tip for lessons
 * 
 * @example
 * <CultureTipCard
 *   tip="When visiting a Macedonian home, it's polite to remove your shoes at the door."
 *   category="Social"
 * />
 */
export function CultureTipCard({
  tip,
  tipMk,
  category,
  relatedWords,
  className,
}: CultureTipProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#D20C24]/30 bg-gradient-to-r from-[#D20C24]/10 to-[#FFE600]/10 p-4',
        className
      )}
      role="complementary"
      aria-label="Culture tip"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" role="img" aria-label="Macedonian flag">🇲🇰</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D20C24] dark:text-[#FF6B6B]">
          Culture Tip
          {category && <span className="text-muted-foreground font-normal"> • {category}</span>}
        </span>
      </div>

      {/* Tip content */}
      <p className="text-sm text-foreground leading-relaxed">
        {tip}
      </p>

      {/* Macedonian version (optional) */}
      {tipMk && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          {tipMk}
        </p>
      )}

      {/* Related vocabulary (optional) */}
      {relatedWords && relatedWords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#D20C24]/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Related words:
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedWords.map((word, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-background/50 px-2.5 py-1 text-xs"
              >
                <span className="font-medium text-foreground">{word.mk}</span>
                <span className="text-muted-foreground">({word.en})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pre-built culture tips for common scenarios
 * These can be referenced by ID in lesson data
 */
export const CULTURE_TIPS: Record<string, CultureTipProps> = {
  'greeting-formal': {
    tip: 'In formal situations, use "Вие" (you-formal) instead of "ти" (you-informal). This shows respect to elders, teachers, and people you just met.',
    category: 'Social',
    relatedWords: [
      { mk: 'Вие', en: 'you (formal)' },
      { mk: 'ти', en: 'you (informal)' },
    ],
  },
  'coffee-invitation': {
    tip: 'When a Macedonian invites you for "кафе" (coffee), it\'s about spending time together, not just the drink. Refusing can seem impolite.',
    category: 'Social',
    relatedWords: [
      { mk: 'кафе', en: 'coffee' },
      { mk: 'ајде', en: 'let\'s go / come on' },
    ],
  },
  'rakija-toast': {
    tip: 'Before drinking rakija, Macedonians say "На здравје!" (to health). Make eye contact when clinking glasses!',
    category: 'Food & Drink',
    relatedWords: [
      { mk: 'На здравје!', en: 'Cheers!' },
      { mk: 'ракија', en: 'rakija (fruit brandy)' },
    ],
  },
  'guest-hospitality': {
    tip: 'Macedonians are famous for hospitality. A guest (гостин) is always offered food and drink. It\'s polite to accept at least a little.',
    category: 'Social',
    relatedWords: [
      { mk: 'гостин', en: 'guest' },
      { mk: 'домаќин', en: 'host' },
      { mk: 'мезе', en: 'appetizers' },
    ],
  },
  'name-day': {
    tip: 'Many Macedonians celebrate their "имендан" (name day) - the feast day of the saint they\'re named after. It\'s as important as a birthday!',
    category: 'Traditions',
    relatedWords: [
      { mk: 'имендан', en: 'name day' },
      { mk: 'Среќен имендан!', en: 'Happy name day!' },
    ],
  },
  'bread-respect': {
    tip: 'Bread (леб) is highly respected in Macedonian culture. Never throw bread away - it\'s considered disrespectful.',
    category: 'Food & Drink',
    relatedWords: [
      { mk: 'леб', en: 'bread' },
      { mk: 'погача', en: 'traditional bread' },
    ],
  },
};

export default CultureTipCard;
