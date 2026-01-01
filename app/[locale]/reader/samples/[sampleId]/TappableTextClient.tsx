'use client';

import { TappableText } from '@/components/reader/TappableText';
import type { ReaderSampleVocab } from '@/lib/reader-samples';

interface TappableTextClientProps {
  text: string;
  vocabulary: ReaderSampleVocab[];
  locale: string;
  className?: string;
}

export function TappableTextClient({ text, vocabulary, locale, className }: TappableTextClientProps) {
  return (
    <TappableText
      text={text}
      vocabulary={vocabulary}
      locale={locale as 'en' | 'mk'}
      className={className}
    />
  );
}
