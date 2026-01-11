'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import type { ReaderSample } from '@/lib/reader-samples';

export function QuickAnalyzeButton({ sample, locale }: { sample: ReaderSample; locale: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAnalyze = () => {
    setIsLoading(true);
    
    // Extract all text blocks into a single string
    const fullText = sample.text_blocks_mk
      .filter(block => block.type === 'p') // Only paragraph blocks
      .map(block => block.value)
      .join('\n\n');
    
    // Store the text in sessionStorage so it can be loaded by the reader page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mkll:reader-quick-analyze', fullText);
    }
    
    // Navigate to reader analyze page (ReaderWorkspace loads sessionStorage text)
    router.push(`/${locale}/reader/analyze`);
  };

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleQuickAnalyze}
      disabled={isLoading}
      className="w-full gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10"
      data-testid="reader-quick-analyze"
    >
      <Sparkles className="h-5 w-5" />
      {isLoading ? 'Analyzing...' : 'Quick Analyze Text'}
    </Button>
  );
}
