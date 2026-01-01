'use client';

import { useSearchParams } from 'next/navigation';
import { PracticeSession } from '@/components/practice/PracticeSession';
import type { PracticeMode, DifficultyFilter } from '@/components/practice/types';

export default function SessionPage() {
  const searchParams = useSearchParams();

  // Deck can be a standard DeckType or a topic deck ID (e.g., household-v1)
  const deckType = searchParams.get('deck') || 'curated';
  const mode = (searchParams.get('mode') || 'multiple-choice') as PracticeMode;
  const difficulty = (searchParams.get('difficulty') || 'all') as DifficultyFilter;
  const customDeckId = searchParams.get('customDeckId') || undefined;

  return (
    <PracticeSession
      deckType={deckType}
      mode={mode}
      difficulty={difficulty}
      customDeckId={customDeckId}
    />
  );
}
