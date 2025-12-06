'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { readTranslatorHistory } from '@/lib/translator-history';
import { fetchUserDecks } from '@/lib/custom-decks';
import type { CustomDeckSummary } from '@/lib/custom-decks';

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
  const [customDecks, setCustomDecks] = useState<CustomDeckSummary[]>([]);
  const [deckType, setDeckType] = useState<DeckType>('curated');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setHistorySnapshot(readTranslatorHistory(32));
  }, []);

  useEffect(() => {
    fetchUserDecks({ archived: false })
      .then((decks) => setCustomDecks(decks))
      .catch((error) => {
        console.error('Failed to load custom decks:', error);
        setCustomDecks([]);
      });
  }, []);

  // Allow users to explicitly choose their deck without auto-switching
  useEffect(() => {
    // Only auto-switch away from disabled decks (empty decks)
    if (!phrases.length && deckType === 'saved') {
      setDeckType(historySnapshot.length ? 'history' : 'curated');
    } else if (!historySnapshot.length && deckType === 'history') {
      setDeckType(phrases.length ? 'saved' : 'curated');
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
      setReviewedCount((prev) => prev + 1);

      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
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
      // Don't intercept if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === ' ' && !isInputField) {
        event.preventDefault();
        toggleReveal();
      } else if (event.key === 'ArrowRight' && !isInputField) {
        goNext();
      } else if (event.key === 'ArrowLeft' && !isInputField) {
        goPrevious();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrevious, toggleReveal]);

  const accuracy = reviewedCount > 0 ? Math.round((correctAnswers / reviewedCount) * 100) : 0;

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="lab-hero" data-testid="practice-hero">
        <div className="flex flex-col gap-3 sm:gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
          >
            <Link href={`/${locale}/dashboard`} aria-label={navT('backToDashboard')}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {navT('backToDashboard')}
            </Link>
          </Button>
          <header className="page-header">
            <div className="page-header-content">
              <p className="page-header-badge">{t('badge')}</p>
              <h1 className="page-header-title">{t('title')}</h1>
              <p className="page-header-subtitle">{t('subtitle')}</p>
            </div>
          </header>
        </div>

        {/* Progress Stats */}
        {reviewedCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
            <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary" data-testid="practice-stat">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('drills.reviewedCount', { count: reviewedCount })}</span>
            </div>
            <div className="rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-white" data-testid="practice-stat">
              {t('drills.accuracyLabel')}: <span className="text-primary">{accuracy}%</span>
            </div>
            {streak > 2 && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300" data-testid="practice-stat">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('drills.streakLabel', { count: streak })}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="glass-card space-y-4 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8" data-testid="practice-workspace">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-3" data-testid="practice-panels">
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
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-sm"
          >
            <Link href={`/${locale}/practice/decks`}>
              Manage Custom Decks
            </Link>
          </Button>
        </div>

        {/* Custom Decks Section */}
        {customDecks.length > 0 && (
          <div className="border-t border-border/40 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Your Custom Decks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {customDecks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/${locale}/practice?practiceFixture=custom-deck-${deck.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {deck.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {!deck.length ? (
          <Alert className="rounded-2xl border border-border/60 bg-muted/20">
            <AlertDescription className="text-sm text-muted-foreground">
              {t('savedDeck.emptyDescription')}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-9">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="font-semibold">{currentCard?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
                <span className="rounded-full bg-muted/20 px-2.5 py-1 font-bold">
                  {safeIndex + 1} / {total}
                </span>
              </div>
            <div className="mt-5 space-y-4 sm:mt-7 sm:space-y-5">
              <p className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-3xl">{currentCard?.source}</p>
              <div className={cn(
                'rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all duration-300',
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}>
                <p className="text-base font-medium text-primary sm:text-lg">
                  {currentCard?.target}
                </p>
              </div>
            </div>

              <form onSubmit={handleSubmitGuess} className="mt-4 space-y-3 sm:mt-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white sm:text-sm" htmlFor="practice-guess">
                    {t('drills.wordInputLabel')}
                  </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="practice-guess"
                    value={guess}
                    onChange={(event) => setGuess(event.target.value)}
                    placeholder={t('drills.wordInputPlaceholder')}
                    className="flex-1 min-h-[44px] rounded-2xl border border-primary/50 bg-white/5 text-sm text-white placeholder:text-muted-foreground sm:text-base"
                  />
                  <Button
                    type="submit"
                    className="min-h-[44px] rounded-2xl px-6 font-semibold shadow-lg transition-all hover:scale-105 disabled:hover:scale-100"
                    disabled={!deck.length || !guess.trim()}
                  >
                    {t('drills.submitWord')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('drills.wordInputHelper')}</p>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={cn(
                    'animate-in slide-in-from-top-2 fade-in duration-300 rounded-2xl border px-4 py-3 text-sm shadow-lg',
                    feedback === 'correct'
                      ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50'
                      : 'border-amber-400/60 bg-amber-500/15 text-amber-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {feedback === 'correct' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}
                      </p>
                      {feedback === 'incorrect' && (
                        <p className="mt-1 text-xs opacity-90">
                          {t('drills.feedbackIncorrect', { answer: currentCard?.target })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                className="min-h-[44px] rounded-full font-medium transition-all hover:scale-105"
                onClick={goPrevious}
                disabled={!deck.length}
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Prev</span>
                <span className="sm:hidden">←</span>
              </Button>
              <Button
                variant="secondary"
                className="min-h-[44px] rounded-full font-medium transition-all hover:scale-105"
                onClick={toggleReveal}
                disabled={!deck.length}
              >
                {t('drills.revealAnswer')}
              </Button>
              <Button
                variant="outline"
                className="min-h-[44px] rounded-full font-medium transition-all hover:scale-105"
                onClick={goNext}
                disabled={!deck.length}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">→</span>
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
        'group flex w-full min-h-[48px] min-w-0 flex-1 flex-wrap items-center justify-between gap-3 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all sm:w-auto sm:flex-initial sm:text-sm lg:flex-none',
        active
          ? 'border-primary bg-primary/15 text-white shadow-md'
          : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-white hover:bg-primary/5',
        disabled && 'opacity-40 cursor-not-allowed hover:border-border/60 hover:text-muted-foreground hover:bg-transparent',
      )}
    >
      <span>{label}</span>
      <span className={cn(
        'rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
        active ? 'bg-primary/30 text-primary-foreground' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/20'
      )}>
        {count}
      </span>
    </button>
  );
}
