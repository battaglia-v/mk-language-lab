import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage content for the Macedonian language learning app
        </p>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Word of the Day */}
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Word of the Day</CardTitle>
            <CardDescription>
              Manage daily featured vocabulary words that appear on the homepage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" asChild>
              <Link href="/admin/word-of-the-day">
                Manage Words
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Practice Vocabulary */}
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-secondary/5 blur-2xl" />
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <BookOpen className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Practice Vocabulary</CardTitle>
            <CardDescription>
              Manage the word bank used in Quick Practice exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="outline" asChild>
              <Link href="/admin/practice-vocabulary">
                Manage Words
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Word of the Day</p>
            <p className="text-2xl font-bold">Coming soon</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Practice Words</p>
            <p className="text-2xl font-bold">Coming soon</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">Coming soon</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Exercises</p>
            <p className="text-2xl font-bold">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
