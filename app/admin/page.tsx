import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';

async function getAdminStats() {
  try {
    // Query database directly (faster than API route)
    const [
      wordOfTheDayCount,
      practiceWordsCount,
      activeUsersCount,
      totalExercisesCount,
    ] = await Promise.all([
      prisma.wordOfTheDay.count({
        where: { isActive: true },
      }),
      prisma.practiceVocabulary.count({
        where: { isActive: true },
      }),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.exercise.count(),
    ]);

    return {
      wordOfTheDay: wordOfTheDayCount,
      practiceWords: practiceWordsCount,
      activeUsers: activeUsersCount,
      totalExercises: totalExercisesCount,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      wordOfTheDay: 0,
      practiceWords: 0,
      activeUsers: 0,
      totalExercises: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8 px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage content for the Macedonian language learning app
        </p>
      </div>

      {/* Quick Stats */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Quick Stats</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Word of the Day</p>
            <p className="text-2xl font-bold">{stats.wordOfTheDay}</p>
            <p className="text-xs text-muted-foreground">active entries</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Practice Words</p>
            <p className="text-2xl font-bold">{stats.practiceWords}</p>
            <p className="text-xs text-muted-foreground">in word bank</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Exercises</p>
            <p className="text-2xl font-bold">{stats.totalExercises}</p>
            <p className="text-xs text-muted-foreground">across all lessons</p>
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {/* Vocabulary Management - Word of the Day & Practice */}
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Vocabulary Management</CardTitle>
            <CardDescription>
              Manage all vocabulary words for Word of the Day and Practice exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" asChild>
              <Link href="/admin/practice-vocabulary">
                Manage Words
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
