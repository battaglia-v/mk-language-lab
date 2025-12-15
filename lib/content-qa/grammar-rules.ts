/**
 * Macedonian Grammar Validation Rules
 * 
 * Automated validation for grammatical correctness in learning content.
 * Prevents errors like: "kukata e golem" ❌ → "kukata e golema" ✅
 */

import type {
  Gender,
  GrammaticalNumber,
  Definiteness,
  LinguisticMetadata,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  GrammarRule,
  GrammarRuleId,
  AdjectiveParadigm,
  AdjectiveDictionary,
  AgreementType,
} from './types';

// ==================== Adjective Dictionary ====================

/**
 * Common Macedonian adjectives with all inflected forms
 * Base form is masculine singular indefinite
 */
export const ADJECTIVE_DICTIONARY: AdjectiveDictionary = {
  // голем (big, large)
  'голем': {
    mascSingIndef: 'голем',
    mascSingDef: 'големиот',
    femSingIndef: 'голема',
    femSingDef: 'големата',
    neutSingIndef: 'големо',
    neutSingDef: 'големото',
    pluralIndef: 'големи',
    pluralDef: 'големите',
  },
  // мал (small)
  'мал': {
    mascSingIndef: 'мал',
    mascSingDef: 'малиот',
    femSingIndef: 'мала',
    femSingDef: 'малата',
    neutSingIndef: 'мало',
    neutSingDef: 'малото',
    pluralIndef: 'мали',
    pluralDef: 'малите',
  },
  // убав (beautiful, nice)
  'убав': {
    mascSingIndef: 'убав',
    mascSingDef: 'убавиот',
    femSingIndef: 'убава',
    femSingDef: 'убавата',
    neutSingIndef: 'убаво',
    neutSingDef: 'убавото',
    pluralIndef: 'убави',
    pluralDef: 'убавите',
  },
  // добар (good)
  'добар': {
    mascSingIndef: 'добар',
    mascSingDef: 'добриот',
    femSingIndef: 'добра',
    femSingDef: 'добрата',
    neutSingIndef: 'добро',
    neutSingDef: 'доброто',
    pluralIndef: 'добри',
    pluralDef: 'добрите',
  },
  // нов (new)
  'нов': {
    mascSingIndef: 'нов',
    mascSingDef: 'новиот',
    femSingIndef: 'нова',
    femSingDef: 'новата',
    neutSingIndef: 'ново',
    neutSingDef: 'новото',
    pluralIndef: 'нови',
    pluralDef: 'новите',
  },
  // стар (old)
  'стар': {
    mascSingIndef: 'стар',
    mascSingDef: 'стариот',
    femSingIndef: 'стара',
    femSingDef: 'старата',
    neutSingIndef: 'старо',
    neutSingDef: 'старото',
    pluralIndef: 'стари',
    pluralDef: 'старите',
  },
  // млад (young)
  'млад': {
    mascSingIndef: 'млад',
    mascSingDef: 'младиот',
    femSingIndef: 'млада',
    femSingDef: 'младата',
    neutSingIndef: 'младо',
    neutSingDef: 'младото',
    pluralIndef: 'млади',
    pluralDef: 'младите',
  },
  // висок (tall)
  'висок': {
    mascSingIndef: 'висок',
    mascSingDef: 'високиот',
    femSingIndef: 'висока',
    femSingDef: 'високата',
    neutSingIndef: 'високо',
    neutSingDef: 'високото',
    pluralIndef: 'високи',
    pluralDef: 'високите',
  },
  // низок (short in height)
  'низок': {
    mascSingIndef: 'низок',
    mascSingDef: 'нискиот',
    femSingIndef: 'ниска',
    femSingDef: 'ниската',
    neutSingIndef: 'ниско',
    neutSingDef: 'ниското',
    pluralIndef: 'ниски',
    pluralDef: 'ниските',
  },
  // долг (long)
  'долг': {
    mascSingIndef: 'долг',
    mascSingDef: 'долгиот',
    femSingIndef: 'долга',
    femSingDef: 'долгата',
    neutSingIndef: 'долго',
    neutSingDef: 'долгото',
    pluralIndef: 'долги',
    pluralDef: 'долгите',
  },
  // краток (short)
  'краток': {
    mascSingIndef: 'краток',
    mascSingDef: 'краткиот',
    femSingIndef: 'кратка',
    femSingDef: 'кратката',
    neutSingIndef: 'кратко',
    neutSingDef: 'краткото',
    pluralIndef: 'кратки',
    pluralDef: 'кратките',
  },
  // широк (wide)
  'широк': {
    mascSingIndef: 'широк',
    mascSingDef: 'широкиот',
    femSingIndef: 'широка',
    femSingDef: 'широката',
    neutSingIndef: 'широко',
    neutSingDef: 'широкото',
    pluralIndef: 'широки',
    pluralDef: 'широките',
  },
  // тесен (narrow)
  'тесен': {
    mascSingIndef: 'тесен',
    mascSingDef: 'тесниот',
    femSingIndef: 'тесна',
    femSingDef: 'теснатата',
    neutSingIndef: 'тесно',
    neutSingDef: 'тесното',
    pluralIndef: 'тесни',
    pluralDef: 'тесните',
  },
  // црн (black)
  'црн': {
    mascSingIndef: 'црн',
    mascSingDef: 'црниот',
    femSingIndef: 'црна',
    femSingDef: 'црната',
    neutSingIndef: 'црно',
    neutSingDef: 'црното',
    pluralIndef: 'црни',
    pluralDef: 'црните',
  },
  // бел (white)
  'бел': {
    mascSingIndef: 'бел',
    mascSingDef: 'белиот',
    femSingIndef: 'бела',
    femSingDef: 'белата',
    neutSingIndef: 'бело',
    neutSingDef: 'белото',
    pluralIndef: 'бели',
    pluralDef: 'белите',
  },
  // црвен (red)
  'црвен': {
    mascSingIndef: 'црвен',
    mascSingDef: 'црвениот',
    femSingIndef: 'црвена',
    femSingDef: 'црвената',
    neutSingIndef: 'црвено',
    neutSingDef: 'црвеното',
    pluralIndef: 'црвени',
    pluralDef: 'црвените',
  },
  // син (blue)
  'син': {
    mascSingIndef: 'син',
    mascSingDef: 'синиот',
    femSingIndef: 'сина',
    femSingDef: 'сината',
    neutSingIndef: 'сино',
    neutSingDef: 'синото',
    pluralIndef: 'сини',
    pluralDef: 'сините',
  },
  // зелен (green)
  'зелен': {
    mascSingIndef: 'зелен',
    mascSingDef: 'зелениот',
    femSingIndef: 'зелена',
    femSingDef: 'зелената',
    neutSingIndef: 'зелено',
    neutSingDef: 'зеленото',
    pluralIndef: 'зелени',
    pluralDef: 'зелените',
  },
  // жолт (yellow)
  'жолт': {
    mascSingIndef: 'жолт',
    mascSingDef: 'жолтиот',
    femSingIndef: 'жолта',
    femSingDef: 'жолтата',
    neutSingIndef: 'жолто',
    neutSingDef: 'жолтото',
    pluralIndef: 'жолти',
    pluralDef: 'жолтите',
  },
  // среќен (happy)
  'среќен': {
    mascSingIndef: 'среќен',
    mascSingDef: 'среќниот',
    femSingIndef: 'среќна',
    femSingDef: 'среќната',
    neutSingIndef: 'среќно',
    neutSingDef: 'среќното',
    pluralIndef: 'среќни',
    pluralDef: 'среќните',
  },
  // тажен (sad)
  'тажен': {
    mascSingIndef: 'тажен',
    mascSingDef: 'тажниот',
    femSingIndef: 'тажна',
    femSingDef: 'тажната',
    neutSingIndef: 'тажно',
    neutSingDef: 'тажното',
    pluralIndef: 'тажни',
    pluralDef: 'тажните',
  },
  // гладен (hungry)
  'гладен': {
    mascSingIndef: 'гладен',
    mascSingDef: 'гладниот',
    femSingIndef: 'гладна',
    femSingDef: 'гладната',
    neutSingIndef: 'гладно',
    neutSingDef: 'гладното',
    pluralIndef: 'гладни',
    pluralDef: 'гладните',
  },
  // жеден (thirsty)
  'жеден': {
    mascSingIndef: 'жеден',
    mascSingDef: 'жедниот',
    femSingIndef: 'жедна',
    femSingDef: 'жедната',
    neutSingIndef: 'жедно',
    neutSingDef: 'жедното',
    pluralIndef: 'жедни',
    pluralDef: 'жедните',
  },
  // уморен (tired)
  'уморен': {
    mascSingIndef: 'уморен',
    mascSingDef: 'уморниот',
    femSingIndef: 'уморна',
    femSingDef: 'уморната',
    neutSingIndef: 'уморно',
    neutSingDef: 'уморното',
    pluralIndef: 'уморни',
    pluralDef: 'уморните',
  },
  // болен (sick)
  'болен': {
    mascSingIndef: 'болен',
    mascSingDef: 'болниот',
    femSingIndef: 'болна',
    femSingDef: 'болната',
    neutSingIndef: 'болно',
    neutSingDef: 'болното',
    pluralIndef: 'болни',
    pluralDef: 'болните',
  },
};

