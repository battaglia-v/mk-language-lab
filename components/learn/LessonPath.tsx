'use client';

import { LessonPath as LessonPathType, getNextNode } from '@/lib/learn/lesson-path-types';
import { LessonPathNode } from './LessonPathNode';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LessonPathProps {
  path: LessonPathType;
  locale: string;
  className?: string;
}

export function LessonPath({ path, locale, className }: LessonPathProps) {
  const nextNode = getNextNode(path);
  const progress = path.totalCount > 0
    ? Math.round((path.completedCount / path.totalCount) * 100)
    : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex flex-col', className)}>
        {/* Path header */}
        <div className="mb-6 px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{path.title}</h2>
            <span className="text-sm text-muted-foreground">
              {path.completedCount}/{path.totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {path.description && (
            <p className="text-sm text-muted-foreground mt-2">{path.description}</p>
          )}
        </div>

        {/* Vertical path of nodes */}
        <div className="relative flex flex-col items-start gap-4 px-8 pb-16">
          {/* Background path line */}
          <div
            className="absolute left-[4.5rem] top-8 bottom-16 w-1 bg-gradient-to-b from-muted/60 via-muted/30 to-transparent rounded-full"
            aria-hidden="true"
          />

          {path.nodes.map((node, index) => (
            <LessonPathNode
              key={node.id}
              node={node}
              locale={locale}
              index={index}
              isContinueNode={nextNode?.id === node.id}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
