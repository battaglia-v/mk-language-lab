import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createStarterPath } from "@/lib/learn/starter-path";
import { createA2Path } from "@/lib/learn/a2-path";
import { create30DayChallengePath } from "@/lib/learn/challenge-30day-path";
import { createTopicPacksPath } from "@/lib/learn/topic-packs-path";
import { LessonPath } from "@/components/learn/LessonPath";
import type { LessonPath as LessonPathType } from "@/lib/learn/lesson-path-types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PathPageProps = {
  params: Promise<{ locale: string; pathId: string }>;
};

const pathConfigs: Record<string, {
  title: string;
  description: string;
  createPath: (completedIds?: string[]) => LessonPathType;
}> = {
  a1: {
    title: "A1 Foundations",
    description: "Master the basics of Macedonian",
    createPath: createStarterPath,
  },
  a2: {
    title: "A2 Momentum",
    description: "Build on basics with tenses and travel",
    createPath: createA2Path,
  },
  "30day": {
    title: "30-Day Reading Challenge",
    description: "Daily reading passages with vocabulary and grammar",
    createPath: create30DayChallengePath,
  },
  topics: {
    title: "Topic Packs",
    description: "Focused vocabulary by theme - pick any topic",
    createPath: createTopicPacksPath,
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
        // Generate completed node IDs based on path type
        const totalLessons = progress.totalLessons;

        if (pathId === 'a1') {
          // A1 path uses node-1, node-2, etc.
          const completedCount = Math.min(totalLessons, 14);
          completedNodeIds = Array.from({ length: completedCount }, (_, i) => `node-${i + 1}`);
        } else if (pathId === '30day') {
          // 30-day path uses 30day-1, 30day-2, etc.
          const completedCount = Math.min(totalLessons, 30);
          completedNodeIds = Array.from({ length: completedCount }, (_, i) => `30day-${i + 1}`);
        } else if (pathId === 'topics') {
          // Topics path - all unlocked by design
          completedNodeIds = [];
        }
        // A2 path uses adv-1, adv-2, etc. (future)
      }
    } catch (error) {
      console.error("[learn/paths] Failed to load progress:", error);
    }
  }

  const path = config.createPath(completedNodeIds);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 sm:pb-6">
      <div className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Link
              href={`/${locale}/learn/paths`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              All Paths
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {config.title}
            </h1>
            <p className="text-base text-muted-foreground">
              {config.description}
            </p>
            {/* Progress */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{path.completedCount} / {path.totalCount} completed</span>
              <span>•</span>
              <span>{Math.round((path.completedCount / path.totalCount) * 100)}%</span>
            </div>
          </div>

          {/* Lesson Path */}
          <LessonPath path={path} locale={locale} />
        </div>
      </div>
    </div>
  );
}
