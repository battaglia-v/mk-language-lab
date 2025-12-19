'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { LessonRunner } from '@/components/lesson/LessonRunner';
import { generateQuizFromSample, getQuizDifficulty } from '@/lib/reader/quiz-generator';
import { getReaderSample } from '@/lib/reader-samples';
import { Button } from '@/components/ui/button';
import type { LessonResults } from '@/lib/lesson-runner/types';

/**
 * Demo Page - LessonRunner with Day 18 Quiz
 *
 * This demonstrates the LessonRunner with a quiz generated from
 * the Day 18 reader sample (The Little Prince).
 *
 * Shows:
 * - Quiz generation from reader sample
 * - Full lesson flow with progress tracking
 * - XP calculation and completion screen
 * - Mobile-first responsive design
 */
export default function LessonRunnerDemoPage() {
  const router = useRouter();
  const [showLesson, setShowLesson] = useState(false);
  const [results, setResults] = useState<LessonResults | null>(null);

  // Generate quiz from day18 sample
  const sample = getReaderSample('day18-maliot-princ');

  if (!sample) {
    return (
      <PageContainer size="md" className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Sample not found</p>
        </div>
      </PageContainer>
    );
  }

  const steps = generateQuizFromSample(sample, {
    maxQuestions: 8,
    includeGrammar: false,
  });

  const handleComplete = (lessonResults: LessonResults) => {
    setResults(lessonResults);
    setShowLesson(false);
  };

  const handleExit = () => {
    setShowLesson(false);
  };

  if (showLesson) {
    return (
      <LessonRunner
        steps={steps}
        onComplete={handleComplete}
        lessonId="demo-day18-quiz"
        lessonTitle={sample.title_en}
        difficulty={getQuizDifficulty(sample.difficulty)}
        onExit={handleExit}
        autoSave={false}
      />
    );
  }

  return (
    <PageContainer size="content" className="flex flex-col gap-6 pb-24 sm:pb-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">LessonRunner Demo</h1>
        <p className="text-base text-muted-foreground">
          This demo shows the LessonRunner in action with a vocabulary quiz
          generated from the Day 18 reader sample.
        </p>
      </div>

      {/* Sample Info Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{sample.title_en}</h2>
          <p className="text-sm text-muted-foreground mt-1">{sample.title_mk}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {sample.difficulty}
          </span>
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {sample.vocabulary.length} vocabulary words
          </span>
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {sample.expressions.length} expressions
          </span>
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {steps.length} quiz questions
          </span>
        </div>

        <Button
          size="lg"
          onClick={() => setShowLesson(true)}
          className="w-full"
        >
          Start Quiz
        </Button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Last Quiz Results</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">XP Earned</p>
              <p className="text-2xl font-bold text-primary">{results.xpEarned}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round((results.correctAnswers / results.totalSteps) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-lg font-medium text-foreground">
                {results.correctAnswers} / {results.totalSteps}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-lg font-medium text-foreground">
                {Math.round(results.totalTime / 1000)}s
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setResults(null)}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Implementation Notes */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-foreground">Implementation Notes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Quiz auto-generated from reader sample vocabulary and expressions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Progress tracked with visual progress bar</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>XP calculated: 10pts/correct + 5 streak bonus + 10 perfect bonus</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Completion screen with confetti animation</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Mobile-first responsive design (full-width on &lt;640px)</span>
          </li>
        </ul>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.back()}
      >
        Back
      </Button>
    </PageContainer>
  );
}
