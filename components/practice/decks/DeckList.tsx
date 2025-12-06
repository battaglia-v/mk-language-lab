'use client';

import { DeckCard } from './DeckCard';
import type { CustomDeckSummary } from '@/lib/custom-decks';

type DeckListProps = {
  decks: CustomDeckSummary[];
  onDelete: (deck: CustomDeckSummary) => void;
  onArchive?: (deckId: string, isArchived: boolean) => void;
  emptyMessage?: string;
};

export function DeckList({ decks, onDelete, onArchive, emptyMessage }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {emptyMessage || 'No decks yet'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Create your first custom deck to start building your personalized practice vocabulary.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
