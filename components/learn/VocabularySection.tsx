'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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

// Words to exclude (instructional/meta text from textbook)
const EXCLUDED_WORDS = new Set([
  'вежба', 'лекција', 'тема', 'состави', 'реченици', 'прочитај',
  'напиши', 'одговори', 'пример', 'примери', 'слушај', 'говори',
]);

// Common country names to exclude
const COUNTRY_NAMES = new Set([
  'македонија', 'германија', 'франција', 'италија', 'шпанија',
  'англија', 'русија', 'кина', 'јапонија', 'америка', 'австралија',
  'бразил', 'мексико', 'канада', 'ирска', 'грција', 'турција',
  'србија', 'хрватска', 'бугарија', 'албанија', 'словенија',
]);

// Regex for Macedonian Cyrillic capital letters (А-Я plus Ќ, Ѓ, Ѕ, Љ, Њ, Џ)
const CYRILLIC_CAPITAL_REGEX = /^[\u0400-\u042F\u0403\u0405\u0408-\u040B\u040F]/;

/**
 * Filter vocabulary items to remove:
 * 1. Items where English matches Macedonian (untranslated)
 * 2. Proper nouns (names) - capital letter + bad translation
 * 3. Instructional/meta words from textbook
 * 4. Very short words (1-2 chars)
 * 5. Country names
 */
function filterVocabulary(items: VocabularyItem[]): VocabularyItem[] {
  return items.filter(item => {
    const mk = item.macedonianText?.trim() || '';
    const en = item.englishText?.trim() || '';
    const mkLower = mk.toLowerCase();
    const enLower = en.toLowerCase();

    // Skip empty items
    if (!mk || !en) return false;

    // Skip very short words
    if (mk.length <= 2) return false;

    // Skip if English is same as Macedonian (untranslated)
    if (mkLower === enLower) return false;

    // Skip if English looks like transliteration (similar length, similar characters)
    if (Math.abs(mk.length - en.length) <= 2 && enLower.match(/^[a-z]+$/)) {
      // Check if it's just transliterated (no real translation)
      const mkLatinized = mkLower
        .replace(/[ѓќљњџ]/g, '')
        .replace(/[а-ш]/g, 'x');
      if (mkLatinized.length > 0 && enLower.length <= mk.length + 1) {
        // Likely a proper noun that was transliterated, not translated
        // Check if starts with Cyrillic capital letter
        if (CYRILLIC_CAPITAL_REGEX.test(mk)) {
          return false; // Skip proper nouns
        }
      }
    }

    // Skip excluded instructional words
    if (EXCLUDED_WORDS.has(mkLower)) return false;

    // Skip country names
    if (COUNTRY_NAMES.has(mkLower)) return false;

    // Skip if it looks like a name (capital letter + the English is lowercase same word)
    if (CYRILLIC_CAPITAL_REGEX.test(mk)) {
      // Starts with capital - check if translation is suspicious
      if (enLower === mk.toLowerCase() ||
          en.length <= 3 ||
          !en.includes(' ') && en[0] === en[0].toLowerCase()) {
        // Likely a name - skip unless English is a real translation
        const realTranslationPatterns = /^(the |a |to |is |are |my |your |his |her )/i;
        if (!realTranslationPatterns.test(en)) {
          return false;
        }
      }
    }

    return true;
  });
}

// Maximum vocabulary items to display per lesson
const MAX_VOCAB_DISPLAY = 20;

export default function VocabularySection({ items }: VocabularySectionProps) {
  const t = useTranslations('learn.vocabulary');
  // Filter and limit vocabulary
  const filteredItems = useMemo(() => {
    const filtered = filterVocabulary(items);
    return filtered.slice(0, MAX_VOCAB_DISPLAY);
  }, [items]);
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

  // Show message if no valid vocabulary
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('noItems')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <p className="text-sm text-muted-foreground">
          {t('sectionTitle')} {t('wordCount', { count: filteredItems.length })}
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
        {filteredItems.map((item) => {
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
                    {t('tapToReveal')}
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
