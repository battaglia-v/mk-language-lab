'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Volume2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getClozeSession, refreshItemOptions, type ClozeItem } from '@/data/cloze-seed';
import { XPAnimation } from '@/components/gamification/XPAnimation';
import { addLocalXP } from '@/lib/gamification/local-xp';
import { Skeleton } from '@/components/ui/skeleton';

type Props = { initialCount?: number };

export function ClozeSession({ initialCount = 10 }: Props) {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const router = useRouter();

  const [queue, setQueue] = useState<ClozeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionStart = useRef(Date.now());

  // Initialize session
  useEffect(() => {
    const items = getClozeSession(initialCount).map(refreshItemOptions);
    setQueue(items);
  }, [initialCount]);

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
      setShowXP(true);
      addLocalXP(1);
    } else {
      // Re-insert wrong item 2-3 cards later for in-session repetition
      const reinsertAt = Math.min(index + 2 + Math.floor(Math.random() * 2), queue.length);
      const refreshedItem = refreshItemOptions(card);
      setQueue((q) => [...q.slice(0, reinsertAt), refreshedItem, ...q.slice(reinsertAt)]);
    }
  }, [card, feedback, index, queue.length]);

  // Auto-advance on correct after delay
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
    const moreItems = getClozeSession(5).map(refreshItemOptions);
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
      xp: correctCount.toString(),
      deck: 'cloze',
    });
    router.push(`/${locale}/practice/results?${params}`);
  };

  // Loading skeleton
  if (!queue.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </header>
        <div className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-lg space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
            <X className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">{t('cloze.sessionComplete', { default: 'Session Complete' })}</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center space-y-6 max-w-sm">
            <div className="text-6xl font-bold text-primary">+{correctCount} XP</div>
            <div className="text-xl text-muted-foreground">{accuracy}% {t('results.accuracy', { default: 'accuracy' })}</div>
            <p className="text-sm text-muted-foreground">
              {correctCount} / {totalAnswered} {t('results.correctAnswers', { default: 'correct answers' })}
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={addMore} size="lg" className="min-h-[52px] rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                {t('cloze.addMore', { default: '+5 More' })}
              </Button>
              <Button variant="outline" onClick={endSession} size="lg" className="min-h-[52px] rounded-xl">
                {t('results.finish', { default: 'Finish' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {showXP && <XPAnimation amount={1} onComplete={() => setShowXP(false)} />}

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progress} className="h-2 transition-all duration-500" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
      </header>

      {/* Card */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Masked sentence */}
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground leading-relaxed">{card?.maskedMk}</p>
            <p className="text-sm text-muted-foreground">{card?.en}</p>
          </div>

          {/* Audio button */}
          <Button variant="ghost" size="sm" onClick={speak} className={cn('h-9 rounded-full', isSpeaking && 'text-primary')}>
            <Volume2 className="h-4 w-4 mr-2" />
            {t('drills.listen', { default: 'Listen' })}
          </Button>

          {/* Answer choices */}
          <div className="grid grid-cols-2 gap-2">
            {card?.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => selectChoice(i)}
                disabled={!!feedback}
                className={cn(
                  'min-h-[52px] justify-start rounded-xl text-left transition-all duration-200 active:scale-[0.98]',
                  selectedChoice === i && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20 scale-[1.02]',
                  selectedChoice === i && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 animate-shake',
                  feedback && i === card?.answerIndex && 'border-emerald-400 bg-emerald-500/15'
                )}
              >
                <span className="mr-2 text-muted-foreground">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </Button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={cn(
              'rounded-xl border px-4 py-3 flex items-start gap-2 transition-all duration-300',
              feedback === 'correct' ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50' : 'border-amber-400/60 bg-amber-500/15 text-amber-50'
            )}>
              {feedback === 'correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-400" />}
              <div>
                <p className="font-medium">{feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}</p>
                {feedback === 'incorrect' && (
                  <p className="text-xs mt-1">{t('drills.feedbackIncorrect', { answer: card?.blank })}</p>
                )}
              </div>
            </div>
          )}

          {/* Source attribution */}
          <p className="text-xs text-muted-foreground/60 text-center">{card?.source}</p>
        </div>
      </div>

      {/* Footer - Continue button on incorrect */}
      {feedback === 'incorrect' && (
        <footer className="border-t border-border/40 px-4 py-3 safe-bottom">
          <Button className="w-full min-h-[48px] rounded-xl" onClick={goNext}>
            {t('drills.continueLabel', { default: 'Continue' })}
          </Button>
        </footer>
      )}
    </div>
  );
}
