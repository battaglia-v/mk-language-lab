import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
  Plus,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';
import prisma from '@/lib/prisma';

async function getAdminStats() {
  try {
    // Query database directly (faster than API route)
    const [
      totalVocabularyCount,
      activeUsersCount,
      totalUsersCount,
      wordOfTheDayCount,
      recentVocabulary,
      todayActiveUsers,
    ] = await Promise.all([
      // Count all vocabulary (Practice + Word of the Day combined)
      prisma.practiceVocabulary.count({
        where: { isActive: true },
      }),
      // Users active in last 30 days
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Total registered users
      prisma.user.count(),
      // Word of the Day entries
      prisma.wordOfTheDay.count({
        where: { isActive: true },
      }),
      // Recent vocabulary additions
      prisma.practiceVocabulary.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          macedonian: true,
          english: true,
          difficulty: true,
          createdAt: true,
        },
      }),
      // Users active today
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalVocabulary: totalVocabularyCount,
      activeUsers: activeUsersCount,
      totalUsers: totalUsersCount,
      wordOfTheDay: wordOfTheDayCount,
      recentVocabulary,
      todayActiveUsers,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalVocabulary: 0,
      activeUsers: 0,
      totalUsers: 0,
      wordOfTheDay: 0,
      recentVocabulary: [],
      todayActiveUsers: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6 px-6 lg:px-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage content for the Macedonian language learning app
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/practice-vocabulary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vocabulary
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/word-of-the-day" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule WOTD
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Vocabulary</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVocabulary}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active words in practice pool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Word of the Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wordOfTheDay}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <Badge variant="secondary">{stats.recentVocabulary.length} new</Badge>
            </div>
            <CardDescription>
              Latest vocabulary additions to the practice pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentVocabulary.length > 0 ? (
              <div className="space-y-3">
                {stats.recentVocabulary.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {word.macedonian} → {word.english}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {word.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(word.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent vocabulary additions
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Engagement Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>User Engagement</CardTitle>
            </div>
            <CardDescription>
              Platform usage and user activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Today</span>
                </div>
                <span className="text-2xl font-bold">{stats.todayActiveUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active (30 days)</span>
                </div>
                <span className="text-2xl font-bold">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Registered</span>
                </div>
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">Engagement Rate</div>
                <div className="text-lg font-semibold mt-1">
                  {stats.totalUsers > 0
                    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users active in last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vocabulary Management */}
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Vocabulary Management</CardTitle>
            <CardDescription>
              Manage all vocabulary words for practice exercises and Word of the Day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full gap-2" asChild>
              <Link href="/admin/practice-vocabulary">
                Manage Practice Vocabulary
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/admin/word-of-the-day">
                Manage Word of the Day
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Tips
            </CardTitle>
            <CardDescription>
              Keyboard shortcuts for faster management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Add new word</span>
                <Badge variant="outline" className="font-mono">Alt + N</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Search vocabulary</span>
                <Badge variant="outline" className="font-mono">Ctrl/⌘ + K</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Toggle bulk select</span>
                <Badge variant="outline" className="font-mono">Alt + B</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigate pages</span>
                <Badge variant="outline" className="font-mono">G then H/V/W</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
