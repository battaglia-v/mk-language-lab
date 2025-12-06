'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronDown, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { CustomDeckSummary } from '@/lib/custom-decks';

type CustomDecksDropdownProps = {
  decks: CustomDeckSummary[];
  activeCustomDeckId: string | null;
  onSelectDeck: (deckId: string) => void;
  disabled?: boolean;
};

export function CustomDecksDropdown({
  decks,
  activeCustomDeckId,
  onSelectDeck,
  disabled = false,
}: CustomDecksDropdownProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const isActive = activeCustomDeckId !== null;
  const activeDeck = decks.find((d) => d.id === activeCustomDeckId);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'group flex min-h-[48px] min-w-0 items-center justify-between gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all sm:px-5 sm:gap-3 sm:text-sm',
            isActive
              ? 'border-primary bg-primary/15 text-white shadow-md'
              : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-white hover:bg-primary/5',
            disabled && 'opacity-40 cursor-not-allowed hover:border-border/60 hover:text-muted-foreground hover:bg-transparent',
          )}
        >
          <span className="flex items-center gap-2 truncate min-w-0">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {activeDeck ? activeDeck.name : 'My Decks'}
            </span>
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
              isActive ? 'bg-primary/30 text-primary-foreground' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/20'
            )}>
              {activeDeck ? activeDeck.cardCount : decks.length}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
        {decks.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No custom decks yet</p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/${locale}/practice/decks`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deck
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Select a deck ({decks.length})
              </p>
            </div>
            {decks.map((deck) => (
              <DropdownMenuItem
                key={deck.id}
                onClick={() => {
                  onSelectDeck(deck.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between gap-2 cursor-pointer',
                  activeCustomDeckId === deck.id && 'bg-primary/10 text-primary'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{deck.name}</p>
                  {deck.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {deck.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/${locale}/practice/decks`}
                className="flex items-center gap-2 text-primary cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <Plus className="h-4 w-4" />
                Manage Custom Decks
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