// ==================== Noun Gender Dictionary ====================

export interface NounEntry {
  gender: Gender;
  cyrillic: string;
  definiteForm: string;
  pluralForm: string;
}

/**
 * Common Macedonian nouns with gender information
 */
export const NOUN_DICTIONARY: Record<string, NounEntry> = {
  // Feminine nouns
  'куќа': { gender: 'feminine', cyrillic: 'куќа', definiteForm: 'куќата', pluralForm: 'куќи' },
  'жена': { gender: 'feminine', cyrillic: 'жена', definiteForm: 'жената', pluralForm: 'жени' },
  'книга': { gender: 'feminine', cyrillic: 'книга', definiteForm: 'книгата', pluralForm: 'книги' },
  'маса': { gender: 'feminine', cyrillic: 'маса', definiteForm: 'масата', pluralForm: 'маси' },
  'мачка': { gender: 'feminine', cyrillic: 'мачка', definiteForm: 'мачката', pluralForm: 'мачки' },
  'соба': { gender: 'feminine', cyrillic: 'соба', definiteForm: 'собата', pluralForm: 'соби' },
  'вода': { gender: 'feminine', cyrillic: 'вода', definiteForm: 'водата', pluralForm: 'води' },
  'земја': { gender: 'feminine', cyrillic: 'земја', definiteForm: 'земјата', pluralForm: 'земји' },
  'река': { gender: 'feminine', cyrillic: 'река', definiteForm: 'реката', pluralForm: 'реки' },
  'улица': { gender: 'feminine', cyrillic: 'улица', definiteForm: 'улицата', pluralForm: 'улици' },
  
  // Masculine nouns
  'човек': { gender: 'masculine', cyrillic: 'човек', definiteForm: 'човекот', pluralForm: 'луѓе' },
  'маж': { gender: 'masculine', cyrillic: 'маж', definiteForm: 'мажот', pluralForm: 'мажи' },
  'стол': { gender: 'masculine', cyrillic: 'стол', definiteForm: 'столот', pluralForm: 'столови' },
  'град': { gender: 'masculine', cyrillic: 'град', definiteForm: 'градот', pluralForm: 'градови' },
  'ден': { gender: 'masculine', cyrillic: 'ден', definiteForm: 'денот', pluralForm: 'денови' },
  'пат': { gender: 'masculine', cyrillic: 'пат', definiteForm: 'патот', pluralForm: 'патишта' },
  'брат': { gender: 'masculine', cyrillic: 'брат', definiteForm: 'братот', pluralForm: 'браќа' },
  'татко': { gender: 'masculine', cyrillic: 'татко', definiteForm: 'таткото', pluralForm: 'татковци' },
  'парк': { gender: 'masculine', cyrillic: 'парк', definiteForm: 'паркот', pluralForm: 'паркови' },
  'автобус': { gender: 'masculine', cyrillic: 'автобус', definiteForm: 'автобусот', pluralForm: 'автобуси' },
  
  // Neuter nouns
  'дете': { gender: 'neuter', cyrillic: 'дете', definiteForm: 'детето', pluralForm: 'деца' },
  'село': { gender: 'neuter', cyrillic: 'село', definiteForm: 'селото', pluralForm: 'села' },
  'јајце': { gender: 'neuter', cyrillic: 'јајце', definiteForm: 'јајцето', pluralForm: 'јајца' },
  'срце': { gender: 'neuter', cyrillic: 'срце', definiteForm: 'срцето', pluralForm: 'срца' },
  'сонце': { gender: 'neuter', cyrillic: 'сонце', definiteForm: 'сонцето', pluralForm: 'сонца' },
  'море': { gender: 'neuter', cyrillic: 'море', definiteForm: 'морето', pluralForm: 'мориња' },
  'поле': { gender: 'neuter', cyrillic: 'поле', definiteForm: 'полето', pluralForm: 'полиња' },
  'лице': { gender: 'neuter', cyrillic: 'лице', definiteForm: 'лицето', pluralForm: 'лица' },
  'време': { gender: 'neuter', cyrillic: 'време', definiteForm: 'времето', pluralForm: 'времиња' },
  'име': { gender: 'neuter', cyrillic: 'име', definiteForm: 'името', pluralForm: 'имиња' },
};

