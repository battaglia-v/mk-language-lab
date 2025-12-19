'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { LessonRunner } from '@/components/lesson/LessonRunner';
import { lessonToSteps } from '@/lib/lesson-runner/adapters/exercise-adapter';
import { Button } from '@/components/ui/button';
import type { LessonResults } from '@/lib/lesson-runner/types';
import type { GrammarLesson } from '@/lib/grammar-engine';

/**
 * Demo Page - Grammar Lesson with LessonRunner
 *
 * Demonstrates migrating existing grammar exercises to LessonRunner format.
 * Shows how the adapter converts old exercise types to new step types.
 */
export default function GrammarLessonDemoPage() {
  const router = useRouter();
  const [showLesson, setShowLesson] = useState(false);
  const [results, setResults] = useState<LessonResults | null>(null);

  // Example grammar lesson (simulating data from grammar-engine)
  const grammarLesson: GrammarLesson = {
    id: 'demo-present-tense',
    titleMk: 'Сегашно време',
    titleEn: 'Present Tense',
    descriptionMk: 'Вежби за сегашно време',
    descriptionEn: 'Exercises for present tense',
    difficulty: 'beginner',
    tags: ['verbs', 'present-tense'],
    totalXp: 50,
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        instructionMk: 'Избери го точниот одговор',
        instructionEn: 'Choose the correct answer',
        xp: 10,
        questionMk: 'Јас ___ во Скопје.',
        options: ['живеам', 'живее', 'живеат', 'живееме'],
        correctIndex: 0,
        explanationEn: '"живеам" is the first person singular form of "to live"',
      },
      {
        id: 'ex2',
        type: 'fill-blank',
        instructionMk: 'Пополни го празното место',
        instructionEn: 'Fill in the blank',
        xp: 10,
        sentenceMk: 'Ти ___ македонски?',
        translationEn: 'Do you speak Macedonian?',
        correctAnswers: ['зборуваш', 'говориш'],
        explanationEn: 'Both "зборуваш" and "говориш" mean "you speak"',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        instructionMk: 'Избери го точниот одговор',
        instructionEn: 'Choose the correct answer',
        xp: 10,
        questionMk: 'Тие ___ во паркот.',
        options: ['одам', 'одиш', 'одат', 'оди'],
        correctIndex: 2,
        explanationEn: '"одат" is the third person plural form of "to go"',
      },
      {
        id: 'ex4',
        type: 'fill-blank',
        instructionMk: 'Пополни го празното место',
        instructionEn: 'Fill in the blank',
        xp: 10,
        sentenceMk: 'Ние ___ музика.',
        translationEn: 'We listen to music.',
        correctAnswers: ['слушаме'],
        explanationEn: '"слушаме" is the first person plural form of "to listen"',
      },
    ],
  };

  // Convert exercises to steps using adapter
  const steps = lessonToSteps(grammarLesson, 'en');

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
        lessonId={grammarLesson.id}
        lessonTitle={grammarLesson.titleEn}
        difficulty={grammarLesson.difficulty}
        onExit={handleExit}
        autoSave={false}
      />
    );
  }

  return (
    <PageContainer size="content" className="flex flex-col gap-6 pb-24 sm:pb-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Grammar Lesson Demo</h1>
        <p className="text-base text-muted-foreground">
          This demo shows how existing grammar exercises are converted to the new
          LessonRunner format using the exercise adapter.
        </p>
      </div>

      {/* Lesson Info Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{grammarLesson.titleEn}</h2>
          <p className="text-sm text-muted-foreground mt-1">{grammarLesson.titleMk}</p>
          <p className="text-sm text-muted-foreground mt-2">{grammarLesson.descriptionEn}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {grammarLesson.difficulty}
          </span>
          {grammarLesson.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
              {tag}
            </span>
          ))}
          <span className="rounded-full border border-border/50 bg-muted px-3 py-1 text-xs font-medium">
            {grammarLesson.exercises.length} exercises
          </span>
        </div>

        <Button
          size="lg"
          onClick={() => setShowLesson(true)}
          className="w-full"
        >
          Start Lesson
        </Button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Last Lesson Results</h3>

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

      {/* Adapter Info */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-foreground">Exercise Adapter</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>multiple-choice</strong> exercises → <strong>MULTIPLE_CHOICE</strong> steps</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>fill-blank</strong> exercises → <strong>FILL_BLANK</strong> steps</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Preserves explanations, hints, and XP values</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Enables gradual migration with backward compatibility</span>
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
