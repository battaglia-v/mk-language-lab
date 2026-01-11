'use client';

import { Badge } from '@/components/ui/badge';
import type { InfoStep, StepComponentProps } from '@/lib/lesson-runner/types';

const GENDER_LABELS: Record<string, string> = {
  masculine: 'm.',
  feminine: 'f.',
  neuter: 'n.',
  m: 'm.',
  f: 'f.',
  n: 'n.',
};

function splitParagraphs(body?: string): string[] {
  if (!body) return [];
  return body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function Info({ step }: StepComponentProps<InfoStep>) {
  const paragraphs = splitParagraphs(step.body);
  const bullets = step.bullets?.filter(Boolean) ?? [];
  const examples = step.examples ?? [];
  const vocabulary = step.vocabulary ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {step.title}
          </h2>
          {step.subtitle && (
            <p className="text-sm text-muted-foreground">
              {step.subtitle}
            </p>
          )}
        </div>

        {paragraphs.length > 0 && (
          <div className="mt-4 space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {bullets.length > 0 && (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>

      {examples.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Examples
          </p>
          <ol className="mt-4 space-y-4">
            {examples.map((example, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-medium">{example.mk}</p>
                  {example.en && (
                    <p className="text-sm text-muted-foreground italic">
                      {example.en}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {vocabulary.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vocabulary
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {vocabulary.map((item, index) => {
              const genderLabel = item.gender ? GENDER_LABELS[item.gender.toLowerCase()] : undefined;
              return (
                <div
                  key={`${item.mk}-${index}`}
                  className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {item.mk}
                    </span>
                    {item.partOfSpeech && (
                      <Badge variant="outline" className="text-xs">
                        {item.partOfSpeech}
                      </Badge>
                    )}
                    {genderLabel && (
                      <Badge variant="outline" className="text-xs">
                        {genderLabel}
                      </Badge>
                    )}
                  </div>
                  {item.en && (
                    <p className="text-sm text-muted-foreground italic">
                      {item.en}
                    </p>
                  )}
                  {item.transliteration && (
                    <p className="text-xs text-muted-foreground font-mono">
                      /{item.transliteration}/
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
