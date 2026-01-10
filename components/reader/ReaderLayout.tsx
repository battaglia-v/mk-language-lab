'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Clock, Eye, EyeOff, Minus, Plus, Tag, User, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickAnalyzeButton } from '@/components/reader/QuickAnalyzeButton';
import { MarkCompleteButton } from '@/components/reader/MarkCompleteButton';
import { TappableText } from '@/components/reader/TappableText';
import type { ReaderSample } from '@/lib/reader-samples';
import { getDifficultyColor } from '@/lib/reader-samples';
import { cn } from '@/lib/utils';

type ReaderLayoutProps = {
  sample: ReaderSample;
  locale: string;
};

const FONT_STEPS = [
  { label: 'S', className: 'text-base sm:text-lg' },
  { label: 'M', className: 'text-lg sm:text-xl' },
  { label: 'L', className: 'text-xl sm:text-2xl' },
];

export function ReaderLayout({ sample, locale }: ReaderLayoutProps) {
  const t = useTranslations('common');
  const title = locale === 'mk' ? sample.title_mk : sample.title_en;
  const [fontStep, setFontStep] = useState(1);
  const [focusMode, setFocusMode] = useState(false);

  const fontClass = FONT_STEPS[fontStep]?.className ?? FONT_STEPS[1].className;

  const handleFontChange = (direction: 'up' | 'down') => {
    setFontStep((current) => {
      const next = direction === 'up' ? current + 1 : current - 1;
      return Math.max(0, Math.min(FONT_STEPS.length - 1, next));
    });
  };

  return (
    <div className="space-y-10">
      <div className="sticky top-0 z-30 -mx-4 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 px-3">
            <Link href={`/${locale}/reader`} data-testid="reader-back">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">{t('back')}</span>
            </Link>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border/40 bg-muted/20 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => handleFontChange('down')}
                disabled={fontStep === 0}
                aria-label="Decrease font size"
                data-testid="reader-font-decrease"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs font-semibold text-muted-foreground">{FONT_STEPS[fontStep]?.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => handleFontChange('up')}
                disabled={fontStep === FONT_STEPS.length - 1}
                aria-label="Increase font size"
                data-testid="reader-font-increase"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant={focusMode ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-1.5 rounded-full px-3"
              onClick={() => setFocusMode((current) => !current)}
              aria-pressed={focusMode}
              data-testid="reader-focus-toggle"
            >
              {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-xs font-semibold">Focus</span>
            </Button>
          </div>
        </div>
      </div>

      {!focusMode && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
            <Badge
              variant="outline"
              className={cn('text-xs font-semibold', getDifficultyColor(sample.difficulty))}
            >
              {sample.difficulty}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

          <div className="flex flex-wrap gap-2">
            {sample.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-border/40 bg-card p-6" data-testid="reader-sample-tab-text">
        <div className="space-y-1 border-b border-border/30 pb-5">
          <h2 className="text-base font-semibold text-foreground">Reading</h2>
          <p className="text-xs text-muted-foreground">
            {locale === 'mk'
              ? 'Допрете збор за превод, па зачувајте го во речник'
              : 'Tap any word for translation, then save it to your glossary'}
          </p>
        </div>
        <div className="space-y-6 pt-5">
          {sample.text_blocks_mk.map((block, idx) => {
            if (block.type === 'p') {
              return (
                <TappableText
                  key={idx}
                  text={block.value}
                  vocabulary={sample.vocabulary}
                  analyzedData={sample.analyzedData}
                  locale={locale as 'en' | 'mk'}
                  className={cn(fontClass, 'leading-relaxed')}
                />
              );
            }
            if (block.type === 'h2' || block.type === 'h3' || block.type === 'h1') {
              return (
                <h2 key={idx} className={cn('mt-4 font-semibold text-foreground', fontClass)}>
                  {block.value}
                </h2>
              );
            }
            if (block.type === 'note') {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"
                >
                  <span className="font-medium">Note:</span> {block.value}
                </div>
              );
            }
            return null;
          })}
        </div>
      </section>

      {!focusMode && (
        <>
          <CollapsibleSection
            title="Vocabulary"
            subtitle={`${sample.vocabulary.length} words`}
            testId="reader-sample-tab-vocabulary"
          >
            {sample.vocabulary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No vocabulary listed yet. Tap words in the text to save them.
              </p>
            ) : (
              <div className="space-y-2">
                {sample.vocabulary.map((vocab, idx) => (
                  <div
                    key={`${vocab.mk}-${idx}`}
                    className="rounded-xl border border-border/40 bg-muted/20 p-3"
                  >
                    <p className="font-medium text-foreground">{vocab.mk}</p>
                    <p className="text-sm text-muted-foreground">{vocab.en}</p>
                    {vocab.note && (
                      <p className="text-xs text-muted-foreground italic">{vocab.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Grammar"
            subtitle={`${sample.grammar_highlights.length} highlights`}
            testId="reader-sample-tab-grammar"
          >
            {sample.grammar_highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No grammar notes yet. Focus on reading and check back later.
              </p>
            ) : (
              <div className="space-y-3">
                {sample.grammar_highlights.map((highlight, idx) => (
                  <div
                    key={`${highlight.title_en}-${idx}`}
                    className="rounded-xl border border-border/40 bg-muted/20 p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">
                        {locale === 'mk' ? highlight.title_mk : highlight.title_en}
                      </p>
                      {(highlight.description_mk || highlight.description_en) && (
                        <p className="text-sm text-muted-foreground">
                          {locale === 'mk' ? highlight.description_mk : highlight.description_en}
                        </p>
                      )}
                    </div>

                    {highlight.bullets && highlight.bullets.length > 0 && (
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                        {highlight.bullets.map((bullet, bidx) => (
                          <li key={bidx}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {highlight.examples && highlight.examples.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Examples
                        </p>
                        {highlight.examples.map((example, eidx) => (
                          <div
                            key={eidx}
                            className="rounded-lg border border-border/40 bg-background/50 p-3"
                          >
                            <p className="font-medium text-foreground">{example.mk}</p>
                            <p className="text-sm text-muted-foreground">{example.en}</p>
                            {example.note && (
                              <p className="text-xs text-muted-foreground italic">{example.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border/40 bg-card/60 p-6 space-y-3">
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-semibold">Analyze This Text</h3>
                <p className="text-sm text-muted-foreground">
                  Load this text into the reader workspace for word-by-word analysis.
                </p>
              </div>
              <QuickAnalyzeButton sample={sample} locale={locale} />
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Finished Reading?</h3>
                <p className="text-sm text-muted-foreground">
                  Mark this lesson complete to unlock the next one and earn XP.
                </p>
              </div>
              <MarkCompleteButton sampleId={sample.id} locale={locale} dayNumber={sample.attribution.day} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  testId,
  children,
}: {
  title: string;
  subtitle?: string;
  testId?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-border/40 bg-card">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full min-h-[56px] items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/20"
        aria-expanded={open}
        data-testid={testId}
      >
        <div className="space-y-0.5">
          <p className="text-base font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}
