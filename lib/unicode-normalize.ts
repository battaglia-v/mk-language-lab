/**
 * Unicode Normalization Utilities for Answer Matching
 *
 * Provides flexible answer comparison for Macedonian language learning:
 * - Strict mode: Exact matching (for advanced learners)
 * - Flexible mode: Accepts answers with/without diacritics
 *
 * Macedonian-specific considerations:
 * - Cyrillic script is primary
 * - Some learners may type Latin transliterations
 * - Diacritics on borrowed words should be optional
 */

/**
 * Strip diacritics/accents from a string
 * Uses NFD normalization to decompose then removes combining marks
 */
export function stripDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .normalize('NFC');
}

/**
 * Normalize whitespace: collapse multiple spaces, trim
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Remove common punctuation that shouldn't affect answer matching
 */
export function stripPunctuation(text: string): string {
  return text.replace(/[?!.,;:'"«»„"()[\]{}—–-]/g, '');
}

/**
 * Core normalization for answer comparison
 *
 * @param text - The text to normalize
 * @param options - Normalization options
 * @returns Normalized string ready for comparison
 */
export function normalizeForComparison(
  text: string,
  options: {
    /** Strip diacritics for flexible matching (default: true) */
    stripDiacritics?: boolean;
    /** Convert to lowercase (default: true) */
    lowercase?: boolean;
    /** Remove punctuation (default: true) */
    stripPunctuation?: boolean;
    /** Remove parenthetical content like "(formal)" (default: true) */
    stripParentheticals?: boolean;
  } = {}
): string {
  const {
    stripDiacritics: shouldStripDiacritics = true,
    lowercase = true,
    stripPunctuation: shouldStripPunctuation = true,
    stripParentheticals = true,
  } = options;

  let result = text.normalize('NFKC');

  // Remove parenthetical content like "(informal)" or "(pl.)"
  if (stripParentheticals) {
    result = result.replace(/\s*\([^)]*\)/g, '');
  }

  // Strip diacritics for flexible matching
  if (shouldStripDiacritics) {
    result = stripDiacritics(result);
  }

  // Remove punctuation
  if (shouldStripPunctuation) {
    result = stripPunctuation(result);
  }

  // Normalize whitespace
  result = normalizeWhitespace(result);

  // Convert to lowercase
  if (lowercase) {
    result = result.toLowerCase();
  }

  return result;
}

/**
 * Compare two answers with Unicode normalization
 *
 * @param userAnswer - The answer provided by the user
 * @param correctAnswer - The expected correct answer
 * @param strict - Use strict matching (diacritic-sensitive)
 * @returns true if answers match
 */
export function answersMatch(
  userAnswer: string,
  correctAnswer: string,
  strict = false
): boolean {
  const normalizedUser = normalizeForComparison(userAnswer, {
    stripDiacritics: !strict,
  });
  const normalizedCorrect = normalizeForComparison(correctAnswer, {
    stripDiacritics: !strict,
  });

  return normalizedUser === normalizedCorrect;
}

/**
 * Check if user answer matches any of the acceptable answers
 *
 * @param userAnswer - The answer provided by the user
 * @param acceptableAnswers - Array of correct/acceptable answers
 * @param strict - Use strict matching
 * @returns true if answer matches any acceptable answer
 */
export function matchesAnyAnswer(
  userAnswer: string,
  acceptableAnswers: string[],
  strict = false
): boolean {
  return acceptableAnswers.some(answer =>
    answersMatch(userAnswer, answer, strict)
  );
}

/**
 * Analyze a user answer to provide feedback hints
 *
 * Returns feedback about common mistakes:
 * - Case sensitivity issues
 * - Diacritic differences
 * - Minor typos (edit distance)
 */
export interface AnswerAnalysis {
  /** Answer matches exactly */
  exactMatch: boolean;
  /** Answer matches with flexible normalization */
  flexibleMatch: boolean;
  /** Specific feedback about the difference */
  feedbackHint?: string;
  /** The type of mistake detected */
  mistakeType?: 'diacritics' | 'case' | 'punctuation' | 'spelling' | 'article' | 'gender' | 'conjugation';
}

/**
 * Analyze why an answer might be incorrect and provide helpful feedback
 */
export function analyzeAnswer(
  userAnswer: string,
  correctAnswer: string
): AnswerAnalysis {
  // Check exact match
  if (userAnswer === correctAnswer) {
    return { exactMatch: true, flexibleMatch: true };
  }

  // Check flexible match (normalized)
  const flexibleMatch = answersMatch(userAnswer, correctAnswer, false);

  if (flexibleMatch) {
    return {
      exactMatch: false,
      flexibleMatch: true,
      feedbackHint: 'Correct! (Diacritics or formatting slightly different)',
      mistakeType: 'diacritics'
    };
  }

  // Check if it's just a case difference
  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    return {
      exactMatch: false,
      flexibleMatch: false,
      feedbackHint: 'Watch your capitalization!',
      mistakeType: 'case'
    };
  }

  // Check for common Macedonian grammar patterns
  const normalizedUser = normalizeForComparison(userAnswer);
  const normalizedCorrect = normalizeForComparison(correctAnswer);

  // Check for article mistakes (definite article endings)
  const articleEndings = ['от', 'та', 'то', 'те', 'ов', 'ва', 'во', 'ве', 'он', 'на', 'но', 'не'];
  for (const ending of articleEndings) {
    if (
      (normalizedCorrect.endsWith(ending) && !normalizedUser.endsWith(ending)) ||
      (!normalizedCorrect.endsWith(ending) && normalizedUser.endsWith(ending))
    ) {
      return {
        exactMatch: false,
        flexibleMatch: false,
        feedbackHint: 'Check the definite article ending (-от, -та, -то, -те)',
        mistakeType: 'article'
      };
    }
  }

  // Check for gender agreement (common -а/-о/-и endings)
  const genderEndings = [
    { masc: '', fem: 'а', neut: 'о' },
    { masc: 'ен', fem: 'на', neut: 'но' },
    { masc: 'ски', fem: 'ска', neut: 'ско' },
  ];

  for (const pattern of genderEndings) {
    if (
      (normalizedCorrect.endsWith(pattern.fem) && normalizedUser.endsWith(pattern.masc)) ||
      (normalizedCorrect.endsWith(pattern.masc) && normalizedUser.endsWith(pattern.fem)) ||
      (normalizedCorrect.endsWith(pattern.neut) && normalizedUser.endsWith(pattern.masc)) ||
      (normalizedCorrect.endsWith(pattern.neut) && normalizedUser.endsWith(pattern.fem))
    ) {
      return {
        exactMatch: false,
        flexibleMatch: false,
        feedbackHint: 'Check the gender agreement! Feminine nouns often end in -а',
        mistakeType: 'gender'
      };
    }
  }

  // Check for verb conjugation patterns
  const verbEndings = ['ам', 'аш', 'а', 'ме', 'те', 'ат', 'еш', 'е', 'ат', 'иш', 'и', 'ат'];
  const userEnding = normalizedUser.slice(-2);
  const correctEnding = normalizedCorrect.slice(-2);

  if (verbEndings.includes(userEnding) && verbEndings.includes(correctEnding) && userEnding !== correctEnding) {
    return {
      exactMatch: false,
      flexibleMatch: false,
      feedbackHint: 'Check your verb conjugation! Match the verb ending to the subject',
      mistakeType: 'conjugation'
    };
  }

  // Generic spelling mistake
  return {
    exactMatch: false,
    flexibleMatch: false,
    feedbackHint: 'Check your spelling carefully',
    mistakeType: 'spelling'
  };
}

