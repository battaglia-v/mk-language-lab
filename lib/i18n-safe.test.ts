/**
 * Unit tests for i18n-safe translation wrapper
 */

import { describe, it, expect, vi } from 'vitest';
import {
  looksLikeTranslationKey,
  createSafeT,
  validateTranslation,
} from './i18n-safe';

describe('looksLikeTranslationKey', () => {
  it('detects simple translation keys', () => {
    expect(looksLikeTranslationKey('translate.history')).toBe(true);
    expect(looksLikeTranslationKey('nav.home')).toBe(true);
    expect(looksLikeTranslationKey('common.error')).toBe(true);
  });

  it('detects nested translation keys', () => {
    expect(looksLikeTranslationKey('translate.errors.generic')).toBe(true);
    expect(looksLikeTranslationKey('home.hero.title')).toBe(true);
  });

  it('rejects normal text', () => {
    expect(looksLikeTranslationKey('Hello World')).toBe(false);
    expect(looksLikeTranslationKey('This is a sentence.')).toBe(false);
    expect(looksLikeTranslationKey('User clicked button')).toBe(false);
  });

  it('rejects empty strings', () => {
    expect(looksLikeTranslationKey('')).toBe(false);
  });

  it('rejects very long strings', () => {
    const longKey = 'a'.repeat(150);
    expect(looksLikeTranslationKey(longKey)).toBe(false);
  });

  it('rejects strings starting with numbers or uppercase', () => {
    expect(looksLikeTranslationKey('1translate.key')).toBe(false);
    expect(looksLikeTranslationKey('Translate.key')).toBe(false);
  });
});

describe('createSafeT', () => {
  it('returns translation when key exists', () => {
    const mockT = vi.fn().mockReturnValue('Translated text');
    const tSafe = createSafeT(mockT, 'namespace');

    const result = tSafe('someKey', { default: 'Fallback' });

    expect(result).toBe('Translated text');
    expect(mockT).toHaveBeenCalledWith('someKey', {});
  });

  it('returns fallback when translation looks like a key', () => {
    const mockT = vi.fn().mockReturnValue('translate.missingKey');
    const tSafe = createSafeT(mockT, 'translate');

    const result = tSafe('missingKey', { default: 'Fallback text' });

    expect(result).toBe('Fallback text');
  });

  it('returns fallback when translation equals the key', () => {
    const mockT = vi.fn().mockReturnValue('missingKey');
    const tSafe = createSafeT(mockT, 'namespace');

    const result = tSafe('missingKey', { default: 'Fallback' });

    expect(result).toBe('Fallback');
  });

  it('returns empty string when no fallback provided and key missing', () => {
    const mockT = vi.fn().mockReturnValue('namespace.missing');
    const tSafe = createSafeT(mockT);

    const result = tSafe('missing');

    expect(result).toBe('');
  });

  it('passes values to translation function', () => {
    const mockT = vi.fn().mockReturnValue('Hello John');
    const tSafe = createSafeT(mockT);

    tSafe('greeting', { name: 'John', default: 'Hi' });

    expect(mockT).toHaveBeenCalledWith('greeting', { name: 'John' });
  });

  it('handles translation function throwing error', () => {
    const mockT = vi.fn().mockImplementation(() => {
      throw new Error('Translation error');
    });
    const tSafe = createSafeT(mockT);

    const result = tSafe('someKey', { default: 'Error fallback' });

    expect(result).toBe('Error fallback');
  });
});

describe('validateTranslation', () => {
  it('returns valid for good translations', () => {
    const mockT = vi.fn().mockReturnValue('Translated text');

    const result = validateTranslation(mockT, 'goodKey', 'namespace');

    expect(result.valid).toBe(true);
    expect(result.result).toBe('Translated text');
    expect(result.error).toBeUndefined();
  });

  it('returns invalid when translation looks like key', () => {
    const mockT = vi.fn().mockReturnValue('namespace.badKey');

    const result = validateTranslation(mockT, 'badKey', 'namespace');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing translation');
  });

  it('returns invalid when translation equals key', () => {
    const mockT = vi.fn().mockReturnValue('badKey');

    const result = validateTranslation(mockT, 'badKey');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing translation');
  });

  it('handles errors from translation function', () => {
    const mockT = vi.fn().mockImplementation(() => {
      throw new Error('Crash');
    });

    const result = validateTranslation(mockT, 'errorKey', 'namespace');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Error translating');
  });
});