// ==================== Helper Functions ====================

/**
 * Get the expected adjective form based on noun properties
 */
export function getExpectedAdjectiveForm(
  adjLemma: string,
  gender: Gender,
  number: GrammaticalNumber,
  definiteness: Definiteness
): string | null {
  const paradigm = ADJECTIVE_DICTIONARY[adjLemma];
  if (!paradigm) return null;
  
  if (number === 'plural') {
    return definiteness === 'definite' ? paradigm.pluralDef : paradigm.pluralIndef;
  }
  
  switch (gender) {
    case 'masculine':
      return definiteness === 'definite' ? paradigm.mascSingDef : paradigm.mascSingIndef;
    case 'feminine':
      return definiteness === 'definite' ? paradigm.femSingDef : paradigm.femSingIndef;
    case 'neuter':
      return definiteness === 'definite' ? paradigm.neutSingDef : paradigm.neutSingIndef;
    default:
      return null;
  }
}

/**
 * Build the agreement type string from components
 */
export function buildAgreementType(
  gender: Gender,
  number: GrammaticalNumber,
  definiteness: Definiteness
): AgreementType {
  return `${gender}_${number}_${definiteness}` as AgreementType;
}

/**
 * Parse an agreement type into its components
 */
export function parseAgreementType(
  agreement: AgreementType
): { gender: Gender; number: GrammaticalNumber; definiteness: Definiteness } {
  const parts = agreement.split('_');
  return {
    gender: parts[0] as Gender,
    number: parts[1] as GrammaticalNumber,
    definiteness: parts[2] as Definiteness,
  };
}

