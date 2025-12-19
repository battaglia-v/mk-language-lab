import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getDifficultyColor, type ReaderSample } from '@/lib/reader-samples';

interface ReadingSampleCardProps {
  sample: ReaderSample;
  locale: string;
}

export function ReadingSampleCard({ sample, locale }: ReadingSampleCardProps) {
  const title = locale === 'mk' ? sample.title_mk : sample.title_en;

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
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

        {/* CTA */}
        <Button
          asChild
          className="w-full"
          size="sm"
        >
          <Link href={`/${locale}/reader/samples/${sample.id}`}>
            Open sample
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
