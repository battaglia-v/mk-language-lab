'use client';

/**
 * DailyQuestsCard Component
 * 
 * Dashboard card showing 1-3 daily quests with progress bars.
 * Auto-assigns quests on first load if none exist for today.
 * 
 * Features:
 * - Progress bars with percentage
 * - Completion state with checkmark animation
 * - XP reward displayed per quest
 * - Auto-refresh on mount
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, Target, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  targetUnit: string;
  progress: number;
  progressPercent: number;
  status: 'active' | 'completed' | 'expired';
  xpReward: number;
  currencyReward: number;
}

interface DailyQuestsCardProps {
  /** Translations */
  t?: {
    title?: string;
    noQuests?: string;
    completed?: string;
    xpReward?: string;
    refresh?: string;
    loading?: string;
  };
  /** Additional class name */
  className?: string;
}

export function DailyQuestsCard({ t = {}, className }: DailyQuestsCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translations with defaults
  const translations = {
    title: t.title || 'Daily Quests',
    noQuests: t.noQuests || 'No quests available',
    completed: t.completed || 'Completed!',
    xpReward: t.xpReward || 'XP',
    refresh: t.refresh || 'Refresh',
    loading: t.loading || 'Loading quests...',
  };

  // Fetch or assign quests on mount
  useEffect(() => {
    assignAndFetchQuests();
  }, []);

  const assignAndFetchQuests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to assign daily quests (will return existing if already assigned)
      const assignResponse = await fetch('/api/quests/assign-daily', {
        method: 'POST',
      });
      
      if (assignResponse.ok) {
        const data = await assignResponse.json();
        setQuests(data.quests || []);
      } else {
        // Fallback to fetching existing quests
        const fetchResponse = await fetch('/api/quests');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          // Filter to only daily quests
          const dailyQuests = (data.quests || []).filter(
            (q: Quest & { type?: string }) => q.type === 'daily'
          );
          setQuests(dailyQuests.slice(0, 3));
        } else {
          throw new Error('Failed to fetch quests');
        }
      }
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError('Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await assignAndFetchQuests();
    setIsRefreshing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {translations.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">{translations.loading}</span>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {translations.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {translations.refresh}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No quests available
  if (quests.length === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {translations.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
          <p className="text-sm text-muted-foreground">{translations.noQuests}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {translations.refresh}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {translations.title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
            >
              <QuestItem quest={quest} translations={translations} />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/**
 * Individual quest item with progress bar
 */
function QuestItem({
  quest,
}: {
  quest: Quest;
  translations?: { completed: string; xpReward: string }
}) {
  const prefersReducedMotion = useReducedMotion();
  const isCompleted = quest.status === 'completed' || quest.progressPercent >= 100;

  return (
    <div 
      className={cn(
        'rounded-xl border p-3 transition-all',
        isCompleted 
          ? 'border-success/30 bg-success/5' 
          : 'border-border/50 bg-muted/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Check className="h-4 w-4 text-success" />
              </motion.div>
            )}
            <p className={cn(
              'text-sm font-medium truncate',
              isCompleted ? 'text-success' : 'text-foreground'
            )}>
              {quest.title}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {quest.progress}/{quest.target} {quest.targetUnit}
          </p>
        </div>
        
        {/* XP Reward Badge */}
        <div className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          isCompleted ? 'bg-success/20 text-success' : 'bg-accent/10 text-accent'
        )}>
          <Star className="h-3 w-3" fill="currentColor" />
          <span>{quest.xpReward}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isCompleted ? 'bg-success' : 'bg-primary'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${quest.progressPercent}%` }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

