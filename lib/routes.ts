/**
 * Centralized Route Definitions
 * 
 * This file contains all application routes in a single source of truth.
 * NEVER hardcode routes elsewhere - always import from this file.
 * 
 * @see /docs/ux-audit/01-route-audit.md
 */

/**
 * Base route paths (without locale prefix)
 * These are the canonical paths used throughout the application.
 */
export const ROUTES = {
  // Main navigation
  HOME: '/learn',
  LEARN: '/learn',
  TRANSLATE: '/translate',
  PRACTICE: '/practice',
  NEWS: '/news',
  RESOURCES: '/resources',
  PROFILE: '/profile',
  DISCOVER: '/discover',
  
  // Practice sub-routes
  PRACTICE_PRONUNCIATION: '/practice/pronunciation',
  PRACTICE_GRAMMAR: '/practice/grammar',
  PRACTICE_DECKS: '/practice/decks',
  
  // Authentication
  SIGN_IN: '/sign-in',
  AUTH_SIGNIN: '/auth/signin',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_SIGNOUT: '/auth/signout',
  AUTH_ERROR: '/auth/error',
  
  // Content pages
  ABOUT: '/about',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  
  // Other
  READER: '/reader',
  TASKS: '/tasks',
  NOTIFICATIONS: '/notifications',
  DAILY_LESSONS: '/daily-lessons',
  ONBOARDING: '/onboarding',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_DISCOVER: '/admin/discover',
  ADMIN_WORD_OF_THE_DAY: '/admin/word-of-the-day',
  ADMIN_PRACTICE_AUDIO: '/admin/practice-audio',
  ADMIN_PRACTICE_VOCABULARY: '/admin/practice-vocabulary',
} as const;

/**
 * Route type for type-safe route checking
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Build a localized href with proper locale prefix
 * 
 * @param locale - The current locale (e.g., 'en', 'mk')
 * @param path - The route path from ROUTES constant
 * @returns Fully qualified localized path
 * 
 * @example
 * buildLocalizedRoute('en', ROUTES.PRACTICE) // '/en/practice'
 * buildLocalizedRoute('mk', ROUTES.NEWS) // '/mk/news'
 */
export function buildLocalizedRoute(locale: string, path: RoutePath | string): string {
  // Handle root/home case
  if (path === '/' || path === '') {
    return `/${locale}`;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `/${locale}${normalizedPath}`;
}

/**
 * Quest category to route mapping
 * Used by QuestsSection to link to appropriate destinations
 */
export const QUEST_CATEGORY_ROUTES: Record<string, RoutePath> = {
  practice: ROUTES.PRACTICE,
  translation: ROUTES.TRANSLATE,
  social: ROUTES.DISCOVER,
  lesson: ROUTES.LEARN,
  pronunciation: ROUTES.PRACTICE_PRONUNCIATION,
  grammar: ROUTES.PRACTICE_GRAMMAR,
  reading: ROUTES.NEWS,
  vocabulary: ROUTES.PRACTICE,
};

/**
 * Get the appropriate route for a quest category
 * Falls back to PRACTICE if category is unknown
 */
export function getQuestRoute(category: string): RoutePath {
  return QUEST_CATEGORY_ROUTES[category] ?? ROUTES.PRACTICE;
}

/**
 * Validate that a route exists in the application
 * Useful for runtime checks in development
 */
export function isValidRoute(path: string): boolean {
  const routes = Object.values(ROUTES) as string[];
  // Check exact match or if it's a dynamic route
  return routes.some(route => 
    path === route || 
    path.startsWith(route + '/') ||
    // Handle dynamic segments
    route.includes('[') && path.match(new RegExp(route.replace(/\[.*?\]/g, '[^/]+')))
  );
}

/**
 * External links used across the app
 */
export const EXTERNAL_LINKS = {
  INSTAGRAM: 'https://www.instagram.com/macedonianlanguagecorner/',
  YOUTUBE: 'https://www.youtube.com/@macedonianlanguagecorner',
  LINKTREE: 'https://linktr.ee/macedonianlanguagecorner',
  MAIN_SITE: 'https://macedonianlanguagecorner.com',
  LINKEDIN: 'https://www.linkedin.com/in/vincentvinnybattaglia/',
} as const;

