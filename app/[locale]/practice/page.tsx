'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
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
  const navT = useTranslations('nav');
  const locale = useLocale();
  const { phrases } = useSavedPhrases();
  const [historySnapshot, setHistorySnapshot] = useState(() => readTranslatorHistory(32));
  const [deckType, setDeckType] = useState<DeckType>('curated');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

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

  const resetCardState = useCallback(() => {
    setGuess('');
    setFeedback(null);
    setRevealed(false);
  }, []);

  const goNext = useCallback(() => {
    if (!deck.length) return;
    setIndex((previous) => (previous + 1) % deck.length);
    resetCardState();
  }, [deck.length, resetCardState]);

  const goPrevious = useCallback(() => {
    if (!deck.length) return;
    setIndex((previous) => (previous - 1 + deck.length) % deck.length);
    resetCardState();
  }, [deck.length, resetCardState]);

  const toggleReveal = useCallback(() => {
    if (!deck.length) return;
    setRevealed((prev) => !prev);
    setFeedback(null);
  }, [deck.length]);

  const handleSubmitGuess = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!deck.length || !currentCard) return;

      const normalize = (value: string) => value.trim().toLowerCase();
      const expected = normalize(currentCard.target);
      const attempt = normalize(guess);

      if (!attempt) return;

      const isCorrect = attempt === expected;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setRevealed(true);
    },
    [currentCard, deck.length, guess]
  );

  useEffect(() => {
    resetCardState();
  }, [resetCardState, currentCard?.id]);

  useEffect(() => {
    if (feedback !== "correct") return;
    const timer = setTimeout(() => {
      goNext();
    }, 900);
    return () => clearTimeout(timer);
  }, [feedback, goNext]);

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
    <div className="space-y-8 sm:space-y-10">
      <section className="lab-hero rounded-3xl border border-border/60 bg-black/30 p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 text-muted-foreground"
            >
              <Link href={`/${locale}/translate`} aria-label={navT('backToDashboard')}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </Button>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{navT('flashcardShortcuts')}</span>
            </div>
          </div>
          <div className="space-y-1 text-balance">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="hidden max-w-full flex-wrap items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs text-muted-foreground sm:inline-flex">
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            <span className="whitespace-normal">Space · ← →</span>
          </div>
        </div>
      </section>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-black/30 card-padding-lg p-5 sm:p-6 md:p-7">
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
            <div className="rounded-3xl border border-border/60 bg-black/40 card-padding-lg p-5 sm:p-6 md:p-8">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>{currentCard?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
                <span>
                  {safeIndex + 1} / {total}
                </span>
              </div>
            <div className="mt-6 space-y-4">
              <p className="text-2xl font-semibold text-white">{currentCard?.source}</p>
              <p className={cn('text-lg text-primary transition-opacity', revealed ? 'opacity-100' : 'opacity-0')}>
                {currentCard?.target}
              </p>
            </div>

              <form onSubmit={handleSubmitGuess} className="mt-6 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white" htmlFor="practice-guess">
                    {t('drills.wordInputLabel')}
                  </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="practice-guess"
                    value={guess}
                    onChange={(event) => setGuess(event.target.value)}
                    placeholder={t('drills.wordInputPlaceholder')}
                    className="flex-1 rounded-2xl border border-primary/50 bg-white/5 text-white placeholder:text-slate-400"
                  />
                  <Button type="submit" className="rounded-2xl px-6" disabled={!deck.length || !guess.trim()}>
                    {t('drills.submitWord')}
                  </Button>
                </div>
                <p className="text-xs text-slate-300">{t('drills.wordInputHelper')}</p>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={cn(
                    'rounded-2xl border px-4 py-3 text-sm shadow',
                    feedback === 'correct'
                      ? 'border-emerald-300/60 bg-emerald-500/10 text-emerald-100'
                      : 'border-amber-300/60 bg-amber-500/10 text-amber-50'
                  )}
                >
                  {feedback === 'correct'
                    ? t('drills.feedbackCorrect')
                    : t('drills.feedbackIncorrect', { answer: currentCard?.target })}
                </div>
              )}
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Button variant="outline" className="rounded-full" onClick={goPrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Prev
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={toggleReveal}>
                {t('drills.revealAnswer')}
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
        'flex w-full min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition sm:w-auto sm:flex-initial lg:flex-none',
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
