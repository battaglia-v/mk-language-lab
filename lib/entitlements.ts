/**
 * Entitlement System - Single Source of Truth for Pro Features
 * 
 * This module manages user subscription status across all platforms:
 * - Google Play (Android TWA)
 * - Stripe (Web - future)
 * - Manual grants (admin/promo)
 * 
 * RULES:
 * - No hard paywalls - users can always finish lessons, complete goals
 * - Soft-gating for premium features (native audio, advanced grammar, unlimited practice)
 * - Upsells only at positive moments (goal completion, streak milestones)
 */

// =====================================================
// TYPES
// =====================================================

export type SubscriptionSource = 'google_play' | 'stripe' | 'promo' | 'none';

export type SubscriptionTier = 'free' | 'pro';

export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface UserEntitlement {
  /** Whether user has Pro access */
  isPro: boolean;
  /** Subscription tier */
  tier: SubscriptionTier;
  /** Source of the subscription */
  source: SubscriptionSource;
  /** When the subscription expires (ISO string) */
  expiresAt: string | null;
  /** Whether in grace period (expired but still active) */
  inGracePeriod: boolean;
  /** Original purchase date */
  purchasedAt: string | null;
  /** Subscription period type */
  period: SubscriptionPeriod | null;
  /** Product ID from store */
  productId: string | null;
}

export interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  period: SubscriptionPeriod;
  /** Price in user's currency (display only) */
  displayPrice: string;
  /** Savings percentage for yearly */
  savingsPercent?: number;
}

// =====================================================
// PRODUCT DEFINITIONS
// =====================================================

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Full access, billed monthly',
    period: 'monthly',
    displayPrice: '$4.99/mo',
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    description: 'Full access, billed annually',
    period: 'yearly',
    displayPrice: '$35.99/yr',
    savingsPercent: 40,
  },
];

// =====================================================
// FEATURE FLAGS
// =====================================================

export interface ProFeature {
  id: string;
  name: string;
  description: string;
  /** Whether this feature requires Pro */
  requiresPro: boolean;
  /** Category for grouping */
  category: 'audio' | 'practice' | 'grammar' | 'content';
}

/**
 * Feature definitions - what's free vs Pro
 * 
 * FREE:
 * - TTS pronunciation
 * - Daily goal tracking
 * - Basic lessons
 * - News + Reader
 * - 10 practice sessions/day
 * 
 * PRO:
 * - Unlimited practice sessions
 * - Unlimited custom decks
 * - Full 30-Day Reading Challenge (days 6–30)
 */
export const FEATURES: ProFeature[] = [
  // FREE Features
  { id: 'tts_pronunciation', name: 'TTS Pronunciation', description: 'Text-to-speech for any word', requiresPro: false, category: 'audio' },
  { id: 'daily_goal', name: 'Daily Goal', description: 'Track your daily progress', requiresPro: false, category: 'practice' },
  { id: 'basic_lessons', name: 'Basic Lessons', description: 'Core Macedonian lessons', requiresPro: false, category: 'content' },
  { id: 'news_reader', name: 'News & Reader', description: 'Read Macedonian news', requiresPro: false, category: 'content' },
  { id: 'translator', name: 'Translator', description: 'Translate text', requiresPro: false, category: 'content' },
  { id: 'basic_practice', name: 'Basic Practice', description: '3 practice sessions/day', requiresPro: false, category: 'practice' },
  
  // PRO Features
  { id: 'unlimited_practice', name: 'Unlimited Practice', description: 'No daily practice limit', requiresPro: true, category: 'practice' },
  { id: 'custom_decks', name: 'Unlimited Custom Decks', description: 'Create unlimited vocabulary decks', requiresPro: true, category: 'practice' },
  { id: 'reading_challenge_full', name: 'Full Reading Challenge', description: 'Unlock days 6–30 in the 30-Day challenge', requiresPro: true, category: 'content' },
];

// =====================================================
// DAILY LIMITS FOR FREE TIER
// =====================================================

export const FREE_TIER_LIMITS = {
  /** Max practice sessions per day */
  dailyPracticeSessions: 3,
  /** Max custom decks */
  maxCustomDecks: 1,
  /** Max cards per custom deck */
  maxCardsPerDeck: 50,
  /** Free days in the 30-day reading challenge */
  readerChallengeFreeDays: 5,
};

// =====================================================
// UPSELL TRIGGERS
// =====================================================

export type UpsellTrigger = 
  | 'daily_goal_completed'
  | 'streak_milestone_3'
  | 'streak_milestone_7'
  | 'streak_milestone_14'
  | 'streak_milestone_30'
  | 'pro_feature_tapped'
  | 'practice_limit_reached';

