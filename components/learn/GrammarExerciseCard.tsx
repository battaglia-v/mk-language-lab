'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  type GrammarExercise,
  type FillBlankExercise,
  type MultipleChoiceExercise,
  type SentenceBuilderExercise,
  type ErrorCorrectionExercise,
  validateAnswerWithFeedback,
  calculateXP,
  shuffleWords,
} from '@/lib/grammar-engine';
import { getFeedbackMessage, type AnswerAnalysis } from '@/lib/unicode-normalize';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: GrammarExercise;
  locale: 'en' | 'mk';
  onComplete: (result: {
    exerciseId: string;
    correct: boolean;
    attempts: number;
    xpEarned: number;
    skipped: boolean;
  }) => void;
  onSkip: () => void;
  t: {
    checkAnswer: string;
    tryAgain: string;
    skip: string;
    next: string;
    correct: string;
    incorrect: string;
    showHint: string;
    tapToSelect: string;
    arrangeWords: string;
    findError: string;
    fillBlank: string;
  };
  className?: string;
}

/**
 * GrammarExerciseCard - Renders different exercise types
 */
export function GrammarExerciseCard({
  exercise,
  locale,
  onComplete,
  onSkip,
  t,
  className,
}: ExerciseCardProps) {
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackAnalysis, setFeedbackAnalysis] = useState<AnswerAnalysis | undefined>(undefined);
  
  const prefersReducedMotion = useReducedMotion();
  const instruction = locale === 'mk' ? exercise.instructionMk : exercise.instructionEn;
  const hint = locale === 'mk' ? exercise.hintMk : exercise.hintEn;
  const explanation = locale === 'mk' ? exercise.explanationMk : exercise.explanationEn;

  // Reset state when exercise changes
  useEffect(() => {
    setUserAnswer(exercise.type === 'sentence-builder' ? [] : '');
    setAttempts(0);
    setShowHint(false);
    setResult(null);
    setFeedbackAnalysis(undefined);
  }, [exercise.id, exercise.type]);

  const handleCheck = useCallback(() => {
    const { isCorrect, analysis } = validateAnswerWithFeedback(exercise, userAnswer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      setResult('correct');
      setFeedbackAnalysis(undefined);
      triggerHaptic('success');
      const xpEarned = calculateXP(exercise.xp, newAttempts);
      // Delay completion to show feedback
      setTimeout(() => {
        onComplete({
          exerciseId: exercise.id,
          correct: true,
          attempts: newAttempts,
          xpEarned,
          skipped: false,
        });
      }, 1500);
    } else {
      setResult('incorrect');
      setFeedbackAnalysis(analysis);
      triggerHaptic('error');
      // Show hint after first wrong attempt
      if (newAttempts === 1 && hint) {
        setShowHint(true);
      }
      // Reset result after showing feedback
      setTimeout(() => setResult(null), 1500);
    }
  }, [exercise, userAnswer, attempts, hint, onComplete]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    onComplete({
      exerciseId: exercise.id,
      correct: false,
      attempts,
      xpEarned: 0,
      skipped: true,
    });
    onSkip();
  }, [exercise.id, attempts, onComplete, onSkip]);

  // Render exercise-specific content
  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'fill-blank':
        return <FillBlankContent 
          exercise={exercise} 
          userAnswer={userAnswer as string}
          setUserAnswer={setUserAnswer}
          result={result}
          t={t}
        />;
      case 'multiple-choice':
        return <MultipleChoiceContent 
          exercise={exercise}
          userAnswer={userAnswer as string}
          setUserAnswer={setUserAnswer}
          result={result}
          t={t}
        />;
      case 'sentence-builder':
        return <SentenceBuilderContent 
          exercise={exercise}
          userAnswer={userAnswer as string[]}
          setUserAnswer={setUserAnswer}
          result={result}
          t={t}
        />;
      case 'error-correction':
        return <ErrorCorrectionContent 
          exercise={exercise}
          userAnswer={userAnswer as string}
          setUserAnswer={setUserAnswer}
          result={result}
          t={t}
        />;
    }
  };

  const isAnswerProvided = exercise.type === 'sentence-builder' 
    ? (userAnswer as string[]).length > 0
    : (userAnswer as string).trim().length > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Instruction */}
        <p className="text-sm text-muted-foreground font-medium">
          {instruction}
        </p>

        {/* Exercise content */}
        <div className="min-h-[180px]">
          {renderExerciseContent()}
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && hint && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              className="flex items-start gap-2 rounded-lg bg-accent/10 p-3"
            >
              <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-accent">{hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result feedback */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 rounded-lg p-3",
                result === 'correct' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}
            >
              {result === 'correct' ? (
                <>
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{t.correct}</span>
                  {explanation && (
                    <span className="text-sm opacity-80 ml-2">— {explanation}</span>
                  )}
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span className="font-medium">{t.incorrect}</span>
                  <span className="text-sm opacity-80 ml-2">
                    — {feedbackAnalysis?.mistakeType
                      ? getFeedbackMessage(feedbackAnalysis.mistakeType, locale)
                      : t.tryAgain}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
            disabled={result === 'correct'}
          >
            {t.skip}
          </Button>
          <Button
            variant="default"
            onClick={handleCheck}
            disabled={!isAnswerProvided || result === 'correct'}
            className="flex-1"
          >
            {result === 'correct' ? t.next : t.checkAnswer}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Exercise Type Components
// ============================================

interface FillBlankContentProps {
  exercise: FillBlankExercise;
  userAnswer: string;
  setUserAnswer: (answer: string | string[]) => void;
  result: 'correct' | 'incorrect' | null;
  t: ExerciseCardProps['t'];
}

function FillBlankContent({ exercise, userAnswer, setUserAnswer, result }: FillBlankContentProps) {
  const parts = exercise.sentenceMk.split('___');
  
  return (
    <div className="space-y-4">
      {/* Sentence with blank */}
      <div className="text-xl leading-relaxed">
        {parts[0]}
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="..."
          className={cn(
            "inline-block w-32 mx-1 text-center font-bold",
            result === 'correct' && "border-success bg-success/10",
            result === 'incorrect' && "border-destructive bg-destructive/10"
          )}
          disabled={result === 'correct'}
        />
        {parts[1]}
      </div>

      {/* English translation */}
      <p className="text-sm text-muted-foreground italic">
        {exercise.translationEn}
      </p>

      {/* Word bank (if provided) */}
      {exercise.wordBank && exercise.wordBank.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {exercise.wordBank.map((word, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setUserAnswer(word)}
              disabled={result === 'correct'}
              className={cn(
                "min-h-[36px]",
                userAnswer === word && "ring-2 ring-primary"
              )}
            >
              {word}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultipleChoiceContentProps {
  exercise: MultipleChoiceExercise;
  userAnswer: string;
  setUserAnswer: (answer: string | string[]) => void;
  result: 'correct' | 'incorrect' | null;
  t: ExerciseCardProps['t'];
}

function MultipleChoiceContent({ exercise, userAnswer, setUserAnswer, result }: MultipleChoiceContentProps) {
  const selectedIndex = userAnswer ? parseInt(userAnswer, 10) : -1;

  return (
    <div className="space-y-4">
      {/* Question */}
      <p className="text-xl font-medium">{exercise.questionMk}</p>
      {exercise.questionEn && (
        <p className="text-sm text-muted-foreground italic">{exercise.questionEn}</p>
      )}

      {/* Options */}
      <div className="grid gap-2">
        {exercise.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === exercise.correctIndex;
          const showCorrect = result === 'correct' && isCorrect;
          const showIncorrect = result === 'incorrect' && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => setUserAnswer(String(index))}
              disabled={result === 'correct'}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && !result && "border-primary bg-primary/5",
                !isSelected && !result && "border-border",
                showCorrect && "border-success bg-success/10",
                showIncorrect && "border-destructive bg-destructive/10"
              )}
            >
              <span className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
              )}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {showCorrect && <Check className="h-5 w-5 text-success" />}
              {showIncorrect && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SentenceBuilderContentProps {
  exercise: SentenceBuilderExercise;
  userAnswer: string[];
  setUserAnswer: (answer: string | string[]) => void;
  result: 'correct' | 'incorrect' | null;
  t: ExerciseCardProps['t'];
}

function SentenceBuilderContent({ exercise, userAnswer, setUserAnswer, result, t }: SentenceBuilderContentProps) {
  const [shuffledWords] = useState(() => shuffleWords(exercise.words));
  const availableWords = shuffledWords.filter(w => !userAnswer.includes(w));

  const addWord = (word: string) => {
    setUserAnswer([...userAnswer, word]);
  };

  const removeWord = (index: number) => {
    const newAnswer = [...userAnswer];
    newAnswer.splice(index, 1);
    setUserAnswer(newAnswer);
  };

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <p className="text-sm text-muted-foreground">{t.arrangeWords}</p>

      {/* English translation */}
      <p className="text-lg italic text-muted-foreground">
        &ldquo;{exercise.translationEn}&rdquo;
      </p>

      {/* Answer area */}
      <div className={cn(
        "min-h-[60px] p-3 rounded-lg border-2 border-dashed flex flex-wrap gap-2",
        result === 'correct' && "border-success bg-success/5",
        result === 'incorrect' && "border-destructive bg-destructive/5",
        !result && "border-muted-foreground/30"
      )}>
        {userAnswer.length === 0 ? (
          <span className="text-muted-foreground/50 text-sm">{t.tapToSelect}</span>
        ) : (
          userAnswer.map((word, index) => (
            <motion.button
              key={`${word}-${index}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => !result && removeWord(index)}
              disabled={result === 'correct'}
              className={cn(
                "px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium",
                "hover:bg-primary/80 transition-colors",
                result === 'correct' && "cursor-default"
              )}
            >
              {word}
            </motion.button>
          ))
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            onClick={() => addWord(word)}
            disabled={result === 'correct'}
            className={cn(
              "px-3 py-1.5 rounded-md border bg-background font-medium",
              "hover:bg-muted transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ErrorCorrectionContentProps {
  exercise: ErrorCorrectionExercise;
  userAnswer: string;
  setUserAnswer: (answer: string | string[]) => void;
  result: 'correct' | 'incorrect' | null;
  t: ExerciseCardProps['t'];
}

function ErrorCorrectionContent({ exercise, userAnswer, setUserAnswer, result, t }: ErrorCorrectionContentProps) {
  const words = exercise.sentenceWithErrorMk.split(' ');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  // Reset selection when exercise changes
  useEffect(() => {
    setSelectedWordIndex(null);
  }, [exercise.id]);

  const handleWordClick = (index: number) => {
    if (result === 'correct') return;
    setSelectedWordIndex(index);
    // If they selected the error word, prompt for correction
  };

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <p className="text-sm text-muted-foreground">{t.findError}</p>

      {/* Sentence with clickable words */}
      <div className="text-xl leading-relaxed flex flex-wrap gap-1">
        {words.map((word, index) => {
          const isError = index === exercise.errorPosition;
          const isSelected = selectedWordIndex === index;

          return (
            <button
              key={index}
              onClick={() => handleWordClick(index)}
              disabled={result === 'correct'}
              className={cn(
                "px-2 py-1 rounded transition-all",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && !result && "bg-primary/20 ring-2 ring-primary",
                result === 'correct' && isError && "bg-success/20 line-through",
                result === 'incorrect' && isSelected && "bg-destructive/20"
              )}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* English translation */}
      <p className="text-sm text-muted-foreground italic">
        {exercise.translationEn}
      </p>

      {/* Correction input (shown when a word is selected) */}
      {selectedWordIndex === exercise.errorPosition && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
        >
          <span className="text-sm text-muted-foreground">Correct to:</span>
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type correction..."
            className="flex-1 max-w-[200px]"
            disabled={result === 'correct'}
          />
        </motion.div>
      )}

      {/* Help text if wrong word selected */}
      {selectedWordIndex !== null && selectedWordIndex !== exercise.errorPosition && (
        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          That word looks correct. Try another one.
        </p>
      )}
    </div>
  );
}

export type { ExerciseCardProps };
