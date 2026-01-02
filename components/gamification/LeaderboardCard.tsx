'use client';

/**
 * LeaderboardCard Component
 *
 * Displays a ranked list of users with their XP, streak, and level.
 * Supports global, friends, and league leaderboards.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Skeleton } from '@/components/ui/skeleton';

export type LeaderboardType = 'global';
export type LeaderboardPeriod = 'alltime';

type LeaderboardEntry = {
  userId: string;
  rank: number;
  name: string | null;
  image: string | null;
  xp: number;
  weeklyXP: number;
  streak: number;
  level: string;
};

type LeaderboardData = {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  timestamp: string;
};

interface LeaderboardCardProps {
  limit?: number;
  className?: string;
}

export function LeaderboardCard({
  limit = 10,
  className,
}: LeaderboardCardProps) {
  // Simplified: Always global leaderboard by total XP
  const type: LeaderboardType = 'global';
  const period: LeaderboardPeriod = 'alltime';
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, period, limit]);

  async function fetchLeaderboard() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/leaderboard?type=${type}&period=${period}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-foreground">Leaderboard</h3>
        </div>

        {data?.userRank && (
          <div className="rounded-full bg-accent/10 px-3 py-1">
            <span className="text-sm font-semibold text-accent">
              #{data.userRank}
            </span>
          </div>
        )}
      </div>

      {/* Simplified header - no toggles */}
      <p className="mb-4 text-sm text-muted-foreground">Top learners by total XP</p>

      {/* Leaderboard List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : data && data.leaderboard.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {data.leaderboard.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={data.userRank === entry.rank}
            />
          ))}
        </motion.div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No leaderboard data available
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual leaderboard entry row
 */
function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  // Always show total XP (simplified leaderboard)
  const xpToShow = entry.xp;

  // Medal colors for top 3
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'; // Gold
    if (rank === 2) return 'text-gray-400'; // Silver
    if (rank === 3) return 'text-amber-700'; // Bronze
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        isCurrentUser
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-background hover:bg-muted/50'
      )}
    >
      {/* Rank */}
      <div className="flex w-8 items-center justify-center">
        {entry.rank <= 3 ? (
          <Crown className={cn('h-5 w-5', getMedalColor(entry.rank))} fill="currentColor" />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {entry.image ? (
          <Image
            src={entry.image}
            alt={entry.name || 'User'}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-bold text-muted-foreground">
              {entry.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Name & Level */}
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.name || 'Anonymous'}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-primary">(You)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {entry.level}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        {/* Streak */}
        {entry.streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" fill="currentColor" />
            <span className="text-xs font-medium text-muted-foreground">
              {entry.streak}
            </span>
          </div>
        )}

        {/* XP */}
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-sm font-bold text-accent">
            {xpToShow.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
