'use client';

import { useState } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VocabularyItem {
  id: string;
  macedonianText: string;
  englishText: string;
  pronunciation: string | null;
  exampleSentenceMk: string | null;
  exampleSentenceEn: string | null;
  audioUrl: string | null;
}

interface VocabularySectionProps {
  items: VocabularyItem[];
}

export default function VocabularySection({ items }: VocabularySectionProps) {
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleCard = (id: string) => {
    if (showAll) return; // Don't toggle individual cards when showing all
    const newSet = new Set(revealedCards);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedCards(newSet);
  };

  const resetAll = () => {
    setRevealedCards(new Set());
    setShowAll(false);
  };

  const isRevealed = (id: string) => showAll || revealedCards.has(id);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <p className="text-sm text-muted-foreground">
          Tap cards to reveal translations
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={showAll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Hide All</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Show All</span>
              </>
            )}
          </Button>
          {(revealedCards.size > 0 || showAll) && (
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const revealed = isRevealed(item.id);

          return (
            <Card
              key={item.id}
              onClick={() => toggleCard(item.id)}
              className={cn(
                'p-4 cursor-pointer transition-all duration-200 select-none',
                'hover:shadow-md hover:scale-[1.02]',
                revealed
                  ? 'bg-card border-primary/30'
                  : 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'
              )}
            >
              <div className="space-y-3">
                {/* Macedonian word - always visible */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-bold text-primary">
                    {item.macedonianText}
                  </span>
                  {item.pronunciation && (
                    <span className="text-sm text-muted-foreground italic">
                      /{item.pronunciation}/
                    </span>
                  )}
                </div>

                {/* English translation - revealed on tap */}
                <div
                  className={cn(
                    'transition-all duration-300 overflow-hidden',
                    revealed ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'
                  )}
                >
                  <p className="text-lg font-medium">{item.englishText}</p>

                  {/* Example sentence - shown after reveal */}
                  {item.exampleSentenceMk && item.exampleSentenceEn && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm text-foreground">
                        {item.exampleSentenceMk}
                      </p>
                      <p className="text-sm text-muted-foreground italic mt-1">
                        {item.exampleSentenceEn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reveal hint - shown when hidden */}
                {!revealed && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Tap to reveal
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
