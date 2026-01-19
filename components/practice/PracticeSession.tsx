'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Lightbulb, SkipForward, Heart, X } from 'lucide-react';
import {
  savePracticeSession,
  loadPracticeSession,
  clearPracticeSession,
  isSessionStale,
  generateSessionId,
  type PracticeSessionState,
} from '@/lib/session-persistence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePracticeDecks } from './usePracticeDecks';
import { isTopicDeck, getTopicDeck } from '@/lib/topic-decks';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { recordPracticeSession as recordActivitySession } from '@/lib/practice-activity';
import { recordReview } from '@/lib/srs';
import { calculateXP, formatDifficultyLabel, normalizeDifficulty } from './types';
import { XPAnimation } from '@/components/gamification/XPAnimation';
import { GoalCelebration } from '@/components/gamification/GoalCelebration';
import { addLocalXP, getLocalXP, isGoalComplete } from '@/lib/gamification/local-xp';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useAppConfig } from '@/hooks/use-app-config';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { DifficultyIndicator } from '@/components/practice/DifficultyIndicator';
import type { DeckType, PracticeMode, DifficultyFilter, Flashcard } from './types';

// deckType can be a standard DeckType or a topic deck ID (e.g., household-v1)
type Props = { deckType: DeckType | string; mode: PracticeMode; difficulty: DifficultyFilter; customDeckId?: string };

