'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2, XCircle, Volume2, X, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getWordGapsSession, refreshItemOptions, type WordGapItem, type Difficulty, XP_REWARDS } from '@/data/word-gaps-seed';
import { XPAnimation } from '@/components/gamification/XPAnimation';
import { addLocalXP } from '@/lib/gamification/local-xp';
import { Skeleton } from '@/components/ui/skeleton';

type Props = { initialCount?: number; initialDifficulty?: Difficulty };

export function WordGapsSession({ initialCount = 10, initialDifficulty }: Props) {
  const locale = useLocale();
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(initialDifficulty);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(!initialDifficulty);
  const [queue, setQueue] = useState<WordGapItem[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionStart = useRef(Date.now());

  const startSession = (diff: Difficulty) => {
    setDifficulty(diff);
    setShowDifficultyPicker(false);
    const items = getWordGapsSession(initialCount, diff).map(refreshItemOptions);
    setQueue(items);
  };

  const card = queue[index];
  const total = queue.length || 1;
  const progress = Math.round(((index + 1) / total) * 100);

  const resetCard = useCallback(() => {
    setFeedback(null);
    setSelectedChoice(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const goNext = useCallback(() => {
    if (index + 1 >= queue.length) {
      setIsComplete(true);
      return;
    }
    setIndex((i) => i + 1);
    resetCard();
  }, [index, queue.length, resetCard]);

  const selectChoice = useCallback((choiceIndex: number) => {
    if (!card || feedback) return;
    setSelectedChoice(choiceIndex);
    setTotalAnswered((c) => c + 1);

    const isCorrect = choiceIndex === card.answerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setLastXP(card.xpReward);
      setTotalXP((x) => x + card.xpReward);
      setShowXP(true);
      addLocalXP(card.xpReward);
    } else {
      const reinsertAt = Math.min(index + 2 + Math.floor(Math.random() * 2), queue.length);
      const refreshedItem = refreshItemOptions(card);
      setQueue((q) => [...q.slice(0, reinsertAt), refreshedItem, ...q.slice(reinsertAt)]);
    }
  }, [card, feedback, index, queue.length]);

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
    const moreItems = getWordGapsSession(5, difficulty).map(refreshItemOptions);
    setQueue((q) => [...q, ...moreItems]);
    setIsComplete(false);
  };

  const endSession = () => {
    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    const params = new URLSearchParams({
      reviewed: totalAnswered.toString(),
      correct: correctCount.toString(),
      streak: '0',
      duration: duration.toString(),
      xp: totalXP.toString(),
      deck: 'word-gaps',
    });
    router.push(`/${locale}/practice/results?${params}`);
  };

  // Difficulty picker
  if (showDifficultyPicker) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Word Gaps</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Difficulty</h2>
              <p className="text-muted-foreground">Select your challenge level</p>
            </div>
            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  className={cn(
                    'w-full h-16 justify-between rounded-xl text-left',
                    d === 'easy' && 'border-green-500/40 hover:bg-green-500/10',
                    d === 'medium' && 'border-amber-500/40 hover:bg-amber-500/10',
                    d === 'hard' && 'border-red-500/40 hover:bg-red-500/10'
                  )}
                  onClick={() => startSession(d)}
                >
                  <span className="font-semibold capitalize">{d}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    d === 'easy' && 'text-green-500',
                    d === 'medium' && 'text-amber-500',
                    d === 'hard' && 'text-red-500'
                  )}>
                    +{XP_REWARDS[d]} XP
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
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
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Complete
  if (isComplete) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
            <X className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Session Complete</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center space-y-6 max-w-sm">
            <div className="text-6xl font-bold text-primary">+{totalXP} XP</div>
            <div className="text-xl text-muted-foreground">{accuracy}% accuracy</div>
            <p className="text-sm text-muted-foreground">{correctCount} / {totalAnswered} correct</p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={addMore} size="lg" className="min-h-[52px] rounded-xl">
                <Plus className="h-5 w-5 mr-2" />+5 More
              </Button>
              <Button variant="outline" onClick={endSession} size="lg" className="min-h-[52px] rounded-xl">
                Finish
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {showXP && <XPAnimation amount={lastXP} onComplete={() => setShowXP(false)} />}
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1"><Progress value={progress} className="h-2" /></div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          difficulty === 'easy' && 'bg-green-500/20 text-green-500',
          difficulty === 'medium' && 'bg-amber-500/20 text-amber-500',
          difficulty === 'hard' && 'bg-red-500/20 text-red-500'
        )}>
          <Zap className="h-3 w-3 inline mr-0.5" />+{card?.xpReward}
        </span>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="space-y-2">
            <p className="text-2xl font-bold leading-relaxed">{card?.maskedMk}</p>
            <p className="text-sm text-muted-foreground">{card?.en}</p>
          </div>

          <Button variant="ghost" size="sm" onClick={speak} className={cn('h-9 rounded-full', isSpeaking && 'text-primary')}>
            <Volume2 className="h-4 w-4 mr-2" />Listen
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {card?.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => selectChoice(i)}
                disabled={!!feedback}
                className={cn(
                  'min-h-[52px] justify-start rounded-xl text-left active:scale-[0.98]',
                  selectedChoice === i && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
                  selectedChoice === i && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 animate-shake',
                  feedback && i === card?.answerIndex && 'border-emerald-400 bg-emerald-500/15'
                )}
              >
                <span className="mr-2 text-muted-foreground">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </Button>
            ))}
          </div>

          {feedback && (
            <div className={cn(
              'rounded-xl border px-4 py-3 flex items-start gap-2',
              feedback === 'correct' ? 'border-emerald-400/60 bg-emerald-500/15' : 'border-amber-400/60 bg-amber-500/15'
            )}>
              {feedback === 'correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-400" />}
              <div>
                <p className="font-medium">{feedback === 'correct' ? 'Correct!' : 'Not quite'}</p>
                {feedback === 'incorrect' && <p className="text-xs mt-1">Answer: {card?.blank}</p>}
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
