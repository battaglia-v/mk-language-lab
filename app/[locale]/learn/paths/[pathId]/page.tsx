import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createStarterPath, starterPathNodes } from "@/lib/learn/starter-path";
import { createA2Path, a2PathNodes } from "@/lib/learn/a2-path";
import { getNextNode } from "@/lib/learn/lesson-path-types";
import { LessonPath } from "@/components/learn/LessonPath";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { LessonPath as LessonPathType } from "@/lib/learn/lesson-path-types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PathPageProps = {
  params: Promise<{ locale: string; pathId: string }>;
};

const pathConfigs: Record<string, {
  title: string;
  description: string;
  badge: string;
  difficulty: string;
  badgeClass: string;
  createPath: (completedIds?: string[]) => LessonPathType;
}> = {
  a1: {
    title: "A1 Foundations",
    description: "Alphabet, pronunciation, greetings, and everyday basics.",
    badge: "A1",
    difficulty: "Beginner",
    badgeClass: "bg-emerald-500/15 text-emerald-600",
    createPath: createStarterPath,
  },
  a2: {
    title: "A2 Momentum",
    description: "Daily routines, past tense intro, directions, and short dialogues.",
    badge: "A2",
    difficulty: "Intermediate",
    badgeClass: "bg-sky-500/15 text-sky-600",
    createPath: createA2Path,
  },
};

export default async function PathDetailPage({ params }: PathPageProps) {
  const { locale, pathId } = await params;

  const config = pathConfigs[pathId];
  if (!config) {
    notFound();
  }

  // Load completed node IDs from database
  let completedNodeIds: string[] = [];
  const session = await auth().catch(() => null);

  if (session?.user?.id) {
    try {
      const progress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });

      if (progress?.totalLessons) {
        const totalLessons = progress.totalLessons;

        if (pathId === 'a1') {
          const completedCount = Math.min(totalLessons, starterPathNodes.length);
          completedNodeIds = Array.from({ length: completedCount }, (_, i) => `node-${i + 1}`);
        } else if (pathId === 'a2') {
          const completedCount = Math.min(
            Math.max(0, totalLessons - starterPathNodes.length),
            a2PathNodes.length
          );
          completedNodeIds = Array.from({ length: completedCount }, (_, i) => `a2-${i + 1}`);
        }
      }
    } catch (error) {
      console.error("[learn/paths] Failed to load progress:", error);
    }
  }

  const path = config.createPath(completedNodeIds);
  const nextNode = getNextNode(path);
  const startNode = nextNode ?? path.nodes[0];
  const startHref = startNode?.href
    ? `/${locale}${startNode.href}`
    : `/${locale}/learn/paths/${pathId}`;
  const startLabel = nextNode ? "Start here" : "Review path";
  const startTitle = startNode?.title ?? path.title;
  const startDescription = startNode?.description;
  const progressValue = path.totalCount > 0
    ? Math.round((path.completedCount / path.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/${locale}/learn/paths`}
          data-testid="path-detail-back"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          All Paths
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {config.title}
          </h1>
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
            config.badgeClass
          )}>
            <span className="text-[10px] font-bold text-foreground">{config.badge}</span>
            {config.difficulty}
          </span>
        </div>
        <p className="text-base text-muted-foreground">
          {config.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{path.completedCount} / {path.totalCount} completed</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        <Link
          href={startHref}
          data-testid="path-detail-start-here"
          className={cn(
            "group flex flex-col items-start gap-1 rounded-2xl border border-border/60 bg-card/70 p-4 transition-all",
            "hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {startLabel}
          </span>
          <span className="text-lg font-semibold text-foreground">
            {startTitle}
          </span>
          {startDescription && (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {startDescription}
            </span>
          )}
        </Link>
      </div>

      {/* Lesson Path */}
      <LessonPath path={path} locale={locale} showHeader={false} />
    </div>
  );
}
