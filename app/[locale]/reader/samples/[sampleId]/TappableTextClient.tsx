'use client';

import { TappableText } from '@/components/reader/TappableText';
import type { ReaderSampleVocab, AnalyzedTextData } from '@/lib/reader-samples';

interface TappableTextClientProps {
  text: string;
  vocabulary: ReaderSampleVocab[];
  analyzedData?: AnalyzedTextData;
  locale: string;
  className?: string;
}

export function TappableTextClient({ text, vocabulary, analyzedData, locale, className }: TappableTextClientProps) {
  return (
    <TappableText
      text={text}
      vocabulary={vocabulary}
      analyzedData={analyzedData}
      locale={locale as 'en' | 'mk'}
      className={className}
    />
  );
}
