import type { LucideIcon } from 'lucide-react';
import { Languages, MessageCircle, CheckSquare } from 'lucide-react';

// MVP: Only include working features
export const PRACTICE_CARD_IDS = ['translate', 'tasks', 'tutor'] as const;
export type PracticeCardId = (typeof PRACTICE_CARD_IDS)[number];

export type PracticeCard = {
  id: PracticeCardId;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  href: string;
};

export const practiceCards: PracticeCard[] = [
  {
    id: 'translate',
    icon: Languages,
    titleKey: 'cards.translate.title',
    descriptionKey: 'cards.translate.description',
    href: '/translate',
  },
  {
    id: 'tasks',
    icon: CheckSquare,
    titleKey: 'cards.tasks.title',
    descriptionKey: 'cards.tasks.description',
    href: '/tasks',
  },
  {
    id: 'tutor',
    icon: MessageCircle,
    titleKey: 'cards.tutor.title',
    descriptionKey: 'cards.tutor.description',
    href: '/tutor',
  },
];

export const practiceCardIndex: Record<PracticeCardId, PracticeCard> = practiceCards.reduce(
  (acc, card) => {
    acc[card.id] = card;
    return acc;
  },
  {} as Record<PracticeCardId, PracticeCard>
);

export function isPracticeCardId(value: string | null): value is PracticeCardId {
  return PRACTICE_CARD_IDS.includes(value as PracticeCardId);
}
