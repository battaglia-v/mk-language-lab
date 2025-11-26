'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Keyboard } from 'lucide-react';
import { PageNavigation, getLearningTabs } from '@/components/navigation/PageNavigation';
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
      <PageNavigation breadcrumbs={[{ label: t('title'), href: '/practice' }]} tabs={getLearningTabs()} />
      <section className="lab-hero">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs text-muted-foreground">
            <Keyboard className="h-4 w-4" aria-hidden="true" /> Space · ← →
          </div>
        </div>
      </section>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-black/30 p-6">
        <div className="flex flex-wrap gap-2">
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
          <Alert className="rounded-2xl border border-border/60 bg-black/40">
            <AlertDescription className="text-sm text-muted-foreground">
              {t('savedDeck.emptyDescription')}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border/60 bg-black/40 p-8">
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
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <Button variant="outline" className="rounded-full" onClick={goPrevious}>
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Prev
                </Button>
                <Button className="rounded-full" onClick={toggleReveal}>
                  {revealed ? t('drills.cards.vocabulary.title') : t('drills.cards.tasks.title')}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={goNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t('translation.description')}</p>
          </div>
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
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
        active
          ? 'border-primary bg-primary/10 text-white'
          : 'border-border/60 text-muted-foreground hover:text-foreground',
        disabled && 'opacity-50',
      )}
    >
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
