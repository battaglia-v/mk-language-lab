'use client';

import { CardListItem } from './CardListItem';
import type { CustomDeckCard } from '@prisma/client';

type CardListProps = {
  cards: CustomDeckCard[];
  onUpdate: (
    cardId: string,
    data: {
      macedonian?: string;
      english?: string;
      macedonianAlternates?: string[];
      englishAlternates?: string[];
      category?: string;
      notes?: string;
    }
  ) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  updatingCardId?: string | null;
  deletingCardId?: string | null;
};

export function CardList({
  cards,
  onUpdate,
  onDelete,
  updatingCardId,
  deletingCardId,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-border/60 rounded-2xl">
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No cards yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Add your first card above to start building your practice deck.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>
      {cards.map((card) => (
        <CardListItem
          key={card.id}
          card={card}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isUpdating={updatingCardId === card.id}
          isDeleting={deletingCardId === card.id}
        />
      ))}
    </div>
  );
}
