import { getLocale } from "next-intl/server";
import Link from "next/link";
import { BookOpen, Rocket, Globe, Trophy, Calendar, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface PathCard {
  id: string;
  level: string;
  title: string;
  titleMk: string;
  description: string;
  estimatedWeeks: number;
  units: number;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const learningPaths: PathCard[] = [
  {
    id: "a1",
    level: "A1",
    title: "Foundations",
    titleMk: "Основи",
    description: "Master the basics: alphabet, greetings, numbers, and essential phrases",
    estimatedWeeks: 4,
    units: 10,
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-emerald-500",
    available: true,
  },
  {
    id: "a2",
    level: "A2",
    title: "Momentum",
    titleMk: "Напредок",
    description: "Build on basics with past/future tenses, directions, and travel phrases",
    estimatedWeeks: 6,
    units: 12,
    icon: <Rocket className="h-6 w-6" />,
    color: "bg-blue-500",
    available: false,
  },
  {
    id: "b1",
    level: "B1",
    title: "Independence",
    titleMk: "Самостојност",
    description: "Express opinions, tell stories, and handle everyday situations",
    estimatedWeeks: 8,
    units: 15,
    icon: <Globe className="h-6 w-6" />,
    color: "bg-purple-500",
    available: false,
  },
  {
    id: "b2c1",
    level: "B2/C1",
    title: "Mastery",
    titleMk: "Мајсторство",
    description: "Achieve fluency with real texts, news, and advanced conversations",
    estimatedWeeks: 12,
    units: 24,
    icon: <Trophy className="h-6 w-6" />,
    color: "bg-amber-500",
    available: false,
  },
  {
    id: "30day",
    level: "Challenge",
    title: "30-Day Reading",
    titleMk: "30 дена читање",
    description: "Daily reading passages with vocabulary and grammar notes",
    estimatedWeeks: 4,
    units: 30,
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-rose-500",
    available: true,
  },
  {
    id: "topics",
    level: "Topics",
    title: "Topic Packs",
    titleMk: "Тематски пакети",
    description: "Focused vocabulary: travel, food, business, and more",
    estimatedWeeks: 2,
    units: 8,
    icon: <Boxes className="h-6 w-6" />,
    color: "bg-teal-500",
    available: true,
  },
];

export default async function LearningPathsPage() {
  const locale = await getLocale();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 sm:pb-6">
      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Link
              href={`/${locale}/learn`}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to Learn
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Learning Paths
            </h1>
            <p className="text-base text-muted-foreground">
              Choose your journey based on your current level
            </p>
          </div>

          {/* Path Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {learningPaths.map((path) => (
              <PathCardComponent key={path.id} path={path} locale={locale} />
            ))}
          </div>

          {/* Find My Level CTA */}
          <div className="bg-muted/50 rounded-xl p-4 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Not sure where to start?
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>Placement Quiz</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For now, we recommend starting with A1 Foundations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PathCardComponent({ path, locale }: { path: PathCard; locale: string }) {
  const href = path.available ? `/${locale}/learn/paths/${path.id}` : "#";

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-4 space-y-3 transition-all",
        path.available
          ? "hover:shadow-md hover:border-primary/20 cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Level Badge */}
      <div className="flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full text-white text-xs font-semibold",
          path.color
        )}>
          {path.icon}
          <span>{path.level}</span>
        </div>
        {!path.available && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Coming Soon
          </span>
        )}
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
        <span>~{path.estimatedWeeks} weeks</span>
      </div>

      {/* CTA */}
      {path.available && (
        <Link
          href={href}
          className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Start Path
        </Link>
      )}
    </div>
  );
}
