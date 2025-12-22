import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout';
import { getReaderSample, getDifficultyColor } from '@/lib/reader-samples';
import { ReaderQuizButton } from '@/components/reader/ReaderQuizButton';
import { QuickAnalyzeButton } from '@/components/reader/QuickAnalyzeButton';
import { cn } from '@/lib/utils';

interface ReadingSamplePageProps {
  params: Promise<{
    locale: string;
    sampleId: string;
  }>;
}

export default async function ReadingSamplePage({ params }: ReadingSamplePageProps) {
  const { locale, sampleId } = await params;
  const sample = getReaderSample(sampleId);

  if (!sample) {
    notFound();
  }

  const t = await getTranslations('reader');
  const title = locale === 'mk' ? sample.title_mk : sample.title_en;

  return (
    <PageContainer size="content" className="flex flex-col gap-5 pb-24 sm:gap-6 sm:pb-10">
      {/* Header with back button */}
      <div className="flex flex-col gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit gap-2"
        >
          <Link href={`/${locale}/reader`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Reader
          </Link>
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {title}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-semibold',
                getDifficultyColor(sample.difficulty)
              )}
            >
              {sample.difficulty}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>~{sample.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{sample.attribution.handle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              <span>{sample.attribution.series}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {sample.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs for Text / Grammar / Vocabulary */}
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
        </TabsList>

        {/* Text Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reading</CardTitle>
              <CardDescription>
                {locale === 'mk' ? 'Прочитајте го текстот' : 'Read the text'}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              {sample.text_blocks_mk.map((block, idx) => {
                if (block.type === 'p') {
                  return (
                    <p key={idx} className="leading-relaxed">
                      {block.value}
                    </p>
                  );
                }
                if (block.type === 'h2') {
                  return (
                    <h2 key={idx} className="mt-6 text-xl font-semibold">
                      {block.value}
                    </h2>
                  );
                }
                return null;
              })}
            </CardContent>
          </Card>

          {/* Quick Analyze CTA */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Analyze This Text</h3>
                <p className="text-sm text-muted-foreground">
                  Load this text into the reader workspace for word-by-word analysis
                </p>
              </div>
              <QuickAnalyzeButton sample={sample} locale={locale} />
            </CardContent>
          </Card>

          {/* Attribution */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">
                    {sample.attribution.series} • Day {sample.attribution.day}
                  </p>
                  <p>
                    Source: {sample.attribution.sourceTitle}
                    {sample.attribution.author && ` by ${sample.attribution.author}`}
                  </p>
                  <p className="text-xs">
                    Content by {sample.attribution.handle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grammar Tab */}
        <TabsContent value="grammar" className="space-y-4">
          {sample.grammar_highlights.map((highlight, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>
                  {locale === 'mk' ? highlight.title_mk : highlight.title_en}
                </CardTitle>
                {(highlight.description_mk || highlight.description_en) && (
                  <CardDescription className="text-sm">
                    {locale === 'mk' ? highlight.description_mk : highlight.description_en}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bullets */}
                {highlight.bullets && highlight.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {highlight.bullets.map((bullet, bidx) => (
                      <li key={bidx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {/* Examples */}
                {highlight.examples && highlight.examples.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Examples:</p>
                    {highlight.examples.map((example, eidx) => (
                      <div
                        key={eidx}
                        className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1"
                      >
                        <p className="font-medium text-foreground">{example.mk}</p>
                        <p className="text-sm text-muted-foreground">{example.en}</p>
                        {example.note && (
                          <p className="text-xs text-muted-foreground italic">
                            {example.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-4">
          {/* Vocabulary List */}
          <Card>
            <CardHeader>
              <CardTitle>Key Vocabulary</CardTitle>
              <CardDescription>
                {sample.vocabulary.length} words from this text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sample.vocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/40 bg-muted/20 p-3"
                  >
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium text-foreground">{vocab.mk}</p>
                      <p className="text-sm text-muted-foreground">{vocab.en}</p>
                      {vocab.note && (
                        <p className="text-xs text-muted-foreground italic">
                          {vocab.note}
                        </p>
                      )}
                    </div>
                    {vocab.pos && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {vocab.pos}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expressions */}
          {sample.expressions && sample.expressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expressions</CardTitle>
                <CardDescription>
                  Common expressions from this text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sample.expressions.map((expr, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{expr.mk}</p>
                      <p className="text-sm text-muted-foreground">{expr.en}</p>
                    </div>
                    {expr.usage && (
                      <p className="text-xs text-muted-foreground">{expr.usage}</p>
                    )}
                    {expr.examples && expr.examples.length > 0 && (
                      <div className="space-y-1 pl-3 border-l-2 border-primary/30">
                        {expr.examples.map((ex, eidx) => (
                          <div key={eidx} className="text-xs">
                            <p className="text-foreground">{ex.mk}</p>
                            <p className="text-muted-foreground">{ex.en}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quiz CTA */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Ready to Practice?</h3>
                <p className="text-sm text-muted-foreground">
                  Test your knowledge with a vocabulary quiz
                </p>
              </div>
              <ReaderQuizButton sample={sample} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
