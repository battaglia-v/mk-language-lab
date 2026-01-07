/**
 * Grammar extraction utilities for UKIM Macedonian textbooks
 *
 * UKIM textbooks contain grammar content in several formats:
 * 1. Topic headers (Глагол, именка, Граматика, придавка)
 * 2. Explanation paragraphs following headers
 * 3. Numbered examples (а. б. в. or 1. 2. 3.)
 * 4. Conjugation tables (Јас сум, Ти си, etc.)
 * 5. A2 has a dedicated grammar reference section starting page 156
 */

/**
 * Grammar section extracted from text
 */
export interface GrammarSection {
  title: string;
  content: string;
  page?: number;
}

/**
 * Verb conjugation pattern
 */
export interface ConjugationTable {
  verb: string;
  forms: Record<string, string>;
}

/**
 * Find grammar section headers and extract following explanation paragraphs
 *
 * Common patterns in UKIM textbooks:
 * - "Глаголот X" - verb topic
 * - "Тема X. Глаголот сум" - numbered theme with grammar
 * - "ГРАМАТИКА" - dedicated grammar section (A2)
 * - "именка" / "Именки" - noun forms
 * - "придавка" / "Придавки" - adjectives
 */
export function extractGrammarSections(text: string, pageNum?: number): GrammarSection[] {
  const sections: GrammarSection[] = [];
  const seen = new Set<string>();

  // Pattern 1: "Глаголот X" headers
  const verbPattern = /[Гг]лаголот\s+[„"]?([А-Яа-яЀ-ӿ]+)[„"]?\s*([^]*?)(?=\n\n[А-Яа-яЀ-ӿ]+\s*\d|\n\nВежба|\n\nТема|\n\n[А-Яа-яЀ-ӿ]+[.:]\s|$)/gi;
  let match;
  while ((match = verbPattern.exec(text)) !== null) {
    const title = `Глаголот ${match[1]}`;
    const titleKey = title.toLowerCase();
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    const content = cleanContent(match[2]);
    if (content.length > 20) {
      sections.push({ title, content, page: pageNum });
    }
  }

  // Pattern 2: "Тема X. <grammar topic>" - common in A1
  const themeGrammarPattern = /Тема\s+\d+\.\s+([А-Яа-яЀ-ӿ][А-Яа-яЀ-ӿ\s]+?)\s*\n([^]*?)(?=\n\nТема|\n\nПроверка|\n\nПровери|$)/gi;
  while ((match = themeGrammarPattern.exec(text)) !== null) {
    const title = match[1].trim();
    const titleKey = title.toLowerCase();
    // Only include grammar-related themes
    if (!isGrammarTopic(title)) continue;
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    const content = cleanContent(match[2]);
    if (content.length > 20) {
      sections.push({ title, content, page: pageNum });
    }
  }

  // Pattern 3: Grammar terms as standalone headers (именка, придавка, etc.)
  const grammarTerms = [
    { pattern: /[Ии]менк[аи]\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Именки' },
    { pattern: /[Пп]ридавк[аи]\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Придавки' },
    { pattern: /[Ее]днина\s+и\s+множина\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Еднина и множина' },
    { pattern: /[Зз]аменки\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Заменки' },
    { pattern: /[Пп]рисвојни\s+заменки\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Присвојни заменки' },
    { pattern: /[Пп]редлози\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Предлози' },
    { pattern: /[Бб]роеви\s*[.:]?\s*([^]*?)(?=\n\n|Вежба\s+\d|$)/gi, prefix: 'Броеви' },
  ];

  for (const { pattern, prefix } of grammarTerms) {
    const termMatch = pattern.exec(text);
    if (termMatch) {
      const titleKey = prefix.toLowerCase();
      if (seen.has(titleKey)) continue;
      seen.add(titleKey);

      const content = cleanContent(termMatch[1]);
      if (content.length > 10) {
        sections.push({ title: prefix, content, page: pageNum });
      }
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  return sections;
}

/**
 * Extract numbered examples from text
 *
 * Pattern examples:
 * - Cyrillic letters: а. б. в. г. д.
 * - Arabic numerals: 1. 2. 3.
 * - Sentences in italics or quotes following markers
 */
export function extractGrammarExamples(text: string): string[] {
  const examples: string[] = [];
  const seen = new Set<string>();

  // Pattern 1: Cyrillic letter markers (а. б. в. г. д. ѓ. е. ж. з.)
  const cyrillicPattern = /[абвгдѓежзѕијклљмнњопрстќуфхцчџш]\.\s*([А-Яа-яЀ-ӿ][^.!?]*[.!?])/g;
  let match;
  while ((match = cyrillicPattern.exec(text)) !== null) {
    const example = cleanExample(match[1]);
    if (example.length > 5 && !seen.has(example.toLowerCase())) {
      seen.add(example.toLowerCase());
      examples.push(example);
    }
  }

  // Pattern 2: Arabic numeral markers (1. 2. 3.)
  const numericPattern = /\d+\.\s*([А-Яа-яЀ-ӿ][^.!?]*[.!?])/g;
  while ((match = numericPattern.exec(text)) !== null) {
    const example = cleanExample(match[1]);
    // Skip if it looks like a page number or short fragment
    if (example.length > 10 && !seen.has(example.toLowerCase())) {
      seen.add(example.toLowerCase());
      examples.push(example);
    }
  }

  // Pattern 3: Sentences with grammatical markers (underscores indicate fill-in)
  const fillInPattern = /([А-Яа-яЀ-ӿ][^.!?]*_{2,}[^.!?]*[.!?])/g;
  while ((match = fillInPattern.exec(text)) !== null) {
    const example = cleanExample(match[1]);
    if (example.length > 10 && !seen.has(example.toLowerCase())) {
      seen.add(example.toLowerCase());
      examples.push(example);
    }
  }

  // Pattern 4: Quoted examples (common in A2 grammar section)
  const quotedPattern = /[„"]([А-Яа-яЀ-ӿ][^"„"]*[.!?])[""]/g;
  while ((match = quotedPattern.exec(text)) !== null) {
    const example = cleanExample(match[1]);
    if (example.length > 10 && !seen.has(example.toLowerCase())) {
      seen.add(example.toLowerCase());
      examples.push(example);
    }
  }

  return examples.slice(0, 10); // Limit to 10 examples per topic
}

/**
 * Extract verb conjugation tables when present
 *
 * Pattern example:
 *   Јас сум    Ние сме
 *   Ти си      Вие сте
 *   Тој/Таа е  Тие се
 */
export function extractConjugationTables(text: string): ConjugationTable[] {
  const tables: ConjugationTable[] = [];

  // Common verb conjugation patterns
  const verbPatterns: Array<{ verb: string; markers: string[] }> = [
    { verb: 'сум', markers: ['Јас сум', 'Ти си', 'Тој е', 'Таа е', 'Тоа е', 'Ние сме', 'Вие сте', 'Тие се'] },
    { verb: 'има', markers: ['Јас имам', 'Ти имаш', 'Тој има', 'Ние имаме', 'Вие имате', 'Тие имаат'] },
    { verb: 'сака', markers: ['Јас сакам', 'Ти сакаш', 'Тој сака', 'Ние сакаме', 'Вие сакате', 'Тие сакаат'] },
  ];

  for (const { verb, markers } of verbPatterns) {
    const foundMarkers = markers.filter(m => text.includes(m));
    if (foundMarkers.length >= 3) {
      const forms: Record<string, string> = {};
      for (const marker of foundMarkers) {
        const [pronoun, form] = marker.split(' ');
        forms[pronoun] = form;
      }
      tables.push({ verb, forms });
    }
  }

  // Dynamic conjugation extraction - look for patterns like:
  // "јас X-м, ти X-ш, тој X..."
  const dynamicPattern = /[Јј]ас\s+([А-Яа-яЀ-ӿ]+м)[,\s]+[Тт]и\s+([А-Яа-яЀ-ӿ]+ш)[,\s]+[Тт]ој\s+([А-Яа-яЀ-ӿ]+)/g;
  let match;
  while ((match = dynamicPattern.exec(text)) !== null) {
    const verb = extractVerbRoot(match[1]);
    if (!tables.some(t => t.verb === verb)) {
      tables.push({
        verb,
        forms: {
          'Јас': match[1],
          'Ти': match[2],
          'Тој/Таа/Тоа': match[3],
        },
      });
    }
  }

  return tables;
}

/**
 * Extract grammar content for A2 from the dedicated grammar reference section (pages 156+)
 * This section has rich explanations with numbered meanings and formation rules
 */
export function extractA2GrammarReference(text: string): GrammarSection[] {
  const sections: GrammarSection[] = [];

  // A2 grammar section has clear topic headers followed by "Значење:" and "Образување"
  const topicPattern = /([А-Яа-яЀ-ӿ][А-Яа-яЀ-ӿ\s\-–]+)\s*\([А-Яа-яЀ-ӿ]+\)\s*\n\s*Значење:\s*([^]*?)(?=Образување|[А-Яа-яЀ-ӿ][А-Яа-яЀ-ӿ\s\-–]+\s*\([А-Яа-яЀ-ӿ]+\)\s*\n\s*Значење|$)/gi;

  let match;
  while ((match = topicPattern.exec(text)) !== null) {
    const title = match[1].trim();
    const meaningContent = match[2].trim();

    if (meaningContent.length > 20) {
      sections.push({
        title,
        content: `Значење: ${cleanContent(meaningContent)}`,
      });
    }
  }

  return sections;
}

/**
 * Search for a specific grammar topic in lesson text and extract content
 *
 * @param lessonText - Full text of the lesson
 * @param topicTitle - Grammar topic to search for (from TOC)
 * @returns Content and examples if found
 */
export function searchForGrammarTopic(
  lessonText: string,
  topicTitle: string
): { content: string; examples: string[] } | null {
  const normalizedTitle = topicTitle.toLowerCase();

  // Try exact match first
  if (lessonText.toLowerCase().includes(normalizedTitle)) {
    // Find the position and extract surrounding context
    const position = lessonText.toLowerCase().indexOf(normalizedTitle);
    const contextStart = Math.max(0, position - 50);
    const contextEnd = Math.min(lessonText.length, position + 500);
    const context = lessonText.substring(contextStart, contextEnd);

    const examples = extractGrammarExamples(context);
    const content = cleanContent(context);

    if (content.length > 20) {
      return { content, examples };
    }
  }

  // Try keyword matching
  const keywords = extractKeywords(topicTitle);
  for (const keyword of keywords) {
    if (lessonText.toLowerCase().includes(keyword.toLowerCase())) {
      const position = lessonText.toLowerCase().indexOf(keyword.toLowerCase());
      const contextStart = Math.max(0, position - 50);
      const contextEnd = Math.min(lessonText.length, position + 500);
      const context = lessonText.substring(contextStart, contextEnd);

      const examples = extractGrammarExamples(context);
      const content = cleanContent(context);

      if (content.length > 20) {
        return { content, examples };
      }
    }
  }

  return null;
}

// Helper functions

function cleanContent(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/_{2,}/g, '____')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 500); // Limit content length
}

function cleanExample(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/_{2,}/g, '____')
    .trim();
}

function isGrammarTopic(title: string): boolean {
  const grammarKeywords = [
    'глагол', 'именк', 'придавк', 'заменк', 'предлог', 'прилог',
    'број', 'еднина', 'множина', 'време', 'начин', 'членуван',
    'форма', 'лице', 'род', 'падеж', 'сегашн', 'минат', 'идн',
  ];
  const lowerTitle = title.toLowerCase();
  return grammarKeywords.some(kw => lowerTitle.includes(kw));
}

function extractVerbRoot(conjugatedForm: string): string {
  // Remove common verb endings to get root
  const endings = ['ам', 'аш', 'а', 'аме', 'ате', 'аат', 'м', 'ш'];
  for (const ending of endings) {
    if (conjugatedForm.endsWith(ending)) {
      return conjugatedForm.slice(0, -ending.length);
    }
  }
  return conjugatedForm;
}

function extractKeywords(topicTitle: string): string[] {
  // Extract meaningful words from grammar topic title
  const stopWords = ['и', 'на', 'со', 'за', 'во', 'од', 'до', 'кај'];
  return topicTitle
    .split(/[\s\-–]+/)
    .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()))
    .map(w => w.replace(/[()]/g, ''));
}
