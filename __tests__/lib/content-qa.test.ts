/**
 * Tests for the Content QA Grammar Validation System
 * 
 * @see lib/content-qa/grammar-rules.ts
 */

import { describe, it, expect } from 'vitest';
import {
  ADJECTIVE_DICTIONARY,
  NOUN_DICTIONARY,
  getExpectedAdjectiveForm,
  validateAdjectiveNounPair,
  getCorrectAdjectiveForm,
  isDefiniteNoun,
  detectNounGender,
  validateContent,
  RULE_ADJECTIVE_GENDER_AGREEMENT,
} from '@/lib/content-qa/grammar-rules';
import type { LinguisticMetadata } from '@/lib/content-qa/types';

describe('content-qa/grammar-rules', () => {
  describe('ADJECTIVE_DICTIONARY', () => {
    it('contains common Macedonian adjectives with all forms', () => {
      expect(ADJECTIVE_DICTIONARY['голем']).toBeDefined();
      expect(ADJECTIVE_DICTIONARY['голем'].mascSingIndef).toBe('голем');
      expect(ADJECTIVE_DICTIONARY['голем'].femSingIndef).toBe('голема');
      expect(ADJECTIVE_DICTIONARY['голем'].neutSingIndef).toBe('големо');
      expect(ADJECTIVE_DICTIONARY['голем'].pluralIndef).toBe('големи');
    });

    it('includes definite forms for adjectives', () => {
      expect(ADJECTIVE_DICTIONARY['голем'].mascSingDef).toBe('големиот');
      expect(ADJECTIVE_DICTIONARY['голем'].femSingDef).toBe('големата');
      expect(ADJECTIVE_DICTIONARY['голем'].neutSingDef).toBe('големото');
      expect(ADJECTIVE_DICTIONARY['голем'].pluralDef).toBe('големите');
    });
  });

  describe('NOUN_DICTIONARY', () => {
    it('contains feminine nouns with correct gender', () => {
      expect(NOUN_DICTIONARY['куќа']).toBeDefined();
      expect(NOUN_DICTIONARY['куќа'].gender).toBe('feminine');
      expect(NOUN_DICTIONARY['куќа'].definiteForm).toBe('куќата');
    });

    it('contains masculine nouns with correct gender', () => {
      expect(NOUN_DICTIONARY['човек']).toBeDefined();
      expect(NOUN_DICTIONARY['човек'].gender).toBe('masculine');
      expect(NOUN_DICTIONARY['човек'].definiteForm).toBe('човекот');
    });

    it('contains neuter nouns with correct gender', () => {
      expect(NOUN_DICTIONARY['дете']).toBeDefined();
      expect(NOUN_DICTIONARY['дете'].gender).toBe('neuter');
      expect(NOUN_DICTIONARY['дете'].definiteForm).toBe('детето');
    });
  });

  describe('getExpectedAdjectiveForm', () => {
    it('returns masculine singular indefinite form correctly', () => {
      expect(getExpectedAdjectiveForm('голем', 'masculine', 'singular', 'indefinite')).toBe('голем');
    });

    it('returns feminine singular indefinite form correctly', () => {
      expect(getExpectedAdjectiveForm('голем', 'feminine', 'singular', 'indefinite')).toBe('голема');
    });

    it('returns neuter singular indefinite form correctly', () => {
      expect(getExpectedAdjectiveForm('голем', 'neuter', 'singular', 'indefinite')).toBe('големо');
    });

    it('returns plural indefinite form correctly', () => {
      expect(getExpectedAdjectiveForm('голем', 'masculine', 'plural', 'indefinite')).toBe('големи');
    });

    it('returns definite forms correctly', () => {
      expect(getExpectedAdjectiveForm('голем', 'masculine', 'singular', 'definite')).toBe('големиот');
      expect(getExpectedAdjectiveForm('голем', 'feminine', 'singular', 'definite')).toBe('големата');
    });

    it('returns null for unknown adjectives', () => {
      expect(getExpectedAdjectiveForm('непознат', 'masculine', 'singular', 'indefinite')).toBeNull();
    });
  });

  describe('isDefiniteNoun', () => {
    it('detects masculine definite nouns', () => {
      expect(isDefiniteNoun('човекот')).toBe(true);
      expect(isDefiniteNoun('столот')).toBe(true);
    });

    it('detects feminine definite nouns', () => {
      expect(isDefiniteNoun('куќата')).toBe(true);
      expect(isDefiniteNoun('жената')).toBe(true);
    });

    it('detects neuter definite nouns', () => {
      expect(isDefiniteNoun('детето')).toBe(true);
      expect(isDefiniteNoun('селото')).toBe(true);
    });

    it('returns false for indefinite nouns', () => {
      expect(isDefiniteNoun('човек')).toBe(false);
      expect(isDefiniteNoun('куќа')).toBe(false);
      expect(isDefiniteNoun('дете')).toBe(false);
    });
  });

  describe('detectNounGender', () => {
    it('detects gender from dictionary', () => {
      expect(detectNounGender('куќа')).toBe('feminine');
      expect(detectNounGender('човек')).toBe('masculine');
      expect(detectNounGender('дете')).toBe('neuter');
    });
  });

  describe('validateContent', () => {
    it('validates correct adjective-noun agreement', () => {
      // In predicate position ("Куќата е голема"), adjective is indefinite
      // even though the noun is definite
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite', // For predicate adjectives, use indefinite
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голема',
          agreement: 'feminine_singular_indefinite',
        },
      };

      const result = validateContent(metadata);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('catches incorrect adjective-noun gender agreement', () => {
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite',
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голем', // Wrong - should be голема for feminine
          agreement: 'masculine_singular_indefinite',
        },
      };

      const result = validateContent(metadata);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].rule).toBe('adjective_agrees_with_noun_gender');
    });
  });

  describe('RULE_ADJECTIVE_GENDER_AGREEMENT', () => {
    it('passes when adjective matches feminine noun', () => {
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite',
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голема',
          agreement: 'feminine_singular_indefinite',
        },
      };

      const result = RULE_ADJECTIVE_GENDER_AGREEMENT.validate(metadata);
      expect(result.valid).toBe(true);
    });

    it('fails when masculine adjective used with feminine noun', () => {
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite',
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голем', // Wrong!
          agreement: 'masculine_singular_indefinite',
        },
      };

      const result = RULE_ADJECTIVE_GENDER_AGREEMENT.validate(metadata);
      expect(result.valid).toBe(false);
      expect(result.errors[0].expected).toBe('голема');
      expect(result.errors[0].actual).toBe('голем');
    });
  });

  describe('getCorrectAdjectiveForm', () => {
    it('returns correct feminine form for feminine noun', () => {
      const form = getCorrectAdjectiveForm('голем', 'куќа', false, false);
      expect(form).toBe('голема');
    });

    it('returns correct masculine form for masculine noun', () => {
      const form = getCorrectAdjectiveForm('голем', 'човек', false, false);
      expect(form).toBe('голем');
    });

    it('returns correct neuter form for neuter noun', () => {
      const form = getCorrectAdjectiveForm('голем', 'дете', false, false);
      expect(form).toBe('големо');
    });

    it('returns correct plural form', () => {
      const form = getCorrectAdjectiveForm('голем', 'куќа', false, true);
      expect(form).toBe('големи');
    });

    it('returns null for unknown nouns', () => {
      const form = getCorrectAdjectiveForm('голем', 'непозната', false, false);
      expect(form).toBeNull();
    });
  });

  describe('real-world example: куќата е голема', () => {
    it('validates the corrected example from the content audit', () => {
      // This test ensures our fix to grammar-lessons.json is correct
      // The sentence "Куќата е голема" (The house is big)
      // куќа = feminine noun, so adjective must be голема (not голем)
      // Note: In predicate position, adjective uses indefinite form
      
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite', // Predicate adjectives use indefinite form
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голема', // Correct feminine form
          agreement: 'feminine_singular_indefinite',
        },
      };

      const result = validateContent(metadata);
      expect(result.valid).toBe(true);
    });

    it('catches the bug that was in the original content', () => {
      // This was the bug: "Куќата е голем" - using masculine form
      const metadata: LinguisticMetadata = {
        noun: {
          lemma: 'kuka',
          lemmaCyrillic: 'куќа',
          gender: 'feminine',
          number: 'singular',
          definiteness: 'indefinite', // Predicate adjectives use indefinite form
        },
        adjective: {
          lemma: 'голем',
          lemmaCyrillic: 'голем',
          form: 'голем', // Bug: masculine form used with feminine noun
          agreement: 'masculine_singular_indefinite',
        },
      };

      const result = validateContent(metadata);
      expect(result.valid).toBe(false);
      expect(result.errors[0].suggestion).toContain('голема');
    });
  });
});
