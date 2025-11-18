'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Sparkles, Shuffle, Zap, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { readTranslatorHistory } from '@/lib/translator-history';

const curatedDeck = [
  { id: 'c1', source: 'Како си?', target: 'How are you?' },
  { id: 'c2', source: 'Од каде си?', target: 'Where are you from?' },
  { id: 'c3', source: 'Благодарам многу.', target: 'Thank you very much.' },
  { id: 'c4', source: 'Сакам кафе.', target: 'I would like coffee.' },
  { id: 'c5', source: 'Колку чини ова?', target: 'How much is this?' },
];

type Flashcard = { id: string; source: string; target: string; direction: 'mk-en' | 'en-mk' };

type DeckType = 'saved' | 'history' | 'curated';

export default function PracticePage() {
  const t = useTranslations('practiceHub');
  const { phrases } = useSavedPhrases();
  const [historySnapshot, setHistorySnapshot] = useState(() => readTranslatorHistory(32));
  const [deckType, setDeckType] = useState<DeckType>('curated');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setHistorySnapshot(readTranslatorHistory(32));
  }, []);

  useEffect(() => {
    if (phrases.length && deckType === 'curated') {
      setDeckType('saved');
    } else if (!phrases.length && deckType === 'saved') {
      setDeckType(historySnapshot.length ? 'history' : 'curated');
    }
  }, [deckType, historySnapshot.length, phrases.length]);

  const savedDeck = useMemo<Flashcard[]>(
    () =>
      phrases.map((phrase) => ({
        id: phrase.id,
        source: phrase.directionId === 'en-mk' ? phrase.sourceText : phrase.translatedText,
        target: phrase.directionId === 'en-mk' ? phrase.translatedText : phrase.sourceText,
        direction: phrase.directionId,
      })),
    [phrases],
  );

  const historyDeck = useMemo<Flashcard[]>(
    () =>
      historySnapshot.map((entry) => ({
        id: entry.id,
        source: entry.directionId === 'en-mk' ? entry.sourceText : entry.translatedText,
        target: entry.directionId === 'en-mk' ? entry.translatedText : entry.sourceText,
        direction: entry.directionId,
      })),
    [historySnapshot],
  );

  const curatedFlashcards: Flashcard[] = useMemo(
    () => curatedDeck.map((card) => ({ ...card, direction: 'mk-en' })),
    [],
  );

  const deck = deckType === 'saved' ? savedDeck : deckType === 'history' ? historyDeck : curatedFlashcards;
  const total = deck.length || 1;
  const safeIndex = deck.length ? Math.min(index, deck.length - 1) : 0;
  const currentCard = deck[safeIndex];

  useEffect(() => {
    if (safeIndex !== index) {
      setIndex(safeIndex);
      setRevealed(false);
    }
  }, [index, safeIndex]);

  const goNext = useCallback(() => {
    if (!deck.length) return;
    setIndex((previous) => (previous + 1) % deck.length);
    setRevealed(false);
  }, [deck.length]);

  const goPrevious = useCallback(() => {
    if (!deck.length) return;
    setIndex((previous) => (previous - 1 + deck.length) % deck.length);
    setRevealed(false);
  }, [deck.length]);

  const toggleReveal = useCallback(() => {
    if (!deck.length) return;
    setRevealed((prev) => !prev);
  }, [deck.length]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        toggleReveal();
      } else if (event.key === 'ArrowRight') {
        goNext();
      } else if (event.key === 'ArrowLeft') {
        goPrevious();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrevious, toggleReveal]);

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            Space · ← →
          </div>
        </div>
      </section>

      <div className="glass-card space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <DeckToggle
            label={t('savedDeck.badge')}
            count={savedDeck.length}
            active={deckType === 'saved'}
            disabled={!savedDeck.length}
            onClick={() => setDeckType('saved')}
          />
          <DeckToggle
            label={t('translation.tabLabel')}
            count={historyDeck.length}
            active={deckType === 'history'}
            disabled={!historyDeck.length}
            onClick={() => setDeckType('history')}
          />
          <DeckToggle
            label={t('cards.translate.title')}
            count={curatedFlashcards.length}
            active={deckType === 'curated'}
            onClick={() => setDeckType('curated')}
          />
        </div>
        {!deck.length ? (
          <Alert className="rounded-2xl border border-border/60 bg-background/70">
            <AlertDescription className="text-sm text-muted-foreground">
              {t('savedDeck.emptyDescription')}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="relative min-h-[260px] rounded-3xl border border-border/60 bg-background/60 p-8">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>{currentCard?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
                <span>
                  {safeIndex + 1} / {total}
                </span>
              </div>
              <div className="mt-8 space-y-4">
                <p className="text-2xl font-semibold text-white">{currentCard?.source}</p>
                <p className={cn('text-lg text-primary transition-opacity', revealed ? 'opacity-100' : 'opacity-0')}>
                  {currentCard?.target}
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6">
                <Button variant="ghost" className="rounded-full" onClick={goPrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Prev
                </Button>
                <Button className="rounded-full px-6" onClick={toggleReveal}>
                  {revealed ? t('drills.cards.vocabulary.title') : t('drills.cards.tasks.title')}
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={goNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('ctaTranslate')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
                <Shuffle className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('openAction')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
                <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                {t('cards.translate.description')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type DeckToggleProps = {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function DeckToggle({ label, count, active, disabled, onClick }: DeckToggleProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      disabled={disabled}
      className={cn(
        'rounded-full border border-border/60 px-4 text-sm',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onClick}
    >
      <span className="font-semibold">{label}</span>
      <span className="ml-2 text-xs text-muted-foreground">{count}</span>
    </Button>
  );
}
