'use client';

/**
 * FocusAreasCard - Shows weak grammar topics for focused practice
 * 
 * Displays the user's top 3 weak grammar areas based on
 * their exercise performance history. Provides actionable
 * CTAs to practice specific topics.
 * 
 * UX Principles:
 * - Supportive, not alarming (no red/negative colors)
 * - Clear, actionable suggestions
 * - Only shown when weak topics exist
 * 
 * Parity: Must match Android FocusAreasCard.tsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export interface WeakTopic {
  topicId: string;
  nameEn: string;
  nameMk: string;
  level: string;
  confidence: {
    score: number;
    level: string;
    suggestion: string;
  };
  totalAttempts: number;
  correctAttempts: number;
}

interface FocusAreasCardProps {
  /** Weak topics to display (max 3) */
  weakTopics?: WeakTopic[];
  /** Whether to fetch from API (if weakTopics not provided) */
  autoFetch?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Get confidence level styling
 */
function getConfidenceStyle(level: string): {
  bg: string;
  text: string;
  bar: string;
} {
  switch (level) {
    case 'weak':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        bar: 'bg-amber-500',
      };
    case 'developing':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        bar: 'bg-blue-500',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        bar: 'bg-slate-500',
      };
  }
}

export function FocusAreasCard({
  weakTopics: propWeakTopics,
  autoFetch = true,
  className,
}: FocusAreasCardProps) {
  const locale = useLocale();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(propWeakTopics || []);
  const [isLoading, setIsLoading] = useState(autoFetch && !propWeakTopics);
  const [error, setError] = useState<string | null>(null);

  // Fetch weak topics from API if not provided
  useEffect(() => {
    if (propWeakTopics || !autoFetch) return;

    async function fetchWeakTopics() {
      try {
        const response = await fetch('/api/user/weak-topics');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setWeakTopics(data.weakTopics || []);
        
        // Track view
        if (data.weakTopics?.length > 0) {
          trackEvent(AnalyticsEvents.WEAK_TOPICS_VIEWED, {
            count: data.weakTopics.length,
          });
        }
      } catch (err) {
        console.error('[FocusAreasCard] Error:', err);
        setError('Unable to load focus areas');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeakTopics();
  }, [propWeakTopics, autoFetch]);

  // Update from props if they change
  useEffect(() => {
    if (propWeakTopics) {
      setWeakTopics(propWeakTopics);
    }
  }, [propWeakTopics]);

  // Don't render if no weak topics
  if (!isLoading && weakTopics.length === 0) {
    return null;
  }

  // Handle practice click
  const handlePracticeClick = (topic: WeakTopic) => {
    trackEvent(AnalyticsEvents.WEAK_TOPIC_PRACTICE_STARTED, {
      topicId: topic.topicId,
      confidenceScore: topic.confidence.score,
    });
  };

  return (
    <Card className={cn(
      'border border-border/60 bg-card shadow-sm',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Focus Areas</CardTitle>
            <CardDescription className="text-xs">
              Topics that could use some attention
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <p className="text-sm text-muted-foreground text-center py-4">
            {error}
          </p>
        ) : (
          // Topic cards
          weakTopics.map((topic) => {
            const style = getConfidenceStyle(topic.confidence.level);
            
            return (
              <div
                key={topic.topicId}
                className={cn(
                  'rounded-xl border border-border/40 p-3',
                  'transition-all hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Topic name */}
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">
                        {topic.nameEn}
                      </h4>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {topic.level}
                      </span>
                    </div>
                    
                    {/* Macedonian name */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {topic.nameMk}
                    </p>

                    {/* Confidence bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', style.bar)}
                          style={{ width: `${topic.confidence.score}%` }}
                        />
                      </div>
                      <span className={cn('text-xs font-medium', style.text)}>
                        {topic.confidence.score}%
                      </span>
                    </div>

                    {/* Suggestion */}
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                      {topic.confidence.suggestion}
                    </p>
                  </div>

                  {/* Practice button */}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8 px-3 text-xs"
                    onClick={() => handlePracticeClick(topic)}
                  >
                    <Link href={`/${locale}/practice?topic=${topic.topicId}`}>
                      Practice
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}

        {/* Encouragement footer */}
        {!isLoading && !error && weakTopics.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>A little practice goes a long way!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FocusAreasCard;
