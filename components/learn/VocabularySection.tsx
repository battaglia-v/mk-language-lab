'use client';

import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VocabularyItem {
  id: string;
  macedonianText: string;
  englishText: string;
  pronunciation: string | null;
  exampleSentenceMk: string | null;
  exampleSentenceEn: string | null;
  audioUrl: string | null;
}

interface VocabularySectionProps {
  items: VocabularyItem[];
}

export default function VocabularySection({ items }: VocabularySectionProps) {
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(error => console.error('Audio playback failed:', error));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">
                  {item.macedonianText}
                </span>
                {item.pronunciation && (
                  <span className="text-sm text-muted-foreground italic">
                    /{item.pronunciation}/
                  </span>
                )}
              </div>
              <p className="text-lg">{item.englishText}</p>

              {item.exampleSentenceMk && item.exampleSentenceEn && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Example:
                  </p>
                  <p className="text-base">{item.exampleSentenceMk}</p>
                  <p className="text-sm text-muted-foreground italic">
                    {item.exampleSentenceEn}
                  </p>
                </div>
              )}
            </div>

            {item.audioUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => playAudio(item.audioUrl!)}
                className="flex-shrink-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
