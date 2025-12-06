'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Trash2, Edit, Archive, ArchiveRestore, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CustomDeckSummary } from '@/lib/custom-decks';

type DeckCardProps = {
  deck: CustomDeckSummary;
  onDelete: (deck: CustomDeckSummary) => void;
  onArchive?: (deckId: string, isArchived: boolean) => void;
};

export function DeckCard({ deck, onDelete, onArchive }: DeckCardProps) {
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const lastUpdated = new Date(deck.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleArchive = () => {
    onArchive?.(deck.id, !deck.isArchived);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(deck);
    setIsMenuOpen(false);
  };

  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card/80 transition-all hover:border-border hover:shadow-md">
      <div className="flex flex-col p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/${locale}/practice/decks/${deck.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {deck.name}
              </h3>
            </Link>
            {deck.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {deck.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0 text-foreground/70 hover:text-foreground hover:bg-accent/10 border border-border/40 hover:border-border/60"
                aria-label="Deck options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/practice/decks/${deck.id}`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit deck
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/${locale}/practice?practiceFixture=custom-deck-${deck.id}`}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Practice now
                </Link>
              </DropdownMenuItem>
              {onArchive && (
                <DropdownMenuItem onClick={handleArchive} className="flex items-center gap-2">
                  {deck.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{deck.cardCount}</span>
            <span>{deck.cardCount === 1 ? 'card' : 'cards'}</span>
          </div>

          {deck.category && (
            <Badge variant="secondary" className="text-xs">
              {deck.category}
            </Badge>
          )}

          <span className="ml-auto text-xs">
            Updated {lastUpdated}
          </span>
        </div>

        {deck.isArchived && (
          <Badge variant="outline" className="mt-3 w-fit">
            <Archive className="mr-1 h-3 w-3" />
            Archived
          </Badge>
        )}
      </div>
    </Card>
  );
}
