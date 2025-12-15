/**
 * Content QA Schema Types
 * 
 * Authoritative source of truth for all learning content validation.
 * Ensures grammatical correctness and prevents issues like:
 * "kukata e golem" ❌ → "kukata e golema" ✅
 */

// ==================== Core Grammar Types ====================

export type Gender = 'masculine' | 'feminine' | 'neuter';
export type GrammaticalNumber = 'singular' | 'plural';
export type Definiteness = 'definite' | 'indefinite';
export type Person = '1st' | '2nd' | '3rd';
export type Tense = 'present' | 'past' | 'future' | 'aorist' | 'imperfect';
export type Case = 'nominative' | 'accusative' | 'dative' | 'vocative';

export type ContentFeature = 
  | 'lesson' 
  | 'grammar' 
  | 'quick_practice' 
  | 'reader' 
  | 'flashcard'
  | 'vocabulary';

// ==================== Linguistic Metadata ====================

export interface NounMetadata {
  /** Dictionary form (nominative singular) */
  lemma: string;
  /** Cyrillic form */
  lemmaCyrillic: string;
  /** Grammatical gender */
  gender: Gender;
  /** Singular or plural */
  number: GrammaticalNumber;
  /** Whether definite article is applied */
  definiteness: Definiteness;
  /** Optional: the full inflected form */
  inflectedForm?: string;
}

export interface AdjectiveMetadata {
  /** Dictionary form (masculine singular indefinite) */
  lemma: string;
  /** Cyrillic form */
  lemmaCyrillic: string;
  /** The actual form used in the sentence */
  form: string;
  /** What the adjective agrees with */
  agreement: AgreementType;
}

export interface VerbMetadata {
  /** Dictionary form (1st person singular present or infinitive) */
  lemma: string;
  /** Cyrillic form */
  lemmaCyrillic: string;
  /** Grammatical tense */
  tense: Tense;
  /** Person (1st, 2nd, 3rd) */
  person: Person;
  /** Singular or plural */
  number: GrammaticalNumber;
  /** The conjugated form used */
  conjugatedForm: string;
}

export type AgreementType = 
  | 'masculine_singular_indefinite'
  | 'masculine_singular_definite'
  | 'masculine_plural_indefinite'
  | 'masculine_plural_definite'
  | 'feminine_singular_indefinite'
  | 'feminine_singular_definite'
  | 'feminine_plural_indefinite'
  | 'feminine_plural_definite'
  | 'neuter_singular_indefinite'
  | 'neuter_singular_definite'
  | 'neuter_plural_indefinite'
  | 'neuter_plural_definite';

export interface LinguisticMetadata {
  /** Noun information (if applicable) */
  noun?: NounMetadata;
  /** Adjective information (if applicable) */
  adjective?: AdjectiveMetadata;
  /** Verb information (if applicable) */
  verb?: VerbMetadata;
  /** Additional notes for reviewers */
  notes?: string;
}

// ==================== Grammar Rules ====================

export type GrammarRuleId = 
  | 'adjective_agrees_with_noun_gender'
  | 'adjective_agrees_with_noun_number'
  | 'definiteness_suffix_rule'
  | 'verb_agrees_with_subject_number'
  | 'verb_agrees_with_subject_person'
  | 'possessive_agrees_with_noun'
  | 'numeral_agreement_rule';

export interface GrammarRule {
  id: GrammarRuleId;
  name: string;
  description: string;
  validate: (metadata: LinguisticMetadata) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: GrammarRuleId;
  message: string;
  expected: string;
  actual: string;
  suggestion: string;
}

export interface ValidationWarning {
  rule: GrammarRuleId;
  message: string;
  suggestion?: string;
}

// ==================== Content Item Schema ====================

export interface ValidatedContentItem {
  /** Unique identifier */
  id: string;
  /** Which feature this content belongs to */
  feature: ContentFeature;
  /** Language code */
  language: 'mk';
  /** English prompt/question */
  promptEn: string;
  /** Macedonian prompt/question */
  promptMk: string;
  /** The correct answer */
  correctAnswer: string;
  /** Alternative acceptable answers (must all pass validation) */
  acceptableAnswers: string[];
  /** Linguistic metadata for validation */
  linguisticMetadata: LinguisticMetadata;
  /** List of grammar rules that were applied */
  grammarRulesApplied: GrammarRuleId[];
  /** Whether this content has been validated */
  validated: boolean;
  /** Last review date */
  lastReviewed: string;
  /** Who reviewed it (optional) */
  reviewedBy?: string;
}

// ==================== Content Audit Types ====================

export interface ContentAuditEntry {
  feature: string;
  contentId: string;
  sentence: string;
  currentAnswer: string;
  correctAnswer: string;
  issue: string;
  grammarRule: GrammarRuleId;
  fixApplied: boolean;
  notes?: string;
}

export interface ContentAuditReport {
  timestamp: string;
  totalItemsScanned: number;
  issuesFound: number;
  issuesFixed: number;
  entries: ContentAuditEntry[];
}

// ==================== Adjective Forms Dictionary ====================

/**
 * Macedonian adjective endings by gender/number/definiteness
 */
export interface AdjectiveParadigm {
  /** Masculine singular indefinite (base form) */
  mascSingIndef: string;
  /** Masculine singular definite (-от) */
  mascSingDef: string;
  /** Feminine singular indefinite (-а) */
  femSingIndef: string;
  /** Feminine singular definite (-та) */
  femSingDef: string;
  /** Neuter singular indefinite (-о) */
  neutSingIndef: string;
  /** Neuter singular definite (-то) */
  neutSingDef: string;
  /** Plural indefinite (-и) */
  pluralIndef: string;
  /** Plural definite (-те) */
  pluralDef: string;
}

/**
 * Common Macedonian adjectives with all forms
 */
export type AdjectiveDictionary = Record<string, AdjectiveParadigm>;
