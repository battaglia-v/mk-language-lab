import { CLOZE_TOKEN, splitClozeSentence } from './cloze';
import { getExpectedAnswer } from './session';
import type { PracticeDirection, PracticeItem } from './types';

export type PracticeCardKind = 'typing' | 'cloze' | 'listening' | 'multipleChoice';

export type PracticeCardBase = {
  id: string;
  prompt: string;
  answer: string;
  direction: PracticeDirection;
  item: PracticeItem;
  audioUrl?: string | null;
};

export type TypingPracticeCard = PracticeCardBase & {
  type: 'typing';
};

export type ClozePracticeCard = PracticeCardBase & {
  type: 'cloze';
  clozeSegments: string[];
  translation?: string;
};

export type ListeningPracticeCard = PracticeCardBase & {
  type: 'listening';
  transcript?: string;
};

export type MultipleChoicePracticeCard = PracticeCardBase & {
  type: 'multipleChoice';
  choices: string[];
};

export type PracticeCardContent =
  | TypingPracticeCard
  | ClozePracticeCard
  | ListeningPracticeCard
  | MultipleChoicePracticeCard;

type CreateCardOptions = {
  direction: PracticeDirection;
  variant?: PracticeCardKind;
  clozeToken?: string;
  fallbackAudioUrl?: string;
  /** Other items in the deck for generating distractors in multiple choice */
  allItems?: PracticeItem[];
};

const buildCardId = (item: PracticeItem, direction: PracticeDirection) => {
  if (item.id) return item.id;
  const base =
    direction === 'mkToEn'
      ? item.macedonian ?? item.english ?? 'prompt'
      : item.english ?? item.macedonian ?? 'prompt';
  return `${direction}-${base}`.replace(/\s+/g, '-').toLowerCase();
};

function buildTypingCard(base: PracticeCardBase): TypingPracticeCard {
  return {
    ...base,
    type: 'typing',
  };
}

function buildClozeCard(
  base: PracticeCardBase,
  direction: PracticeDirection,
  clozeToken: string
): ClozePracticeCard {
  const context = direction === 'mkToEn' ? base.item.contextEn : base.item.contextMk;
  const clozeParts = splitClozeSentence(context?.sentence ?? '', clozeToken);
  return {
    ...base,
    type: 'cloze',
    clozeSegments: clozeParts.segments,
    translation: context?.translation ?? undefined,
  };
}

export function createPracticeCard(
  item: PracticeItem,
  { variant = 'typing', direction, clozeToken = CLOZE_TOKEN, fallbackAudioUrl, allItems = [] }: CreateCardOptions
): PracticeCardContent {
  const prompt = direction === 'mkToEn' ? item.macedonian ?? '' : item.english ?? '';
  const answer = getExpectedAnswer(item, direction);
  const audioUrl = item.audioClipUrl ?? fallbackAudioUrl ?? null;
  const base: PracticeCardBase = {
    id: buildCardId(item, direction),
    prompt,
    answer,
    direction,
    item,
    audioUrl,
  };

  switch (variant) {
    case 'cloze':
      return buildClozeCard(base, direction, clozeToken);
    case 'listening':
      return {
        ...base,
        type: 'listening',
        transcript: item.contextMk?.translation ?? item.contextEn?.translation ?? undefined,
      };
    case 'multipleChoice': {
      const choiceSet = new Set<string>();
      choiceSet.add(answer);

      // First try item's own alternates
      const alternates =
        direction === 'mkToEn'
          ? item.englishAlternates ?? item.macedonianAlternates ?? []
          : item.macedonianAlternates ?? item.englishAlternates ?? [];
      alternates.forEach((alt) => {
        if (alt) {
          choiceSet.add(alt);
        }
      });

      // If we don't have 4 choices, generate distractors from other items
      if (choiceSet.size < 4 && allItems.length > 0) {
        // Get answers from other items as potential distractors
        const otherItems = allItems.filter((other) => other.id !== item.id);
        const shuffledOthers = shuffleArray(otherItems);

        for (const other of shuffledOthers) {
          if (choiceSet.size >= 4) break;
          const distractor = getExpectedAnswer(other, direction);
          // Only add non-empty, unique distractors
          if (distractor && distractor.trim() && !choiceSet.has(distractor)) {
            choiceSet.add(distractor);
          }
        }
      }

      const choices = shuffleArray(Array.from(choiceSet)).slice(0, 4);
      return {
        ...base,
        type: 'multipleChoice',
        choices: choices.length ? choices : [answer],
      };
    }
    default:
      return buildTypingCard(base);
  }
}

type DeckOptions = {
  direction: PracticeDirection;
  variant?: PracticeCardKind;
  fallbackAudioUrl?: string;
  clozeToken?: string;
};

export function buildPracticeDeck(
  items: PracticeItem[],
  { direction, variant = 'typing', fallbackAudioUrl, clozeToken }: DeckOptions
): PracticeCardContent[] {
  return items.map((item) =>
    createPracticeCard(item, { direction, variant, fallbackAudioUrl, clozeToken, allItems: items })
  );
}

function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
