'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LessonShell } from '@/components/shell/LessonShell';
import { ChoiceButton } from '@/components/ui/ChoiceButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { cn } from '@/lib/utils';
import { getFillBlanksSession, generateQuestion, FILL_BLANK_XP, type FillBlankDifficulty } from '@/data/fill-blanks-seed';
import { addLocalXP } from '@/lib/gamification/local-xp';
import { triggerHaptic } from '@/lib/haptics';

type Question = ReturnType<typeof generateQuestion>;

export default function FillBlanksPage() {
  const locale = useLocale();
  const [difficulty, setDifficulty] = useState<FillBlankDifficulty>('medium');
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ correct: 0, xp: 0 });

  const startSession = () => {
    const sentences = getFillBlanksSession(10);
    const qs = sentences.map(s => generateQuestion(s, difficulty));
    setQuestions(qs);
    setCurrentIndex(0);
    setSelected(null);
    setFeedback(null);
    setScore({ correct: 0, xp: 0 });
    setStarted(true);
  };

  const handleSelect = (option: string) => {
    if (feedback) return;
    setSelected(option);
    const isCorrect = option === questions[currentIndex].answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    triggerHaptic(isCorrect ? 'success' : 'warning');
    if (isCorrect) {
      const xpEarned = questions[currentIndex].xp;
      setScore(s => ({ correct: s.correct + 1, xp: s.xp + xpEarned }));
      addLocalXP(xpEarned);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setStarted(false);
    }
  };

  const progress = questions.length ? ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100 : 0;
  const question = questions[currentIndex];
  const isComplete = !started && score.xp > 0;

  // Difficulty Selection Screen
  if (!started && !isComplete) {
    return (
      <div className="flex flex-col min-h-[100dvh] pb-24 sm:pb-6">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50" style={{ paddingTop: 'var(--safe-area-top)' }}>
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href={`/${locale}/practice`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Fill Blanks</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Choose Difficulty</h2>
            <p className="text-muted-foreground">Complete sentences by filling in the missing word</p>
          </div>
          <SegmentedControl
            options={[
              { value: 'easy', label: `Easy (+${FILL_BLANK_XP.easy} XP)` },
              { value: 'medium', label: `Medium (+${FILL_BLANK_XP.medium} XP)` },
              { value: 'hard', label: `Hard (+${FILL_BLANK_XP.hard} XP)` },
            ]}
            value={difficulty}
            onChange={(v) => setDifficulty(v as FillBlankDifficulty)}
          />
          <PrimaryButton onClick={startSession} className="max-w-xs bg-gradient-to-r from-primary to-amber-500 text-slate-950" haptic="medium">
            Start Practice
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isComplete) {
    return (
      <div className="flex flex-col min-h-[100dvh] pb-24 sm:pb-6">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50" style={{ paddingTop: 'var(--safe-area-top)' }}>
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href={`/${locale}/practice`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-xl font-bold">Results</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Session Complete!</h2>
            <p className="text-xl text-muted-foreground">{score.correct}/{questions.length} correct</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">+{score.xp} XP</span>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <PrimaryButton variant="outline" fullWidth={false} className="flex-1" onClick={() => setScore({ correct: 0, xp: 0 })}>
              Change Difficulty
            </PrimaryButton>
            <PrimaryButton fullWidth={false} className="flex-1" onClick={startSession}>
              Play Again
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // Active Session - Uses LessonShell
  return (
    <LessonShell
      progress={progress}
      current={currentIndex + 1}
      total={questions.length}
      xp={score.xp}
      closeHref={`/${locale}/practice`}
      footer={
        feedback && (
          <PrimaryButton
            onClick={handleNext}
            haptic="light"
            variant={feedback === 'correct' ? 'success' : 'default'}
          >
            {currentIndex < questions.length - 1 ? 'Continue' : 'See Results'}
          </PrimaryButton>
        )
      }
    >
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className="max-w-lg mx-auto w-full space-y-6">
          {/* Question */}
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold">{question?.questionText}</p>
            <p className="text-muted-foreground">{question?.translation}</p>
          </div>

          {/* Answer Choices */}
          <div className="grid grid-cols-2 gap-3">
            {question?.options.map((option) => {
              const isAnswer = option === question.answer;
              const isSelected = option === selected;
              return (
                <ChoiceButton
                  key={option}
                  onClick={() => handleSelect(option)}
                  state={feedback ? (isAnswer ? 'correct' : isSelected ? 'incorrect' : 'none') : 'none'}
                  isAnswer={isAnswer}
                  isSelected={isSelected}
                  compact
                >
                  {option}
                </ChoiceButton>
              );
            })}
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={cn(
              'rounded-xl p-4 flex items-center gap-3 animate-feedback-correct',
              feedback === 'correct' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}>
              {feedback === 'correct' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              <span className="font-medium">
                {feedback === 'correct' ? `Correct! +${question.xp} XP` : `The answer was: ${question.answer}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </LessonShell>
  );
}