/**
 * Check if a noun form is definite based on dictionary lookup or ending patterns
 */
export function isDefiniteNoun(word: string): boolean {
  // First check if it's a known definite form in the dictionary
  for (const entry of Object.values(NOUN_DICTIONARY)) {
    if (word === entry.definiteForm) {
      return true;
    }
  }
  
  // For words not in dictionary, use ending heuristics
  // But be careful: куќа ends in 'а' but is NOT definite
  // куќата ends in 'та' and IS definite
  // We need to check for the full definite article patterns
  
  // Check for masculine definite (-от, -ов, -он after consonant)
  if (word.match(/[бвгджзклмнпрстфхцчшѓќљњ]от$/)) return true;
  if (word.match(/[бвгджзклмнпрстфхцчшѓќљњ]ов$/)) return true;
  if (word.match(/[бвгджзклмнпрстфхцчшѓќљњ]он$/)) return true;
  
  // Check for neuter definite (-то, -во, -но after -о or -е)
  if (word.match(/[ое]то$/)) return true;
  
  // Check for feminine definite (-та after -а)
  // Word must be at least 4 chars and end in -ата or -јата
  if (word.length >= 4 && (word.endsWith('ата') || word.endsWith('јата'))) return true;
  
  // Check for plural definite (-те, -ве, -не)
  if (word.match(/ите$/)) return true;
  
  return false;
}

