'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Award, BookOpen } from 'lucide-react';

interface ContinueLearningWidgetProps {
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    estimatedMinutes: number;
    difficultyLevel: string;
    module: {
      title: string;
    };
  };
  progress?: {
    progress: number;
    lastViewedAt: Date | null;
  } | null;
  journeyTitle?: string;
}

export default function ContinueLearningWidget({
  lesson,
  progress,
  journeyTitle,
}: ContinueLearningWidgetProps) {
  const progressPercent = progress?.progress || 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {journeyTitle ? `${journeyTitle} · ${lesson.module.title}` : lesson.module.title}
            </p>
            <h3 className="text-2xl font-bold">{lesson.title}</h3>
            {lesson.summary && (
              <p className="text-muted-foreground mt-2 line-clamp-2">{lesson.summary}</p>
            )}
          </div>
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

        {progressPercent > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <Button asChild size="lg" className="w-full">
          <Link href={`/lesson/${lesson.id}`}>
            {progressPercent > 0 ? 'Continue Lesson' : 'Start Lesson'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