export interface UpsellContext {
  trigger: UpsellTrigger;
  featureId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Check if an upsell should be shown based on trigger conditions
 * NEVER interrupt learning flow
 */
export function shouldShowUpsell(
  trigger: UpsellTrigger,
  entitlement: UserEntitlement,
  recentUpsellShownAt?: Date | null
): boolean {
  // Never show to Pro users
  if (entitlement.isPro) return false;
  
  // Respect cooldown (don't spam)
  if (recentUpsellShownAt) {
    const hoursSinceLastUpsell = (Date.now() - recentUpsellShownAt.getTime()) / (1000 * 60 * 60);
    
    // Different cooldowns for different triggers
    const cooldownHours: Record<UpsellTrigger, number> = {
      daily_goal_completed: 24, // Once per day max
      streak_milestone_3: 168, // Once per week
      streak_milestone_7: 168,
      streak_milestone_14: 168,
      streak_milestone_30: 168,
      pro_feature_tapped: 4, // Can show more often for explicit taps
      practice_limit_reached: 24,
    };
    
    if (hoursSinceLastUpsell < cooldownHours[trigger]) {
      return false;
    }
  }
  
  return true;
}

// =====================================================
// ENTITLEMENT CHECKING
// =====================================================

/**
 * Create a default free entitlement
 */
export function createFreeEntitlement(): UserEntitlement {
  return {
    isPro: false,
    tier: 'free',
    source: 'none',
    expiresAt: null,
    inGracePeriod: false,
    purchasedAt: null,
    period: null,
    productId: null,
  };
}

/**
 * Check if a specific feature is available for the user
 */
export function isFeatureAvailable(featureId: string, entitlement: UserEntitlement): boolean {
  const feature = FEATURES.find(f => f.id === featureId);
  if (!feature) return false;
  
  // Free features always available
  if (!feature.requiresPro) return true;
  
  // Pro features require subscription
  return entitlement.isPro;
}

/**
 * Check if user has exceeded daily practice limit
 */
export function hasExceededPracticeLimit(
  todayPracticeSessions: number,
  entitlement: UserEntitlement
): boolean {
  if (entitlement.isPro) return false;
  return todayPracticeSessions >= FREE_TIER_LIMITS.dailyPracticeSessions;
}

/**
 * Check if user can create more custom decks
 */
export function canCreateCustomDeck(
  currentDeckCount: number,
  entitlement: UserEntitlement
): boolean {
  if (entitlement.isPro) return true;
  return currentDeckCount < FREE_TIER_LIMITS.maxCustomDecks;
}

// =====================================================
// STORAGE KEYS
// =====================================================

const STORAGE_KEYS = {
  entitlement: 'mk_entitlement',
  lastUpsellShown: 'mk_last_upsell_shown',
  todayPracticeSessions: 'mk_today_practice_sessions',
  todayPracticeDate: 'mk_today_practice_date',
};

/**
 * Get cached entitlement from localStorage (client-side only)
 */
export function getCachedEntitlement(): UserEntitlement | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.entitlement);
    if (!cached) return null;
    
    const entitlement = JSON.parse(cached) as UserEntitlement;
    
    // Check if expired (excluding grace period)
    if (entitlement.expiresAt && !entitlement.inGracePeriod) {
      const expiresAt = new Date(entitlement.expiresAt);
      if (expiresAt < new Date()) {
        // Expired, return free entitlement
        return createFreeEntitlement();
      }
    }
    
    return entitlement;
  } catch {
    return null;
  }
}

/**
 * Cache entitlement to localStorage
 */
export function cacheEntitlement(entitlement: UserEntitlement): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.entitlement, JSON.stringify(entitlement));
  } catch {
    // Storage error - ignore
  }
}

/**
 * Get today's practice session count
 */
export function getTodayPracticeCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.todayPracticeDate);
    
    // Reset if it's a new day
    if (storedDate !== today) {
      localStorage.setItem(STORAGE_KEYS.todayPracticeDate, today);
      localStorage.setItem(STORAGE_KEYS.todayPracticeSessions, '0');
      return 0;
    }
    
    const count = localStorage.getItem(STORAGE_KEYS.todayPracticeSessions);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increment today's practice session count
 */
export function incrementPracticeCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const current = getTodayPracticeCount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.todayPracticeSessions, newCount.toString());
    return newCount;
  } catch {
    return 0;
  }
}

/**
 * Record when upsell was shown
 */
export function recordUpsellShown(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.lastUpsellShown, new Date().toISOString());
  } catch {
    // Ignore
  }
}

/**
 * Get last upsell shown timestamp
 */
export function getLastUpsellShown(): Date | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lastUpsellShown);
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
}
