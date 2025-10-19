import type { LucideIcon } from 'lucide-react';
import { Languages, MessageCircle, RefreshCw, BookOpenCheck, Mic } from 'lucide-react';

export const PRACTICE_SECTIONS = ['translation', 'drills', 'speaking'] as const;
export type PracticeSection = (typeof PRACTICE_SECTIONS)[number];

export const PRACTICE_CARD_IDS = ['translate', 'quick-phrases', 'tasks', 'vocabulary', 'tutor', 'pronunciation'] as const;
export type PracticeCardId = (typeof PRACTICE_CARD_IDS)[number];

export type PracticeCard = {
  id: PracticeCardId;
  section: PracticeSection;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  href: string;
};

const baseCards: PracticeCard[] = [
  {
    id: 'translate',
    section: 'translation',
    icon: Languages,
    titleKey: 'translation.cards.translate.title',
    descriptionKey: 'translation.cards.translate.description',
    href: '/translate',
  },
  {
    id: 'quick-phrases',
    section: 'translation',
    icon: MessageCircle,
    titleKey: 'translation.cards.phrases.title',
    descriptionKey: 'translation.cards.phrases.description',
    href: '/learn/phrases',
  },
  {
    id: 'tasks',
    section: 'drills',
    icon: RefreshCw,
    titleKey: 'drills.cards.tasks.title',
    descriptionKey: 'drills.cards.tasks.description',
    href: '/tasks',
  },
  {
    id: 'vocabulary',
    section: 'drills',
    icon: BookOpenCheck,
    titleKey: 'drills.cards.vocabulary.title',
    descriptionKey: 'drills.cards.vocabulary.description',
    href: '/learn/vocabulary',
  },
  {
    id: 'tutor',
    section: 'speaking',
    icon: MessageCircle,
    titleKey: 'speaking.cards.tutor.title',
    descriptionKey: 'speaking.cards.tutor.description',
    href: '/tutor',
  },
  {
    id: 'pronunciation',
    section: 'speaking',
    icon: Mic,
    titleKey: 'speaking.cards.pronunciation.title',
    descriptionKey: 'speaking.cards.pronunciation.description',
    href: '/learn/pronunciation',
  },
];

export const practiceCardsBySection: Record<PracticeSection, PracticeCard[]> = PRACTICE_SECTIONS.reduce(
  (acc, section) => {
    acc[section] = baseCards.filter((card) => card.section === section);
    return acc;
  },
  {
    translation: [] as PracticeCard[],
    drills: [] as PracticeCard[],
    speaking: [] as PracticeCard[],
  }
);

export const practiceCardIndex: Record<PracticeCardId, PracticeCard> = baseCards.reduce(
  (acc, card) => {
    acc[card.id] = card;
    return acc;
  },
  {} as Record<PracticeCardId, PracticeCard>
);

export const practiceCardSectionLookup: Record<PracticeCardId, PracticeSection> = baseCards.reduce(
  (acc, card) => {
    acc[card.id] = card.section;
    return acc;
  },
  {} as Record<PracticeCardId, PracticeSection>
);

export function isPracticeSection(value: string | null): value is PracticeSection {
  return PRACTICE_SECTIONS.includes(value as PracticeSection);
}

export function isPracticeCardId(value: string | null): value is PracticeCardId {
  return PRACTICE_CARD_IDS.includes(value as PracticeCardId);
}
