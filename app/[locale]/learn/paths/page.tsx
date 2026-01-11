import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, BookOpen, ChevronRight, GraduationCap, Sparkles, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getA1Path, getA2Path, getB1Path } from '@/lib/learn/curriculum-path';
import { create30DayChallengePath } from '@/lib/learn/challenge-30day-path';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PathCard = {
  id: string;
  title: string;
  description?: string;
  totalCount: number;
  href: string;
  badge: string;
  icon: LucideIcon;
  accentClass: string;
};

export default async function LearnPathsPage() {
  const locale = await getLocale();
  const t = await getTranslations('mobile.learn');
  const [a1Path, a2Path, b1Path] = await Promise.all([
    getA1Path(),
    getA2Path(),
    getB1Path(),
  ]);
  const challengePath = create30DayChallengePath([]);

  const paths: PathCard[] = [
    {
      id: 'a1',
      title: a1Path.title,
      description: a1Path.description,
      totalCount: a1Path.totalCount,
      href: `/${locale}/learn?level=beginner`,
      badge: 'A1',
      icon: GraduationCap,
      accentClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    },
    {
      id: 'a2',
      title: a2Path.title,
      description: a2Path.description,
      totalCount: a2Path.totalCount,
      href: `/${locale}/learn?level=intermediate`,
      badge: 'A2',
      icon: Sparkles,
      accentClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
    {
      id: 'b1',
      title: b1Path.title,
      description: b1Path.description,
      totalCount: b1Path.totalCount,
      href: `/${locale}/learn?level=advanced`,
      badge: 'B1',
      icon: Zap,
      accentClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    },
    {
      id: '30day',
      title: challengePath.title,
      description: challengePath.description,
      totalCount: challengePath.totalCount,
      href: `/${locale}/learn?level=challenge`,
      badge: '📖',
      icon: BookOpen,
      accentClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    },
  ];

  return (
    <PageContainer size="lg" className="pb-24 sm:pb-10">
      <div className="space-y-6">
        <header className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href={`/${locale}/learn`} data-testid="paths-back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('learningPaths', { default: 'Learning Paths' })}</h1>
            <p className="text-sm text-muted-foreground">
              {t('learningPathsHelper', { default: 'Pick a path to start learning.' })}
            </p>
          </div>
        </header>

        <div className="space-y-3">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.id}
                href={path.href}
                data-testid={`paths-start-${path.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', path.accentClass)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">{path.title}</h2>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">{path.badge}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{path.description ?? ''}</p>
                  <p className="text-xs text-muted-foreground">{path.totalCount} lessons</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
