'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ArrowRight, Clock, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageNavigation, getLearningTabs } from '@/components/navigation/PageNavigation';
import VocabularySection from './VocabularySection';
import GrammarSection from './GrammarSection';
import ExerciseSection from './ExerciseSection';

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    summary?: string | null;
    estimatedMinutes?: number;
    difficultyLevel?: string;
    vocabularyItems: unknown[];
    grammarNotes: unknown[];
    exercises: unknown[];
    module: { title: string };
  };
  userProgress: { progress?: number } | null;
  nextLesson: { id: string; title: string } | null;
  userId?: string;
}

export default function LessonContent({
  lesson,
  userProgress,
  nextLesson,
  userId,
}: LessonContentProps) {
  const navT = useTranslations('nav');
  const router = useRouter();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());

  const sections = [
    { id: 'intro', title: 'Introduction', hasContent: !!lesson.summary },
    {
      id: 'vocabulary',
      title: 'Vocabulary',
      hasContent: lesson.vocabularyItems.length > 0,
    },
    { id: 'grammar', title: 'Grammar', hasContent: lesson.grammarNotes.length > 0 },
    { id: 'practice', title: 'Practice', hasContent: lesson.exercises.length > 0 },
  ].filter(section => section.hasContent);

  const progress = sections.length > 0 ? (completedSections.size / sections.length) * 100 : 0;
  const isComplete = progress === 100;

  // Load saved progress
  useEffect(() => {
    if (userProgress?.progress === 100) {
      setCompletedSections(new Set(sections.map(s => s.id)));
    }
  }, [userProgress, sections]);

  const handleCompleteLesson = async () => {
    if (!userId) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 60000); // minutes

    try {
      await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          status: 'completed',
          progress: 100,
          timeSpent,
        }),
      });

      if (nextLesson) {
        router.push(`/lesson/${nextLesson.id}`);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleSectionComplete = async (sectionId: string) => {
    const newSet = new Set(completedSections);
    newSet.add(sectionId);
    setCompletedSections(newSet);

    // Auto-save progress
    if (userId) {
      const newProgress = (newSet.size / sections.length) * 100;
      try {
        await fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            status: newProgress === 100 ? 'completed' : 'in_progress',
            progress: newProgress,
            timeSpent: Math.floor((Date.now() - startTime) / 60000),
          }),
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 lg:pb-8">
      <PageNavigation
        breadcrumbs={[
          { label: navT('dailyLessons'), href: '/daily-lessons' },
          { label: lesson.module.title },
          { label: lesson.title },
        ]}
        tabs={getLearningTabs()}
      />
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{lesson.module.title}</p>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            {lesson.summary && (
              <p className="text-muted-foreground mt-2">{lesson.summary}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{lesson.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{lesson.difficultyLevel}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lesson Sections */}
      {sections.map(section => (
        <Card key={section.id} className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {completedSections.has(section.id) ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            )}
            <h2 className="text-2xl font-semibold">{section.title}</h2>
          </div>

          {/* Section Content */}
          {section.id === 'intro' && (
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-lg leading-relaxed">{lesson.summary}</p>
            </div>
          )}

          {section.id === 'vocabulary' && (
            <VocabularySection items={lesson.vocabularyItems as never[]} />
          )}

          {section.id === 'grammar' && (
            <GrammarSection notes={lesson.grammarNotes as never[]} />
          )}

          {section.id === 'practice' && (
            <ExerciseSection exercises={lesson.exercises as never[]} />
          )}

          {/* Complete Section Button */}
          {!completedSections.has(section.id) && (
            <Button
              onClick={() => handleSectionComplete(section.id)}
              className="mt-6"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Section as Complete
            </Button>
          )}
        </Card>
      ))}

      {/* Completion Card */}
      {isComplete && (
        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Lesson Complete! 🎉</h3>
              <p className="text-muted-foreground">
                Great job! You&apos;ve completed this lesson.
              </p>
            </div>

            {nextLesson ? (
              <Button size="lg" onClick={handleCompleteLesson} className="mt-4">
                Continue to Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => router.push('/')} className="mt-4">
                Return to Home
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
