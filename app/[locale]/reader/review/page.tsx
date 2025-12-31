'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Volume2, Check, ChevronRight, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionShell, SessionPrompt, SessionFeedback, SessionChoice } from '@/components/practice/SessionShell';
import { readFavorites, type FavoriteItem } from '@/lib/favorites';
import { cn } from '@/lib/utils';

type QuestionType = 'recall' | 'multiple-choice' | 'reverse';

type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  promptLang: 'mk' | 'en';
  answer: string;
  choices?: string[];
  word: FavoriteItem;
};

/**
 * ReviewSession - Drills saved words with multiple question types
 *
 * Types:
 * - recall: See Macedonian, recall English (flip card)
 * - multiple-choice: See Macedonian, pick English from 4 options
 * - reverse: See English, pick Macedonian from 4 options
 */
export default function ReviewSessionPage() {
  const locale = useLocale();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Question state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Load favorites on mount
  useEffect(() => {
    const loaded = readFavorites();
    setFavorites(loaded);
  }, []);

  // Generate questions from favorites
  const questions: Question[] = useMemo(() => {
    if (favorites.length === 0) return [];

    // Shuffle favorites
    const shuffled = [...favorites].sort(() => Math.random() - 0.5);

    // Take up to 10 items
    const items = shuffled.slice(0, 10);

    return items.map((item, idx) => {
      // Rotate through question types
      const types: QuestionType[] = ['multiple-choice', 'reverse', 'recall'];
      const type = types[idx % types.length];

      if (type === 'recall') {
        return {
          id: item.id,
          type: 'recall',
          prompt: item.macedonian,
          promptLang: 'mk',
          answer: item.english,
          word: item,
        };
      }

      if (type === 'reverse') {
        // English → Macedonian
        const distractors = favorites
          .filter(f => f.id !== item.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(f => f.macedonian);

        const choices = [item.macedonian, ...distractors].sort(() => Math.random() - 0.5);

        return {
          id: item.id,
          type: 'reverse',
          prompt: item.english,
          promptLang: 'en',
          answer: item.macedonian,
          choices: choices.length >= 2 ? choices : [item.macedonian, '(no other options)'],
          word: item,
        };
      }

      // multiple-choice: Macedonian → English
      const distractors = favorites
        .filter(f => f.id !== item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(f => f.english);

      const choices = [item.english, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: item.id,
        type: 'multiple-choice',
        prompt: item.macedonian,
        promptLang: 'mk',
        answer: item.english,
        choices: choices.length >= 2 ? choices : [item.english, '(no other options)'],
        word: item,
      };
    });
  }, [favorites]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleListen = useCallback((text: string, lang: 'mk' | 'en') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'mk' ? 'sr-RS' : 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  const handleSelectAnswer = useCallback((answer: string) => {
    if (isRevealed) return;
    setSelectedAnswer(answer);
  }, [isRevealed]);

  const handleCheck = useCallback(() => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'recall') {
      // For recall, just reveal - count as correct
      setIsRevealed(true);
      setIsCorrect(true);
      setCorrectCount(c => c + 1);
      setXpEarned(xp => xp + 5);
    } else {
      // Check if answer matches
      const correct = selectedAnswer === currentQuestion.answer;
      setIsRevealed(true);
      setIsCorrect(correct);
      if (correct) {
        setCorrectCount(c => c + 1);
        setXpEarned(xp => xp + 10);
      }
    }
  }, [currentQuestion, selectedAnswer]);

  const handleContinue = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setIsComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setIsCorrect(null);
    }
  }, [currentIndex, questions.length]);

  const handleClose = useCallback(() => {
    router.push(`/${locale}/reader`);
  }, [router, locale]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setXpEarned(0);
    setCorrectCount(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setIsCorrect(null);
    // Re-shuffle by reloading favorites
    setFavorites(readFavorites());
  }, []);

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No saved words yet</h1>
        <p className="text-muted-foreground mb-6">
          Save words while reading to build your review deck.
        </p>
        <Button onClick={() => router.push(`/${locale}/reader`)} className="rounded-xl">
          <ArrowRight className="mr-2 h-4 w-4" />
          Go to Library
        </Button>
      </div>
    );
  }

  // Complete state
  if (isComplete) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
        <p className="text-xl text-primary font-semibold mb-4">+{xpEarned} XP</p>

        <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-2xl font-bold">{correctCount}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={handleRestart} variant="outline" className="rounded-xl h-12">
            <RotateCcw className="mr-2 h-4 w-4" />
            Review Again
          </Button>
          <Button onClick={handleClose} className="rounded-xl h-12">
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!currentQuestion) {
    return (
      <SessionShell progress={0} total={1} current={1} isLoading>
        {null}
      </SessionShell>
    );
  }

  // Render based on question type
  return (
    <SessionShell
      progress={progress}
      total={questions.length}
      current={currentIndex + 1}
      xpEarned={xpEarned}
      onClose={handleClose}
      footer={
        <Button
          className="w-full h-14 rounded-xl text-lg font-semibold"
          onClick={isRevealed ? handleContinue : handleCheck}
          disabled={!isRevealed && currentQuestion.type !== 'recall' && !selectedAnswer}
        >
          {isRevealed ? (
            <>
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : currentQuestion.type === 'recall' ? (
            'Show Answer'
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Check
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Question prompt */}
        <SessionPrompt
          label={
            currentQuestion.type === 'recall'
              ? 'What does this mean?'
              : currentQuestion.type === 'reverse'
              ? 'Translate to Macedonian'
              : 'Translate to English'
          }
          primary={currentQuestion.prompt}
        />

        {/* Listen button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-2"
          onClick={() => handleListen(currentQuestion.prompt, currentQuestion.promptLang)}
        >
          <Volume2 className="h-4 w-4" />
          Listen
        </Button>

        {/* Recall type - show answer when revealed */}
        {currentQuestion.type === 'recall' && (
          <div
            className={cn(
              'rounded-xl border p-6 text-center transition-all duration-300',
              isRevealed
                ? 'border-primary/50 bg-primary/10'
                : 'border-dashed border-white/20 bg-white/5'
            )}
          >
            {isRevealed ? (
              <p className="text-2xl font-bold">{currentQuestion.answer}</p>
            ) : (
              <p className="text-muted-foreground">Tap &quot;Show Answer&quot; to reveal</p>
            )}
          </div>
        )}

        {/* Multiple choice / Reverse - show options */}
        {currentQuestion.type !== 'recall' && currentQuestion.choices && (
          <div className="grid grid-cols-1 gap-2">
            {currentQuestion.choices.map((choice, idx) => {
              const labels = ['A', 'B', 'C', 'D'];
              const isCorrectChoice = choice === currentQuestion.answer;

              return (
                <SessionChoice
                  key={idx}
                  label={labels[idx]}
                  text={choice}
                  selected={selectedAnswer === choice}
                  correct={isRevealed ? isCorrectChoice : null}
                  disabled={isRevealed}
                  onClick={() => handleSelectAnswer(choice)}
                />
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {isRevealed && isCorrect !== null && currentQuestion.type !== 'recall' && (
          <SessionFeedback
            type={isCorrect ? 'correct' : 'incorrect'}
            title={isCorrect ? 'Correct!' : 'Not quite'}
            message={!isCorrect ? `The answer is: ${currentQuestion.answer}` : undefined}
          />
        )}
      </div>
    </SessionShell>
  );
}
