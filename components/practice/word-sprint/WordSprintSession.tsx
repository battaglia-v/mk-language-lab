'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { CheckCircle2, XCircle, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { XPAnimation } from '@/components/gamification/XPAnimation';
import { addLocalXP } from '@/lib/gamification/local-xp';
import { DifficultyPicker } from './DifficultyPicker';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { WordBankInput } from './WordBankInput';
import { TypedInput, isAnswerCorrect } from './TypedInput';
import { SessionComplete } from './SessionComplete';
import { type Difficulty, type WordSprintItem, type SessionLength, SESSION_XP, BASE_XP_PER_QUESTION, getComboMultiplier, DIFFICULTY_COLORS } from './types';
import { getWordSprintSession, refreshItemOptions } from '@/content/word-sprint/sentences';

type Props = {
  initialCount?: SessionLength;
  initialDifficulty?: Difficulty;
};

export function WordSprintSession({ initialCount = 10, initialDifficulty }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { data: authSession } = useSession();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(initialDifficulty ?? null);
  const [sessionLength, setSessionLength] = useState<SessionLength>(initialCount);
  const [showPicker, setShowPicker] = useState(!initialDifficulty);
  const [queue, setQueue] = useState<WordSprintItem[]>(() => {
    if (!initialDifficulty) return [];
    return getWordSprintSession(initialCount, initialDifficulty).map(refreshItemOptions);
  });
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionStart = useRef(Date.now());

  const startSession = useCallback((diff: Difficulty, length: SessionLength) => {
    setDifficulty(diff);
    setSessionLength(length);
    setShowPicker(false);
    const items = getWordSprintSession(length, diff).map(refreshItemOptions);
    setQueue(items);
    setIndex(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setCurrentCombo(0);
    setBestCombo(0);
    setTotalXP(0);
    setIsComplete(false);
    sessionStart.current = Date.now();
  }, []);

  useEffect(() => {
    if (initialDifficulty) {
      startSession(initialDifficulty, initialCount);
    }
  }, [initialCount, initialDifficulty, startSession]);

  const card = queue[index];
  const cardId = card?.id;
  const total = queue.length || 1;
  const progress = Math.round(((index + 1) / total) * 100);

  const resetCard = useCallback(() => {
    setFeedback(null);
    setSelectedAnswer(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useLayoutEffect(() => {
    if (!cardId) return;
    resetCard();
  }, [cardId, resetCard]);

  const syncXPToServer = useCallback(async (xp: number, diff: Difficulty, correct: number, total: number, bestStreak: number) => {
    if (!authSession?.user) return;
    try {
      await fetch('/api/practice/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, mode: 'word-sprint', difficulty: diff, correct, total, bestStreak }),
      });
    } catch (e) {
      console.error('Failed to sync XP:', e);
    }
  }, [authSession?.user]);

  const goNext = useCallback(() => {
    if (index + 1 >= queue.length) {
      setIsComplete(true);
      if (difficulty) {
        const finalXP = totalXP;
        setEarnedXP(finalXP);
        addLocalXP(finalXP);
        syncXPToServer(finalXP, difficulty, correctCount, totalAnswered, bestCombo);
        setShowXP(true);
      }
      return;
    }
    setIndex((i) => i + 1);
    resetCard();
  }, [index, queue.length, resetCard, difficulty, syncXPToServer, correctCount, totalAnswered, bestCombo, totalXP]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!card || feedback || !difficulty) return;
      setSelectedAnswer(answer);
      setTotalAnswered((c) => c + 1);

      let isCorrect = false;
      if (difficulty === 'hard') {
        isCorrect = isAnswerCorrect(answer, card.missing);
      } else {
        isCorrect = answer === card.missing;
      }

      setFeedback(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect) {
        setCorrectCount((c) => c + 1);

        // Increase combo
        setCurrentCombo((combo) => {
          const newCombo = combo + 1;
          setBestCombo((best) => Math.max(best, newCombo));

          // Calculate XP with combo multiplier
          const baseXP = BASE_XP_PER_QUESTION[difficulty];
          const multiplier = getComboMultiplier(newCombo);
          const xpEarned = baseXP * multiplier;
          setTotalXP((total) => total + xpEarned);

          return newCombo;
        });
      } else {
        // Reset combo on incorrect answer
        setCurrentCombo(0);

        const reinsertAt = Math.min(index + 2 + Math.floor(Math.random() * 2), queue.length);
        const refreshedItem = refreshItemOptions(card);
        setQueue((q) => [...q.slice(0, reinsertAt), refreshedItem, ...q.slice(reinsertAt)]);
      }
    },
    [card, feedback, index, queue.length, difficulty]
  );

  useEffect(() => {
    if (feedback === 'correct') {
      const t = setTimeout(goNext, 800);
      return () => clearTimeout(t);
    }
  }, [feedback, goNext]);

  const speak = () => {
    if (!card || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.mk);
    u.lang = 'sr-RS';
    u.rate = 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const addMore = () => {
    if (!difficulty) return;
    const moreItems = getWordSprintSession(5, difficulty).map(refreshItemOptions);
    setQueue((q) => [...q, ...moreItems]);
    setIsComplete(false);
  };

  const goHarder = () => {
    if (!difficulty) return;
    const next: Difficulty = difficulty === 'easy' ? 'medium' : 'hard';
    startSession(next, sessionLength);
  };

  const playAgain = () => {
    if (!difficulty) return;
    startSession(difficulty, sessionLength);
  };

  const endSession = () => {
    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    const params = new URLSearchParams({
      reviewed: totalAnswered.toString(),
      correct: correctCount.toString(),
      streak: '0',
      duration: duration.toString(),
      xp: difficulty ? SESSION_XP[difficulty].toString() : '0',
      deck: 'word-sprint',
    });
    router.push(`/${locale}/practice/results?${params}`);
  };

  if (showPicker) {
    return <DifficultyPicker onSelect={startSession} title="Word Sprint" />;
  }

  if (!queue.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Button
            variant="ghost"
            size="sm"
            className="h-12 rounded-full px-3 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPicker(true)}
            data-testid="session-exit"
          >
            <X className="h-4 w-4" />
            <span className="text-xs font-semibold">Back</span>
          </Button>
          <Progress value={0} className="h-2 flex-1 opacity-40" />
        </header>
        <div className="flex-1 px-4 py-6">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">No questions loaded yet</p>
              <p className="text-sm text-muted-foreground">
                Try a different difficulty or head back to practice.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button onClick={() => setShowPicker(true)} data-testid="word-sprint-empty-retry">
                Back to picker
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/practice`)}
                data-testid="word-sprint-empty-back"
              >
                Go to Practice
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete && difficulty) {
    return (
      <>
        {showXP && <XPAnimation amount={earnedXP} onComplete={() => setShowXP(false)} />}
        <SessionComplete
          difficulty={difficulty}
          correctCount={correctCount}
          totalAnswered={totalAnswered}
          totalXP={totalXP}
          bestCombo={bestCombo}
          onAddMore={addMore}
          onHarder={goHarder}
          onPlayAgain={playAgain}
          onFinish={endSession}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-12 rounded-full px-3 gap-2 text-muted-foreground hover:text-foreground"
          onClick={endSession}
          data-testid="session-exit"
        >
          <X className="h-4 w-4" />
          <span className="text-xs font-semibold">Exit</span>
        </Button>
        <div className="flex-1"><Progress value={progress} className="h-2" /></div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
        {difficulty && currentCombo > 0 && (
          <span className={cn(
            'text-sm font-bold px-3 py-1.5 rounded-full border-2 transition-all',
            currentCombo >= 10 ? 'bg-purple-500/20 text-purple-400 border-purple-500/60 animate-pulse' :
            currentCombo >= 5 ? 'bg-blue-500/20 text-blue-400 border-blue-500/60' :
            'bg-primary/20 text-primary border-primary/40'
          )}>
            {currentCombo}x
          </span>
        )}
        {difficulty && (
          <span className={cn('text-xs font-bold px-2 py-1 rounded-full', DIFFICULTY_COLORS[difficulty].bg, DIFFICULTY_COLORS[difficulty].text)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-2xl font-bold leading-relaxed">{card?.maskedMk}</p>
            <p className="text-sm text-muted-foreground">{card?.en}</p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={speak}
              className={cn('h-12 rounded-full px-4', isSpeaking && 'text-primary')}
              data-testid="word-sprint-listen"
            >
              <Volume2 className="h-4 w-4 mr-2" />Listen
            </Button>
          </div>

          {difficulty === 'easy' && card && (
            <MultipleChoiceInput options={card.choices} correctAnswer={card.missing} selectedAnswer={selectedAnswer} feedback={feedback} onSelect={handleAnswer} />
          )}
          {difficulty === 'medium' && card && (
            <WordBankInput wordBank={card.wordBank} correctAnswer={card.missing} feedback={feedback} onSubmit={handleAnswer} />
          )}
          {difficulty === 'hard' && card && (
            <TypedInput correctAnswer={card.missing} feedback={feedback} onSubmit={handleAnswer} />
          )}

          {feedback && (
            <div className={cn('rounded-xl border px-4 py-3 flex items-start gap-2', feedback === 'correct' ? 'border-emerald-400/60 bg-emerald-500/15' : 'border-amber-400/60 bg-amber-500/15')}>
              {feedback === 'correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-400" />}
              <div>
                <p className="font-medium">{feedback === 'correct' ? 'Correct!' : 'Not quite'}</p>
                {feedback === 'incorrect' && <p className="text-xs mt-1">Answer: {card?.missing}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {feedback === 'incorrect' && (
        <footer className="border-t border-border/40 px-4 py-3 safe-bottom">
          <Button className="w-full min-h-[52px] rounded-xl" onClick={goNext} data-testid="word-sprint-continue">
            Continue
          </Button>
        </footer>
      )}
    </div>
  );
}
