import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getDifficultyColor, type ReaderSample } from '@/lib/reader-samples';

interface ReadingSampleCardProps {
  sample: ReaderSample;
  locale: string;
  isPremium?: boolean;
  isLocked?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  /** Whether the story has been marked complete */
  isCompleted?: boolean;
  /** Reading progress percentage (0-100), for in-progress stories */
  progressPercent?: number;
}

export function ReadingSampleCard({
  sample,
  locale,
  isPremium = false,
  isLocked = false,
  ctaHref,
  ctaLabel,
  isCompleted = false,
  progressPercent,
}: ReadingSampleCardProps) {
  const title = locale === 'mk' ? sample.title_mk : sample.title_en;
  const href = ctaHref || `/${locale}/reader/samples/${sample.id}`;

  // Determine CTA label based on progress state
  const getDefaultCtaLabel = () => {
    if (isLocked) {
      return locale === 'mk' ? 'Отклучи Pro' : 'Unlock Pro';
    }
    if (isCompleted) {
      return locale === 'mk' ? 'Прочитај повторно' : 'Read again';
    }
    if (progressPercent !== undefined && progressPercent > 0) {
      return locale === 'mk' ? 'Продолжи со читање' : 'Continue Reading';
    }
    return locale === 'mk' ? 'Почни да читаш' : 'Start Reading';
  };

  const buttonLabel = ctaLabel || getDefaultCtaLabel();

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg",
        isLocked && "border-primary/30 bg-primary/5"
      )}
    >
      {/* Status badges */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 items-end">
        {isCompleted && (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            {locale === 'mk' ? 'Завршено' : 'Completed'}
          </div>
        )}
        {isPremium && (
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-[11px] font-semibold text-primary">
            <Lock className="h-3 w-3" aria-hidden="true" />
            PRO
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <CardTitle className="line-clamp-2 text-lg leading-snug">
              {title}
            </CardTitle>
            <CardDescription className="text-xs">
              {sample.attribution.series} • {sample.attribution.handle}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 text-xs font-semibold',
              getDifficultyColor(sample.difficulty)
            )}
          >
            {sample.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {sample.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>~{sample.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{sample.vocabulary.length} words</span>
          </div>
        </div>

        {/* CTA - min 52px for touch target */}
        <Button
          asChild
          className="w-full min-h-[52px]"
          data-testid={`reader-sample-${sample.id}-cta`}
        >
          <Link href={href}>
            {buttonLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