/**
 * Get a user-friendly feedback message for a mistake type
 */
export function getFeedbackMessage(
  mistakeType: AnswerAnalysis['mistakeType'],
  locale: 'en' | 'mk' = 'en'
): string {
  const messages: Record<string, { en: string; mk: string }> = {
    diacritics: {
      en: 'Almost! Check your diacritics and accents.',
      mk: 'Скоро! Провери ги дијакритичките знаци.',
    },
    case: {
      en: 'Watch your capitalization!',
      mk: 'Внимавај на големите букви!',
    },
    punctuation: {
      en: 'Check your punctuation.',
      mk: 'Провери ја интерпункцијата.',
    },
    spelling: {
      en: 'Check your spelling carefully.',
      mk: 'Провери го правописот.',
    },
    article: {
      en: 'Check the definite article! Remember: -от (m), -та (f), -то (n)',
      mk: 'Провери го членот! Запомни: -от (м), -та (ж), -то (с)',
    },
    gender: {
      en: 'Check gender agreement! Feminine nouns often end in -а',
      mk: 'Провери го родот! Женските именки завршуваат на -а',
    },
    conjugation: {
      en: 'Check your verb conjugation! Match the ending to the subject.',
      mk: 'Провери ја конјугацијата! Глаголот треба да се совпаѓа со субјектот.',
    },
  };

  if (!mistakeType || !messages[mistakeType]) {
    return locale === 'en' ? 'Not quite right.' : 'Не сосема точно.';
  }

  return messages[mistakeType][locale];
}
