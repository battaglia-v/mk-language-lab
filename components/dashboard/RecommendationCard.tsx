'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  MessageSquare, 
  Mic, 
  Brain, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export type RecommendationType = 
  | 'continue-lesson'
  | 'review-weak-words'
  | 'pronunciation-practice'
  | 'grammar-drill'
  | 'daily-challenge'
  | 'streak-protection'
  | 'new-topic';

interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  /** Estimated time in minutes */
  estimatedMinutes?: number;
  /** XP reward */
  xpReward?: number;
  /** Priority: 1 = highest */
  priority: number;
  /** Related data */
  metadata?: {
    lessonId?: string;
    topicId?: string;
    wordCount?: number;
    accuracy?: number;
    daysUntilStreakLoss?: number;
  };
  /** Navigation href */
  href: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction: (recommendation: Recommendation) => void;
  t: {
    continueLesson: string;
    reviewWords: string;
    pronunciation: string;
    grammar: string;
    challenge: string;
    streakProtection: string;
    newTopic: string;
    startNow: string;
    resume: string;
    practice: string;
    minutes: string;
    xp: string;
    urgent: string;
    recommended: string;
    wordsToReview: string;
  };
  className?: string;
}

const RECOMMENDATION_CONFIG: Record<RecommendationType, {
  icon: React.ElementType;
  gradient: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  'continue-lesson': {
    icon: BookOpen,
    gradient: 'from-primary/20 to-primary/5',
    badgeVariant: 'default',
  },
  'review-weak-words': {
    icon: RotateCcw,
    gradient: 'from-warning/20 to-warning/5',
    badgeVariant: 'destructive',
  },
  'pronunciation-practice': {
    icon: Mic,
    gradient: 'from-secondary/20 to-secondary/5',
    badgeVariant: 'secondary',
  },
  'grammar-drill': {
    icon: Brain,
    gradient: 'from-accent/20 to-accent/5',
    badgeVariant: 'default',
  },
  'daily-challenge': {
    icon: Trophy,
    gradient: 'from-success/20 to-success/5',
    badgeVariant: 'default',
  },
  'streak-protection': {
    icon: Sparkles,
    gradient: 'from-destructive/20 to-destructive/5',
    badgeVariant: 'destructive',
  },
  'new-topic': {
    icon: TrendingUp,
    gradient: 'from-info/20 to-info/5',
    badgeVariant: 'outline',
  },
};

/**
 * RecommendationCard - Displays a personalized activity suggestion
 */
export function RecommendationCard({
  recommendation,
  onAction,
  t,
  className,
}: RecommendationCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = RECOMMENDATION_CONFIG[recommendation.type];
  const Icon = config.icon;

  const isUrgent = recommendation.type === 'streak-protection' || 
                   recommendation.type === 'review-weak-words';

  const getCtaText = () => {
    switch (recommendation.type) {
      case 'continue-lesson':
        return t.resume;
      case 'review-weak-words':
      case 'pronunciation-practice':
      case 'grammar-drill':
        return t.practice;
      default:
        return t.startNow;
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all hover:shadow-md",
        isUrgent ? "border-destructive/30" : "border-border/50",
        className
      )}>
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          config.gradient
        )} />

        <CardContent className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
          {/* Icon + Content Row */}
          <div className="flex items-start gap-3 sm:flex-1 sm:items-center sm:gap-4">
            {/* Icon */}
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14",
              "bg-background/80 shadow-sm"
            )}>
              <Icon className={cn(
                "h-5 w-5 sm:h-7 sm:w-7",
                isUrgent ? "text-destructive" : "text-primary"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">
                  {recommendation.title}
                </h3>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs shrink-0">
                    {t.urgent}
                  </Badge>
                )}
                {!isUrgent && recommendation.priority === 1 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {t.recommended}
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {recommendation.description}
              </p>

              {/* Meta info - inline on mobile */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground">
                {recommendation.estimatedMinutes && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {recommendation.estimatedMinutes} {t.minutes}
                  </span>
                )}
                {recommendation.xpReward && (
                  <span className="flex items-center gap-1 text-accent font-medium whitespace-nowrap">
                    +{recommendation.xpReward} {t.xp}
                  </span>
                )}
                {recommendation.metadata?.wordCount && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    {recommendation.metadata.wordCount} {t.wordsToReview}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CTA - full width on mobile */}
          <Button
            size="sm"
            variant={isUrgent ? "destructive" : "default"}
            onClick={() => onAction(recommendation)}
            className="w-full sm:w-auto shrink-0"
          >
            {getCtaText()}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RecommendationListProps {
  recommendations: Recommendation[];
  maxDisplay?: number;
  onAction: (recommendation: Recommendation) => void;
  t: RecommendationCardProps['t'] & {
    sectionTitle: string;
    noRecommendations: string;
  };
  className?: string;
}

/**
 * RecommendationList - Displays a prioritized list of recommendations
 */
export function RecommendationList({
  recommendations,
  maxDisplay = 3,
  onAction,
  t,
  className,
}: RecommendationListProps) {
  const sortedRecommendations = [...recommendations]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxDisplay);

  if (sortedRecommendations.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed p-6 text-center", className)}>
        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{t.noRecommendations}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        {t.sectionTitle}
      </h2>
      {sortedRecommendations.map((rec, index) => (
        <RecommendationCard
          key={`${rec.type}-${index}`}
          recommendation={rec}
          onAction={onAction}
          t={t}
        />
      ))}
    </div>
  );
}

export type { Recommendation, RecommendationCardProps, RecommendationListProps };
