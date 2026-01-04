/**
 * Centralized App Metadata & Branding
 *
 * Single source of truth for app naming across:
 * - Google Play Store
 * - PWA manifest
 * - TWA configuration
 * - In-app headers/navigation
 *
 * Rules:
 * - Store names: No emojis, ≤30 characters
 * - In-app: Use i18n keys for localized display names
 */

export const APP_META = {
  /**
   * Canonical app name for stores (Google Play, App Store)
   * Must be: No emojis, ≤30 characters, professional
   */
  storeName: 'Macedonian Language Lab',

  /**
   * Short name for app icons, home screen (≤12 chars ideal)
   */
  shortName: 'MK Language',

  /**
   * Internal ID / package identifier
   */
  packageId: 'com.mklanguage.app',

  /**
   * Description for stores
   */
  description: 'Learn Macedonian with AI-powered tutoring, translation, and interactive lessons',

  /**
   * URL
   */
  url: 'https://mklanguage.com',

  /**
   * Version
   */
  version: '1.0.0',

  /**
   * i18n keys for localized display names
   * Use these in components via useTranslations('app')
   *
   * English: "Macedonian Language Lab"
   * Macedonian: "Македонски јазик"
   */
  i18nKeys: {
    displayName: 'app.displayName',
    shortName: 'app.shortName',
    tagline: 'app.tagline',
  },
} as const;

/**
 * Brand colors for icon/asset generation
 */
export const BRAND_COLORS = {
  // Primary accent - Macedonian gold
  primary: '#F6D83B',
  primaryDark: '#D4A800',

  // Secondary - Macedonian red
  secondary: '#E94D4D',
  secondaryDark: '#C73B3B',

  // Background options
  backgroundDark: '#0C0E12',
  backgroundLight: '#F5F7FA',

  // Text
  textOnDark: '#F2F5FA',
  textOnLight: '#121820',
} as const;

/**
 * Get the app display name for a given locale
 * Fallback for cases where i18n isn't available
 */
export function getAppDisplayName(locale: 'en' | 'mk' = 'en'): string {
  return locale === 'mk' ? 'Македонски јазик' : 'Macedonian Language Lab';
}

/**
 * Get the short name for a given locale
 */
export function getAppShortName(locale: 'en' | 'mk' = 'en'): string {
  return locale === 'mk' ? 'Македонски' : 'MK Language';
}
