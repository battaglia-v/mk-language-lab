'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeletons';

/**
 * Lazy-loaded component wrappers for heavy components
 * These reduce initial bundle size by code-splitting
 */

// ============================================================================
// Loading Fallbacks
// ============================================================================

function CardLoadingFallback() {
  return <CardSkeleton />;
}

// ListLoadingFallback available if needed
// function ListLoadingFallback() {
//   return <ListSkeleton items={3} />;
// }

function DashboardLoadingFallback() {
  return <DashboardSkeleton />;
}

function MinimalLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

// ============================================================================
// Gamification Components (Heavy - Framer Motion animations)
// ============================================================================

/**
 * Lazy-loaded AchievementAnimations component
 * Contains confetti particles, XP animations, and celebration effects
 */
export const LazyAchievementAnimations = dynamic(
  () => import('@/components/gamification/AchievementAnimations').then(mod => mod.AchievementToast),
  {
    loading: MinimalLoadingFallback,
    ssr: false, // Animations shouldn't run on server
  }
);

/**
 * Lazy-loaded StreakCelebration
 */
export const LazyStreakCelebration = dynamic(
  () => import('@/components/gamification/AchievementAnimations').then(mod => mod.StreakCelebration),
  {
    loading: MinimalLoadingFallback,
    ssr: false,
  }
);

/**
 * Lazy-loaded LevelUpCelebration
 */
export const LazyLevelUpCelebration = dynamic(
  () => import('@/components/gamification/AchievementAnimations').then(mod => mod.LevelUpCelebration),
  {
    loading: MinimalLoadingFallback,
    ssr: false,
  }
);

/**
 * Lazy-loaded XPGainAnimation
 */
export const LazyXPGainAnimation = dynamic(
  () => import('@/components/gamification/AchievementAnimations').then(mod => mod.XPGainAnimation),
  {
    loading: MinimalLoadingFallback,
    ssr: false,
  }
);

// ============================================================================
// Practice Components (Medium weight)
// ============================================================================

/**
 * Lazy-loaded GrammarExerciseCard
 */
export const LazyGrammarExerciseCard = dynamic(
  () => import('@/components/learn/GrammarExerciseCard').then(mod => mod.GrammarExerciseCard),
  {
    loading: CardLoadingFallback,
  }
);

// ============================================================================
// Dashboard Components (Heavy - multiple data fetches)
// ============================================================================

/**
 * Lazy-loaded RecommendationCard
 */
export const LazyRecommendationCard = dynamic(
  () => import('@/components/dashboard/RecommendationCard').then(mod => mod.RecommendationCard),
  {
    loading: CardLoadingFallback,
  }
);

// ============================================================================
// Utility: createLazyComponent helper
// ============================================================================

interface LazyComponentOptions<P> {
  /** Dynamic import function */
  importFn: () => Promise<{ default: ComponentType<P> }>;
  /** Loading fallback component */
  loading?: ComponentType;
  /** Whether to disable SSR */
  ssr?: boolean;
}

/**
 * Helper to create lazy-loaded components with consistent configuration
 * 
 * @example
 * ```tsx
 * const LazyHeavyChart = createLazyComponent({
 *   importFn: () => import('./HeavyChart'),
 *   loading: ChartSkeleton,
 *   ssr: false,
 * });
 * ```
 */
export function createLazyComponent<P extends object>({
  importFn,
  loading: LoadingComponent,
  ssr = true,
}: LazyComponentOptions<P>) {
  return dynamic(importFn, {
    loading: LoadingComponent ? () => <LoadingComponent /> : MinimalLoadingFallback,
    ssr,
  });
}

// ============================================================================
// Preload utilities
// ============================================================================

/**
 * Preload a component before it's needed
 * Useful for prefetching on hover or route prediction
 * 
 * @example
 * ```tsx
 * <button 
 *   onMouseEnter={() => preloadComponent(() => import('./HeavyModal'))}
 *   onClick={openModal}
 * >
 *   Open Heavy Modal
 * </button>
 * ```
 */
export function preloadComponent<T>(importFn: () => Promise<T>): void {
  void importFn();
}

/**
 * Preload achievement animations when user is close to earning one
 */
export function preloadAchievementAnimations(): void {
  void import('@/components/gamification/AchievementAnimations');
}

/**
 * Preload grammar components
 */
export function preloadGrammarComponents(): void {
  void import('@/components/learn/GrammarExerciseCard');
  void import('@/lib/grammar-engine');
}
