'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2, XCircle, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { XPAnimation } from '@/components/gamification/XPAnimation';
import { addLocalXP } from '@/lib/gamification/local-xp';
import { DifficultyPicker } from './DifficultyPicker';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { WordBankInput } from './WordBankInput';
import { TypedInput, isAnswerCorrect } from './TypedInput';
import { SessionComplete } from './SessionComplete';
import { type Difficulty, type WordSprintItem, SESSION_XP, DIFFICULTY_COLORS } from './types';
import { getWordSprintSession, refreshItemOptions } from '@/content/word-sprint/sentences';

type Props = {
  initialCount?: number;
  initialDifficulty?: Difficulty;
};

export function WordSprintSession({ initialCount = 10, initialDifficulty }: Props) {
  const locale = useLocale();
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(initialDifficulty ?? null);
  const [showPicker, setShowPicker] = useState(!initialDifficulty);
  const [queue, setQueue] = useState<WordSprintItem[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionStart = useRef(Date.now());

  const startSession = (diff: Difficulty) => {
    setDifficulty(diff);
    setShowPicker(false);
    const items = getWordSprintSession(initialCount, diff).map(refreshItemOptions);
    setQueue(items);
    setIndex(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setIsComplete(false);
    sessionStart.current = Date.now();
  };

  const card = queue[index];
  const total = queue.length || 1;
  const progress = Math.round(((index + 1) / total) * 100);

  const resetCard = useCallback(() => {
    setFeedback(null);
    setSelectedAnswer(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const goNext = useCallback(() => {
    if (index + 1 >= queue.length) {
      setIsComplete(true);
      if (difficulty) {
        addLocalXP(SESSION_XP[difficulty]);
        setShowXP(true);
      }
      return;
    }
    setIndex((i) => i + 1);
    resetCard();
  }, [index, queue.length, resetCard, difficulty]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!card || feedback) return;
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
      } else {
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
    startSession(next);
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
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-2 flex-1 rounded-full" />
        </header>
        <div className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-lg space-y-4">
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete && difficulty) {
    return (
      <>
        {showXP && <XPAnimation amount={SESSION_XP[difficulty]} onComplete={() => setShowXP(false)} />}
        <SessionComplete
          difficulty={difficulty}
          correctCount={correctCount}
          totalAnswered={totalAnswered}
          onAddMore={addMore}
          onHarder={goHarder}
          onFinish={endSession}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1"><Progress value={progress} className="h-2" /></div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
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
            <Button variant="ghost" size="sm" onClick={speak} className={cn('h-9 rounded-full', isSpeaking && 'text-primary')}>
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
          <Button className="w-full min-h-[48px] rounded-xl" onClick={goNext}>Continue</Button>
        </footer>
      )}
    </div>
  );
}
