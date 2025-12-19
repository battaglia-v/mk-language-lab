/**
 * Safe translation utilities to prevent raw i18n keys from appearing in the UI.
 *
 * This module provides:
 * - tSafe: A wrapper that detects and logs missing translation keys
 * - Translation key validation utilities for build-time checks
 */

const RAW_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+$/;

/**
 * Check if a string looks like an unresolved translation key
 */
export function looksLikeTranslationKey(value: string): boolean {
  // Common patterns for translation keys: "namespace.key", "namespace.nested.key"
  if (!value || value.length > 100) return false;
  return RAW_KEY_PATTERN.test(value);
}

/**
 * Log a missing translation key (works in both dev and prod)
 */
function logMissingKey(key: string, namespace?: string) {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  const message = `[i18n] Missing translation key: "${fullKey}"`;

  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  } else {
    // In production, we still want to track these for monitoring
    console.error(message);
  }
}

type TranslateFunction = (key: string, values?: Record<string, unknown>) => string;

/**
 * Create a safe translation function that never returns raw keys.
 *
 * @param t - The translation function from useTranslations or getTranslations
 * @param namespace - Optional namespace for logging purposes
 * @returns A wrapped translation function that validates output
 *
 * @example
 * const t = useTranslations('translate');
 * const tSafe = createSafeT(t, 'translate');
 *
 * // Instead of risking raw keys:
 * // t('someKey') might return 'translate.someKey'
 *
 * // Use tSafe with a fallback:
 * tSafe('someKey', { default: 'Some Label' })
 */
export function createSafeT(t: TranslateFunction, namespace?: string) {
  return function tSafe(
    key: string,
    valuesOrOptions?: Record<string, unknown> & { default?: string }
  ): string {
    const { default: fallback, ...values } = valuesOrOptions ?? {};

    try {
      const result = t(key, values);

      // Check if the result looks like an unresolved key
      if (looksLikeTranslationKey(result)) {
        logMissingKey(key, namespace);
        return fallback ?? '';
      }

      // Check if the result equals the key (another sign of missing translation)
      const fullKey = namespace ? `${namespace}.${key}` : key;
      if (result === key || result === fullKey) {
        logMissingKey(key, namespace);
        return fallback ?? '';
      }

      return result;
    } catch (error) {
      logMissingKey(key, namespace);
      return fallback ?? '';
    }
  };
}

/**
 * Validate that a translation exists and doesn't return a raw key.
 * Useful for build-time or test-time validation.
 */
export function validateTranslation(
  t: TranslateFunction,
  key: string,
  namespace?: string
): { valid: boolean; result: string; error?: string } {
  try {
    const result = t(key);
    const fullKey = namespace ? `${namespace}.${key}` : key;

    if (looksLikeTranslationKey(result) || result === key || result === fullKey) {
      return {
        valid: false,
        result,
        error: `Missing translation for key: ${fullKey}`,
      };
    }

    return { valid: true, result };
  } catch (error) {
    return {
      valid: false,
      result: '',
      error: `Error translating key: ${namespace ? `${namespace}.${key}` : key}`,
    };
  }
}

/**
 * Hook helper for client components - wraps useTranslations result
 */
export function useSafeTranslations(namespace: string) {
  // This is a helper type for documentation - actual usage requires importing useTranslations
  return { namespace, createSafeT };
}

/**
 * Extract all translation keys used in a component (for static analysis)
 * This is a marker function for build-time tooling
 */
export function declareUsedKeys(_keys: string[]): void {
  // No-op at runtime - used by static analysis tools
}
