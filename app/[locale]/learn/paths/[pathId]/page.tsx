import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createStarterPath } from "@/lib/learn/starter-path";
import { createA2Path } from "@/lib/learn/a2-path";
import { create30DayChallengePath } from "@/lib/learn/challenge-30day-path";
import { createTopicPacksPath } from "@/lib/learn/topic-packs-path";
import { LessonPath } from "@/components/learn/LessonPath";
import type { LessonPath as LessonPathType } from "@/lib/learn/lesson-path-types";

export const dynamic = 'force-dynamic';

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

  // TODO: Load completed node IDs from user progress
  const completedNodeIds: string[] = [];
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