export function PracticeSession({ deckType, mode, difficulty, customDeckId }: Props) {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const router = useRouter();
  const { getDeck, loadCustomDeck, loadLessonReviewDeck, loadLessonVocabById, isLoading: isDecksLoading } = usePracticeDecks();
  const { config } = useAppConfig();
  const { entitlement, isPracticeLimitReached, recordPracticeSession } = useEntitlement();

  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [deckStatus, setDeckStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [goalWasCompleteAtStart, setGoalWasCompleteAtStart] = useState(false);

  // Adaptive difficulty tracking
  const {
    currentDifficulty,
    recordAnswer: recordAdaptiveAnswer,
    rollingAccuracy,
    adjustmentsMade,
    isAdaptive,
  } = useAdaptiveDifficulty({
    startingDifficulty: difficulty === 'all' ? 'medium' : difficulty as 'easy' | 'medium' | 'hard',
    enabled: config.adaptiveDifficultyEnabled !== false, // Default to enabled
    onDifficultyChange: (from, to) => {
      console.log(`[AdaptiveDifficulty] Changed: ${from} → ${to}`);
    },
  });

  // Session persistence state
  const [pendingRestore, setPendingRestore] = useState(false);
  const [savedSession, setSavedSession] = useState<PracticeSessionState | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if goal was already complete when session started
  useEffect(() => {
    setGoalWasCompleteAtStart(isGoalComplete());
  }, []);
  const sessionStart = useRef(Date.now());

  // Load deck with fallback for auth failures
  useEffect(() => {
    let isActive = true;

    const applyDeck = (cards: Flashcard[], status?: 'loading' | 'ready' | 'empty') => {
      if (!isActive) return;
      setDeck(cards);
      if (status) {
        setDeckStatus(status);
        return;
      }
      if (cards.length > 0) {
        setDeckStatus('ready');
      } else if (isDecksLoading) {
        setDeckStatus('loading');
      } else {
        setDeckStatus('empty');
      }
    };

    setDeckStatus('loading');

    if (config.paywallEnabled && !entitlement.isPro && isPracticeLimitReached) {
      router.replace(`/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/practice`)}`);
      return;
    }

    // Check if it's a topic deck first (e.g., household-v1, weather-seasons-v1)
    if (isTopicDeck(deckType)) {
      const topicDeck = getTopicDeck(deckType);
      if (topicDeck && topicDeck.items.length > 0) {
        const resolvedDifficulty = difficulty === 'all'
          ? normalizeDifficulty(topicDeck.meta.level)
          : difficulty;
        const flashcards: Flashcard[] = topicDeck.items.map((item) => ({
          id: item.id,
          source: item.mk,
          target: item.en,
          direction: 'mk-en' as const,
          category: item.category || topicDeck.meta.category,
          difficulty: resolvedDifficulty,
          audioClip: null,
          macedonian: item.mk,
        }));
        // Shuffle the deck for variety
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        applyDeck(shuffled, 'ready');
        return;
      }
    }

    if (customDeckId) {
      loadCustomDeck(customDeckId).then((cards) => {
        if (!isActive) return;
        if (cards.length > 0) {
          applyDeck(cards, 'ready');
          return;
        }

        // Custom deck unavailable (auth failure or not found) - fall back to curated
        const fallback = getDeck('curated', difficulty);
        applyDeck(fallback);
      });
    } else if (deckType === 'lesson-review') {
      // Load all lesson review vocabulary (from all completed lessons)
      loadLessonReviewDeck().then((cards) => {
        if (!isActive) return;
        applyDeck(cards, cards.length > 0 ? 'ready' : 'empty');
      });
    } else if (deckType.startsWith('lesson-')) {
      // Load vocabulary from a specific lesson (e.g., lesson-abc123)
      const lessonId = deckType.replace('lesson-', '');
      loadLessonVocabById(lessonId).then((cards) => {
        if (!isActive) return;
        applyDeck(cards, cards.length > 0 ? 'ready' : 'empty');
      });
    } else {
      // Cast to DeckType for standard decks (unknown types fall back to curated)
      const cards = getDeck(deckType as DeckType, difficulty);
      applyDeck(cards);
    }

    return () => {
      isActive = false;
    };
  }, [
    config.paywallEnabled,
    entitlement.isPro,
    isPracticeLimitReached,
    deckType,
    difficulty,
    customDeckId,
    getDeck,
    loadCustomDeck,
    loadLessonReviewDeck,
    loadLessonVocabById,
    isDecksLoading,
    locale,
    router,
  ]);

  const card = deck[index];
  const cardId = card?.id;
  const total = deck.length || 1;
  const progress = Math.round(((index + 1) / total) * 100);

  // Check favorite status
  useEffect(() => {
    if (card?.id) setIsFav(isFavorite(card.id));
  }, [card?.id]);

  // Check for saved session after deck loads
  useEffect(() => {
    if (deckStatus !== 'ready' || deck.length === 0) return;

    const saved = loadPracticeSession();
    if (!saved) return;

    // Check if saved session matches current deck type and isn't stale
    if (saved.deckType === deckType && !isSessionStale(24)) {
      setSavedSession(saved);
      setPendingRestore(true);
    } else {
      // Clear stale or mismatched session
      clearPracticeSession();
    }
  }, [deckStatus, deck.length, deckType]);

  // Handle session restore
  const handleRestore = useCallback(() => {
    if (!savedSession) return;

    // Restore session state
    if (savedSession.deckSnapshot.length > 0) {
      setDeck(savedSession.deckSnapshot);
    }
    setIndex(savedSession.currentIndex);
    setReviewedCount(savedSession.reviewedCount);
    setCorrectAnswers(savedSession.correctAnswers);
    setMaxStreak(savedSession.maxStreak);

    // Clear the pending restore
    setPendingRestore(false);
    setSavedSession(null);
  }, [savedSession]);

  // Handle starting fresh (discard saved session)
  const handleStartFresh = useCallback(() => {
    clearPracticeSession();
    setPendingRestore(false);
    setSavedSession(null);
  }, []);

  // Debounced save of session state
  useEffect(() => {
    // Don't save if pending restore (user hasn't chosen yet) or deck not ready
    if (pendingRestore || deckStatus !== 'ready' || deck.length === 0) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      savePracticeSession({
        sessionId,
        deckType,
        customDeckId: customDeckId ?? null,
        difficulty,
        mode,
        deckSnapshot: deck,
        currentIndex: index,
        reviewedCount,
        correctAnswers,
        maxStreak,
        startedAt: new Date(sessionStart.current).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    pendingRestore,
    deckStatus,
    deck,
    sessionId,
    deckType,
    customDeckId,
    difficulty,
    mode,
    index,
    reviewedCount,
    correctAnswers,
    maxStreak,
  ]);

  const resetCard = useCallback(() => {
    setGuess(''); setFeedback(null); setRevealed(false); setHint(null); setSelectedChoice(null);
  }, []);

  useLayoutEffect(() => {
    if (!cardId) return;
    resetCard();
  }, [cardId, resetCard]);

  const endSession = useCallback(() => {
    // Clear saved session when ending (completed or exited)
    clearPracticeSession();

    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    const xp = calculateXP(correctAnswers, maxStreak);
    recordActivitySession(reviewedCount, correctAnswers, duration);
    if (config.paywallEnabled) {
      recordPracticeSession();
    }
    const params = new URLSearchParams({
      reviewed: reviewedCount.toString(), correct: correctAnswers.toString(),
      streak: maxStreak.toString(), duration: duration.toString(), xp: xp.toString(), deck: deckType,
    });
    router.push(`/${locale}/practice/results?${params}`);
  }, [
    config.paywallEnabled,
    correctAnswers,
    maxStreak,
    recordPracticeSession,
    reviewedCount,
    deckType,
    locale,
    router,
  ]);

  const goNext = useCallback(() => {
    if (index + 1 >= deck.length) { endSession(); return; }
    setIndex((i) => i + 1);
    resetCard();
  }, [index, deck.length, endSession, resetCard]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    setReviewedCount((c) => c + 1);

    // Record for adaptive difficulty
    recordAdaptiveAnswer(isCorrect);

    // Record SRS for favorites deck
    if (deckType === 'favorites' && card?.id) {
      recordReview(card.id, isCorrect);
    }

    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
      setStreak((s) => { const n = s + 1; if (n > maxStreak) setMaxStreak(n); return n; });
      // Show XP animation and update local storage
      const earned = 1;
      setXpAmount(earned);
      setShowXP(true);
      const wasGoalComplete = isGoalComplete();
      addLocalXP(earned);
      // Show celebration if goal was just completed
      if (!wasGoalComplete && !goalWasCompleteAtStart && isGoalComplete()) {
        setTimeout(() => setShowGoalCelebration(true), 800);
      }
    } else {
      setStreak(0);
    }
  }, [maxStreak, deckType, card?.id, goalWasCompleteAtStart, recordAdaptiveAnswer]);

  const submitTyping = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !guess.trim()) return;
    handleAnswer(guess.trim().toLowerCase() === card.target.trim().toLowerCase());
  }, [card, guess, handleAnswer]);

  const selectChoice = useCallback((choice: string) => {
    if (!card || feedback) return;
    setSelectedChoice(choice);
    handleAnswer(choice.trim().toLowerCase() === card.target.trim().toLowerCase());
  }, [card, feedback, handleAnswer]);

  // Auto-advance on correct
  useEffect(() => {
    if (feedback === 'correct') {
      const t = setTimeout(goNext, 800);
      return () => clearTimeout(t);
    }
  }, [feedback, goNext]);

  // Generate choices
  const choices = useMemo(() => {
    if (!card || deck.length < 2) return [];
    const others = deck.filter((c) => c.id !== card.id).map((c) => c.target);
    const unique = [...new Set(others)].sort(() => Math.random() - 0.5).slice(0, 3);
    return [card.target, ...unique].sort(() => Math.random() - 0.5);
  }, [card, deck]);

  const showHint = () => {
    if (!card) return;
    const h = card.target.split(/\s+/).map((w) => w.slice(0, 2) + '_'.repeat(Math.max(0, w.length - 2))).join(' ');
    setHint(h);
  };

  const toggleFav = () => {
    if (!card) return;
    const mk = card.macedonian || (card.direction === 'mk-en' ? card.source : card.target);
    const en = card.direction === 'mk-en' ? card.target : card.source;
    setIsFav(toggleFavorite({ id: card.id, macedonian: mk, english: en, category: card.category || undefined }));
  };

  if (deckStatus !== 'ready') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-12 rounded-full p-0"
            onClick={() => router.push(`/${locale}/practice`)}
            data-testid="session-exit"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Progress value={0} className="h-2 opacity-40" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">0/0</span>
        </header>
        <div className="flex-1 px-4 py-6">
          {deckStatus === 'loading' ? (
            <div className="mx-auto max-w-lg space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {deckType === 'lesson-review' ? 'No vocabulary available' : 'No cards ready yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deckType === 'lesson-review'
                    ? 'Complete some lessons first to unlock vocabulary review!'
                    : 'Try a different deck or return to practice to pick another mode.'}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button onClick={() => router.push(`/${locale}/practice`)} data-testid="practice-session-back">
                  Back to Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.replace(`/${locale}/practice/session?deck=curated&difficulty=${difficulty}`)
                  }
                  data-testid="practice-session-try-curated"
                >
                  Try curated deck
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* XP Animation */}
      {showXP && <XPAnimation amount={xpAmount} onComplete={() => setShowXP(false)} />}
      {showGoalCelebration && (
        <GoalCelebration
          xpEarned={getLocalXP().todayXP}
          dailyGoal={getLocalXP().dailyGoal}
          streak={getLocalXP().streak}
          onClose={() => setShowGoalCelebration(false)}
        />
      )}

      {/* Resume Session Prompt */}
      {pendingRestore && savedSession && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('drills.resumeSessionTitle')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('drills.resumeSessionDescription', { reviewed: savedSession.reviewedCount })}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRestore}
                className="w-full rounded-xl"
                data-testid="session-resume"
              >
                {t('drills.resumeSessionResume')}
              </Button>
              <Button
                variant="outline"
                onClick={handleStartFresh}
                className="w-full rounded-xl"
                data-testid="session-start-fresh"
              >
                {t('drills.resumeSessionStartFresh')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 rounded-full p-0"
          onClick={endSession}
          data-testid="session-exit"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progress} className="h-2 transition-all duration-500" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
      </header>

      {/* Card */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{card?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
              {card?.difficulty && <Badge variant="outline">{formatDifficultyLabel(card.difficulty)}</Badge>}
            </div>
            {isAdaptive && (
              <DifficultyIndicator
                difficulty={currentDifficulty}
                accuracy={rollingAccuracy}
                isAdaptive={isAdaptive}
                adjustmentsMade={adjustmentsMade}
                compact
              />
            )}
          </div>

          {card?.category === 'alphabet' && (
            <p className="text-sm text-muted-foreground">
              {t('drills.alphabetPrompt', { default: 'Choose the Latin pronunciation for this Cyrillic letter.' })}
            </p>
          )}

          <p className="text-2xl font-bold text-foreground sm:text-3xl">{card?.source}</p>

          <div className={cn('rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all duration-300', revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
            <p className="text-lg font-medium text-primary">{card?.target}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleFav}
              className={cn('rounded-full', isFav && 'text-pink-400')}
              data-testid="practice-session-favorite-toggle"
            >
              <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
            </Button>
          </div>

          {/* Input Area */}
          {mode === 'typing' ? (
            <form onSubmit={submitTyping} className="space-y-3">
              {hint && !revealed && <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200 font-mono">{hint}</div>}
              <div className="flex gap-2">
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={t('drills.wordInputPlaceholder')}
                  className="flex-1 min-h-[48px] rounded-xl"
                  disabled={!!feedback}
                  data-testid="practice-session-typing-input"
                />
                <Button
                  type="submit"
                  className="min-h-[48px] rounded-xl px-6"
                  disabled={!guess.trim() || !!feedback}
                  data-testid="practice-session-typing-submit"
                >
                  {t('drills.submitWord')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={showHint}
                  disabled={revealed || !!hint}
                  data-testid="practice-session-hint"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {t('drills.hintButton')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goNext}
                  title={t('drills.skipHint', { default: 'Skip this question (no XP earned)' })}
                  data-testid="practice-session-skip"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  {t('drills.skip')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {choices.map((c, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => selectChoice(c)}
                    disabled={!!feedback}
                    data-testid={`practice-session-choice-${i}`}
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                    className={cn(
                      'min-h-[52px] justify-start rounded-xl text-left transition-all duration-200 active:scale-[0.98]',
                      'animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
                      selectedChoice === c && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20 scale-[1.02] animate-bounce-correct',
                      selectedChoice === c && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 animate-shake',
                      feedback && c === card?.target && 'border-emerald-400 bg-emerald-500/15'
                    )}>
                    <span className="mr-2 text-muted-foreground">{['A','B','C','D'][i]}.</span>{c}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goNext}
                title={t('drills.skipHint', { default: 'Skip this question (no XP earned)' })}
                data-testid="practice-session-skip"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                {t('drills.skip')}
              </Button>
            </div>
          )}

          {/* Feedback - with entrance animation */}
          {feedback && (
            <div className={cn(
              'rounded-xl border px-4 py-3 flex items-start gap-2',
              feedback === 'correct'
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50 animate-feedback-correct'
                : 'border-amber-400/60 bg-amber-500/15 text-amber-50 animate-feedback-incorrect'
            )}>
              {feedback === 'correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-400" />}
              <div>
                <p className="font-medium">{feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}</p>
                {feedback === 'incorrect' && <p className="text-xs mt-1">{t('drills.feedbackIncorrect', { answer: card?.target })}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {feedback === 'incorrect' && (
        <footer className="border-t border-border/40 px-4 py-3 safe-bottom">
          <Button className="w-full min-h-[48px] rounded-xl" onClick={goNext} data-testid="practice-session-continue">
            {t('drills.continueLabel', { default: 'Continue' })}
          </Button>
        </footer>
      )}
    </div>
  );
}
