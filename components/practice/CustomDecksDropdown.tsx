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

  const isActive = activeCustomDeckId !== null;
  const activeDeck = decks.find((d) => d.id === activeCustomDeckId);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'group flex h-auto w-full min-h-[60px] flex-col items-start justify-between gap-1 rounded-xl p-3 text-left',
            isActive && 'border-primary/70 bg-primary/15 text-white ring-1 ring-primary/25',
            disabled && 'opacity-40',
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
              'rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors',
              isActive ? 'bg-primary/30 text-black' : 'bg-muted/60 text-muted-foreground group-hover:bg-primary/15'
            )}>
              {activeDeck ? activeDeck.cardCount : decks.length}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </Button>
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
