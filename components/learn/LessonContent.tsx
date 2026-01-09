'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  Dumbbell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import VocabularySection from './VocabularySection';
import GrammarSection from './GrammarSection';
import ExerciseSection from './ExerciseSection';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const locale = useLocale();
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState<string>('');
  const [startTime] = useState(Date.now());

  // Build sections list based on available content
  const sections = useMemo(
    () =>
      [
        { id: 'intro', title: 'Introduction', hasContent: !!lesson.summary },
        {
          id: 'vocabulary',
          title: 'Vocabulary',
          hasContent: lesson.vocabularyItems.length > 0,
        },
        { id: 'grammar', title: 'Grammar', hasContent: lesson.grammarNotes.length > 0 },
        { id: 'practice', title: 'Practice', hasContent: lesson.exercises.length > 0 },
      ].filter(section => section.hasContent),
    [lesson]
  );

  const progress = sections.length > 0 ? (completedSections.size / sections.length) * 100 : 0;
  const isComplete = progress === 100;

  // Load saved progress and set initial section
  useEffect(() => {
    if (userProgress?.progress === 100) {
      setCompletedSections(new Set(sections.map(s => s.id)));
    }
    // Open first section by default
    if (sections.length > 0 && !currentSection) {
      setCurrentSection(sections[0].id);
    }
  }, [userProgress, sections, currentSection]);

  const handleCompleteLesson = async () => {
    if (!userId) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 60000);

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
        router.push(`/${locale}/lesson/${nextLesson.id}`);
      } else {
        router.push(`/${locale}/learn`);
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

  const handleContinue = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    const isCurrentCompleted = completedSections.has(currentSection);

    // If current section is not completed, mark it complete
    if (!isCurrentCompleted) {
      handleSectionComplete(currentSection);
    }

    // Move to next section if available
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
    }
  };

  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const isLastSection = currentIndex === sections.length - 1;
  const isCurrentCompleted = completedSections.has(currentSection);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-32 lg:pb-8">
      {/* Compact Header */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{lesson.module.title}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{lesson.title}</h1>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {lesson.estimatedMinutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {lesson.estimatedMinutes} min
              </span>
            )}
            {lesson.difficultyLevel && (
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span className="capitalize">{lesson.difficultyLevel}</span>
              </span>
            )}
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-2 pt-2">
            {sections.map((section, index) => {
              const isCompleted = completedSections.has(section.id);
              const isCurrent = section.id === currentSection;

              return (
                <div key={section.id} className="flex items-center">
                  {/* Step indicator */}
                  <button
                    onClick={() => setCurrentSection(section.id)}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50',
                      isCompleted
                        ? 'bg-green-500 text-white dark:text-black'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    title={section.title}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </button>

                  {/* Connector line */}
                  {index < sections.length - 1 && (
                    <div
                      className={cn(
                        'w-6 sm:w-10 h-0.5 mx-1',
                        completedSections.has(sections[index + 1]?.id) || isCompleted
                          ? 'bg-green-500'
                          : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Accordion Sections */}
      <Accordion
        type="single"
        value={currentSection}
        onValueChange={setCurrentSection}
        className="space-y-4"
      >
        {sections.map(section => {
          const isCompleted = completedSections.has(section.id);

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-lg font-semibold">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-6 pb-6">
                {/* Section Content */}
                {section.id === 'intro' && (
                  <div className="space-y-6">
                    {/* Lesson summary/theme */}
                    {lesson.summary && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xl font-medium text-primary mb-2">
                          {lesson.summary}
                        </p>
                        <p className="text-muted-foreground">
                          This lesson&apos;s Macedonian theme
                        </p>
                      </div>
                    )}

                    {/* What you'll learn */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">What you&apos;ll learn:</h4>
                      <ul className="space-y-2">
                        {lesson.vocabularyItems.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>{Math.min(lesson.vocabularyItems.length, 20)}+ vocabulary words</strong>
                              {' '}related to the lesson theme
                            </span>
                          </li>
                        )}
                        {lesson.grammarNotes.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>{lesson.grammarNotes.length} grammar concept{lesson.grammarNotes.length > 1 ? 's' : ''}</strong>
                              {' '}with examples and explanations
                            </span>
                          </li>
                        )}
                        {lesson.exercises.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>Practice exercises</strong>
                              {' '}to test your understanding
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">How to use this lesson:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Work through each section in order</li>
                        <li>Tap vocabulary cards to reveal translations</li>
                        <li>Read grammar explanations and study the examples</li>
                        <li>Mark each section complete as you finish</li>
                      </ol>
                    </div>
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

                {/* Complete Section Button (inline, for desktop) */}
                {!isCompleted && (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    className="mt-6 hidden lg:inline-flex"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Section as Complete
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Completion Celebration */}
      {isComplete && (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <Sparkles className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                Congratulations!
              </h3>
              <p className="text-muted-foreground text-lg">
                You&apos;ve completed this lesson. Great job!
              </p>
            </div>

            {/* Practice CTA - primary action */}
            {lesson.vocabularyItems.length > 0 && (
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/practice/session?deck=lesson-review&mode=multiple-choice`)}
                className="mt-4 bg-primary"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Practice This Vocabulary
              </Button>
            )}

            {/* Navigation options */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {nextLesson ? (
                <Button variant="outline" size="lg" onClick={handleCompleteLesson}>
                  Next Lesson
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button variant="outline" size="lg" onClick={() => router.push(`/${locale}/learn`)}>
                  Return to Home
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Floating Continue Button (mobile only, hidden when complete) */}
      {!isComplete && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent lg:hidden">
          <Button
            onClick={isLastSection && isCurrentCompleted ? handleCompleteLesson : handleContinue}
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-lg"
          >
            {isLastSection && isCurrentCompleted ? (
              <>
                Complete Lesson
                <CheckCircle className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                <span className="text-primary-foreground/70 mr-2">
                  Section {currentIndex + 1} of {sections.length}
                </span>
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