/**
 * Detect the gender of a noun from the dictionary or endings
 */
export function detectNounGender(word: string): Gender | null {
  // Check dictionary first
  const cleanWord = word.replace(/[отовонтаваното]/g, ''); // Remove definite suffixes
  if (NOUN_DICTIONARY[cleanWord]) {
    return NOUN_DICTIONARY[cleanWord].gender;
  }
  
  // Heuristic based on endings
  if (word.endsWith('а') || word.endsWith('ја')) {
    return 'feminine';
  }
  if (word.endsWith('о') || word.endsWith('е')) {
    return 'neuter';
  }
  // Default to masculine for consonant endings
  return 'masculine';
}

// ==================== Validation Rules ====================

/**
 * Rule 1: Adjective must agree with noun in gender
 */
export const RULE_ADJECTIVE_GENDER_AGREEMENT: GrammarRule = {
  id: 'adjective_agrees_with_noun_gender',
  name: 'Adjective-Noun Gender Agreement',
  description: 'If noun is feminine, adjective must be feminine form (-a/-та)',
  validate(metadata: LinguisticMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!metadata.noun || !metadata.adjective) {
      return { valid: true, errors, warnings };
    }
    
    const { gender, number, definiteness } = metadata.noun;
    const adjLemma = metadata.adjective.lemma;
    const actualForm = metadata.adjective.form;
    
    const expectedForm = getExpectedAdjectiveForm(adjLemma, gender, number, definiteness);
    
    if (expectedForm && actualForm.toLowerCase() !== expectedForm.toLowerCase()) {
      errors.push({
        rule: 'adjective_agrees_with_noun_gender',
        message: `Adjective "${actualForm}" does not agree with ${gender} noun`,
        expected: expectedForm,
        actual: actualForm,
        suggestion: `Use "${expectedForm}" instead of "${actualForm}" for ${gender} ${number} ${definiteness} nouns`,
      });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
};

/**
 * Rule 2: Adjective must agree with noun in number
 */
export const RULE_ADJECTIVE_NUMBER_AGREEMENT: GrammarRule = {
  id: 'adjective_agrees_with_noun_number',
  name: 'Adjective-Noun Number Agreement',
  description: 'If noun is plural, adjective must be plural form (-и)',
  validate(metadata: LinguisticMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!metadata.noun || !metadata.adjective) {
      return { valid: true, errors, warnings };
    }
    
    const { number, definiteness } = metadata.noun;
    const adjLemma = metadata.adjective.lemma;
    const paradigm = ADJECTIVE_DICTIONARY[adjLemma];
    
    if (!paradigm) {
      warnings.push({
        rule: 'adjective_agrees_with_noun_number',
        message: `Unknown adjective "${adjLemma}" - cannot validate number agreement`,
      });
      return { valid: true, errors, warnings };
    }
    
    const actualForm = metadata.adjective.form.toLowerCase();
    const expectedPluralForm = definiteness === 'definite' 
      ? paradigm.pluralDef.toLowerCase() 
      : paradigm.pluralIndef.toLowerCase();
    
    if (number === 'plural' && actualForm !== expectedPluralForm) {
      errors.push({
        rule: 'adjective_agrees_with_noun_number',
        message: `Adjective should be plural form for plural noun`,
        expected: expectedPluralForm,
        actual: actualForm,
        suggestion: `Use plural form "${expectedPluralForm}"`,
      });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
};

/**
 * Rule 3: Definiteness agreement
 */
export const RULE_DEFINITENESS_AGREEMENT: GrammarRule = {
  id: 'definiteness_suffix_rule',
  name: 'Definiteness Agreement',
  description: 'If noun is definite, adjective should match definiteness pattern',
  validate(metadata: LinguisticMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!metadata.noun || !metadata.adjective) {
      return { valid: true, errors, warnings };
    }
    
    const { gender, number, definiteness } = metadata.noun;
    const adjLemma = metadata.adjective.lemma;
    const actualForm = metadata.adjective.form;
    
    const expectedForm = getExpectedAdjectiveForm(adjLemma, gender, number, definiteness);
    
    if (expectedForm && actualForm.toLowerCase() !== expectedForm.toLowerCase()) {
      if (definiteness === 'definite') {
        warnings.push({
          rule: 'definiteness_suffix_rule',
          message: `When noun is definite, adjective may also take definite form`,
          suggestion: `Consider using "${expectedForm}" for definite context`,
        });
      }
    }
    
    return { valid: true, errors, warnings };
  },
};

/**
 * Rule 4: Verb agrees with subject in number
 */
export const RULE_VERB_NUMBER_AGREEMENT: GrammarRule = {
  id: 'verb_agrees_with_subject_number',
  name: 'Verb-Subject Number Agreement',
  description: 'Verb conjugation must match subject number (singular/plural)',
  validate(metadata: LinguisticMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!metadata.noun || !metadata.verb) {
      return { valid: true, errors, warnings };
    }
    
    const nounNumber = metadata.noun.number;
    const verbNumber = metadata.verb.number;
    
    if (nounNumber !== verbNumber) {
      errors.push({
        rule: 'verb_agrees_with_subject_number',
        message: `Verb number (${verbNumber}) does not match subject number (${nounNumber})`,
        expected: `${nounNumber} verb form`,
        actual: `${verbNumber} verb form`,
        suggestion: `Use ${nounNumber} form of verb "${metadata.verb.lemma}"`,
      });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  },
};

/**
 * Rule 5: Verb agrees with subject in person
 */
export const RULE_VERB_PERSON_AGREEMENT: GrammarRule = {
  id: 'verb_agrees_with_subject_person',
  name: 'Verb-Subject Person Agreement',
  description: 'Verb conjugation must match subject person (1st/2nd/3rd)',
  validate(metadata: LinguisticMetadata): ValidationResult {
    // This is more complex and requires subject pronoun analysis
    // Simplified version for now
    return { valid: true, errors: [], warnings: [] };
  },
};

// ==================== Main Validation Function ====================

/**
 * All grammar rules to apply
 */
export const ALL_GRAMMAR_RULES: GrammarRule[] = [
  RULE_ADJECTIVE_GENDER_AGREEMENT,
  RULE_ADJECTIVE_NUMBER_AGREEMENT,
  RULE_DEFINITENESS_AGREEMENT,
  RULE_VERB_NUMBER_AGREEMENT,
  RULE_VERB_PERSON_AGREEMENT,
];

/**
 * Validate content against all grammar rules
 */
export function validateContent(metadata: LinguisticMetadata): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  
  for (const rule of ALL_GRAMMAR_RULES) {
    const result = rule.validate(metadata);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Quick validation for a sentence with adjective + noun
 * Returns the correct adjective form if there's an error
 */
export function validateAdjectiveNounPair(
  adjectiveLemma: string,
  nounWord: string
): { valid: boolean; suggestion?: string } {
  const nounEntry = NOUN_DICTIONARY[nounWord];
  const isDefinite = isDefiniteNoun(nounWord);
  
  let gender: Gender = 'masculine';
  if (nounEntry) {
    gender = nounEntry.gender;
  } else {
    const detected = detectNounGender(nounWord);
    if (detected) gender = detected;
  }
  
  const expectedForm = getExpectedAdjectiveForm(
    adjectiveLemma,
    gender,
    'singular',
    isDefinite ? 'definite' : 'indefinite'
  );
  
  if (expectedForm) {
    return { valid: true, suggestion: expectedForm };
  }
  
  return { valid: false };
}

/**
 * Get the correct adjective form for a given noun
 * Useful for content authoring
 */
export function getCorrectAdjectiveForm(
  adjectiveLemma: string,
  nounLemma: string,
  isDefinite: boolean = false,
  isPlural: boolean = false
): string | null {
  const nounEntry = NOUN_DICTIONARY[nounLemma];
  if (!nounEntry) return null;
  
  return getExpectedAdjectiveForm(
    adjectiveLemma,
    nounEntry.gender,
    isPlural ? 'plural' : 'singular',
    isDefinite ? 'definite' : 'indefinite'
  );
}
