import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

interface LessonListProps {
  journeyId: string;
  locale: string;
}

export default async function LessonList({ journeyId, locale }: LessonListProps) {
  const session = await auth();

  // Fetch modules and lessons for this journey
  const modules = await prisma.module.findMany({
    where: { journeyId },
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        include: {
          userProgress: session?.user?.id
            ? {
                where: { userId: session.user.id },
              }
            : false,
        },
      },
    },
  });

  await prisma.$disconnect();

  if (modules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No lessons available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((module) => (
        <div key={module.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
              <p className="text-sm text-muted-foreground">
                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {module.lessons.map((lesson, index) => {
              const progress = lesson.userProgress?.[0];
              const isCompleted = progress?.status === 'completed';
              const isInProgress = progress?.status === 'in_progress';

              return (
                <Link
                  key={lesson.id}
                  href={`/${locale}/lesson/${lesson.id}`}
                  className="block group"
                >
                  <div className="p-4 rounded-lg border border-border/40 bg-background/70 hover:border-primary/50 hover:bg-background transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{index + 1}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h4>
                            {isInProgress && !isCompleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                In Progress
                              </span>
                            )}
                          </div>

                          {lesson.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {lesson.summary}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.estimatedMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Award className="h-3 w-3" />
                              <span className="capitalize">{lesson.difficultyLevel}</span>
                            </div>
                          </div>

                          {progress && progress.progress > 0 && progress.progress < 100 && (
                            <div className="mt-2">
                              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${progress.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
