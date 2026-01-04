import { getLocale } from "next-intl/server";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { createStarterPath, starterPathNodes } from "@/lib/learn/starter-path";
import { createA2Path, a2PathNodes } from "@/lib/learn/a2-path";
import { getNextNode } from "@/lib/learn/lesson-path-types";

export const dynamic = 'force-dynamic';

interface PathCard {
  id: string;
  level: string;
  difficulty: string;
  title: string;
  description: string;
  units: number;
  icon: React.ReactNode;
  color: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  startHref: string;
  detailHref: string;
}

export default async function LearningPathsPage() {
  const locale = await getLocale();
  const session = await auth().catch(() => null);

  let totalLessons = 0;
  if (session?.user?.id) {
    try {
      const progress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });
      totalLessons = progress?.totalLessons ?? 0;
    } catch (error) {
      console.error("[learn/paths] Failed to load progress:", error);
    }
  }

  const completedA1 = Math.min(totalLessons, starterPathNodes.length);
  const completedA2 = Math.min(
    Math.max(0, totalLessons - starterPathNodes.length),
    a2PathNodes.length
  );

  const completedA1Ids = Array.from({ length: completedA1 }, (_, i) => `node-${i + 1}`);
  const completedA2Ids = Array.from({ length: completedA2 }, (_, i) => `a2-${i + 1}`);

  const starterPath = createStarterPath(completedA1Ids);
  const a2Path = createA2Path(completedA2Ids);

  const starterNext = getNextNode(starterPath) ?? starterPath.nodes[0];
  const a2Next = getNextNode(a2Path) ?? a2Path.nodes[0];

  const learningPaths: PathCard[] = [
    {
      id: "a1",
      level: "A1",
      difficulty: "Beginner",
      title: "Foundations",
      description: "Alphabet, pronunciation, greetings, numbers, and everyday verbs.",
      units: starterPath.totalCount,
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-emerald-500",
      completedCount: starterPath.completedCount,
      totalCount: starterPath.totalCount,
      progress: starterPath.totalCount > 0
        ? Math.round((starterPath.completedCount / starterPath.totalCount) * 100)
        : 0,
      startHref: starterNext?.href ? `/${locale}${starterNext.href}` : `/${locale}/learn/paths/a1`,
      detailHref: `/${locale}/learn/paths/a1`,
    },
    {
      id: "a2",
      level: "A2",
      difficulty: "Intermediate",
      title: "Momentum",
      description: "Daily routines, past tense intro, directions, and short dialogues.",
      units: a2Path.totalCount,
      icon: <Sparkles className="h-6 w-6" />,
      color: "bg-sky-500",
      completedCount: a2Path.completedCount,
      totalCount: a2Path.totalCount,
      progress: a2Path.totalCount > 0
        ? Math.round((a2Path.completedCount / a2Path.totalCount) * 100)
        : 0,
      startHref: a2Next?.href ? `/${locale}${a2Next.href}` : `/${locale}/learn/paths/a2`,
      detailHref: `/${locale}/learn/paths/a2`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href={`/${locale}/learn`}
          data-testid="paths-back-to-learn"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to Learn
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Learning Paths
        </h1>
        <p className="text-base text-muted-foreground">
          Choose where you want to start — you can jump around anytime.
        </p>
      </div>

      {/* Explainer Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">No prerequisites required.</strong> Pick any path that matches your level.
          Lessons are designed to work independently — start wherever feels right for you.
        </p>
      </div>

      {/* Path Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {learningPaths.map((path) => (
          <PathCardComponent key={path.id} path={path} />
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          New to Macedonian? Start with <span className="font-medium text-foreground">A1 Foundations</span>
        </p>
      </div>
    </div>
  );
}

function PathCardComponent({ path }: { path: PathCard }) {
  return (
    <div
      className="relative rounded-xl border bg-card p-4 space-y-4 transition-all hover:shadow-md hover:border-primary/20"
      data-testid={`path-card-${path.id}`}
    >
      {/* Level Badge */}
      <div className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-white text-xs font-semibold",
        path.color
      )}>
        {path.icon}
        <span>{path.level}</span>
        <span className="text-white/70">/</span>
        <span>{path.difficulty}</span>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{path.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {path.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{path.units} lessons</span>
        <Link
          href={path.detailHref}
          className="text-xs font-medium text-muted-foreground hover:text-primary"
        >
          View full path
        </Link>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{path.completedCount}/{path.totalCount} complete</span>
          <span>{path.progress}%</span>
        </div>
        <Progress value={path.progress} className="h-2" />
      </div>

      {/* CTA */}
      <Link
        href={path.startHref}
        data-testid={`paths-start-${path.id}`}
        className="block w-full text-center py-2 px-4 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Start here
      </Link>
    </div>
  );
}
