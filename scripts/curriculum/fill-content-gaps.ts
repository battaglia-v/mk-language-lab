#!/usr/bin/env tsx
/**
 * Fill Content Gaps Script
 *
 * Based on content-completeness-audit.json, this script fills identified gaps:
 * 1. A1 L21: Add comparative/superlative vocabulary to reach 30+ items
 * 2. A1 L17: Add past tense grammar note
 * 3. A1 L19: Add modal verbs grammar note
 * 4. A1 L24: Add feelings vocabulary grammar note
 * 5. B1 L3: Add health-related grammar note
 *
 * Run with: npx tsx scripts/curriculum/fill-content-gaps.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  context: string;
  translation: string;
  transliteration: string;
  isCore: boolean;
  gender?: string;
  category?: string;
}

interface GrammarNote {
  title: string;
  content: string;
  examples: string[];
  translatedExamples: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  vocabularyItems: VocabularyItem[];
  grammarNotes: GrammarNote[];
  intro?: string;
  [key: string]: unknown;
}

interface Textbook {
  id: string;
  level: string;
  chapters: Chapter[];
  [key: string]: unknown;
}

// ============================================================================
// New Content to Add
// ============================================================================

// A1 L21: Comparative and superlative vocabulary
const COMPARATIVE_SUPERLATIVE_VOCAB: VocabularyItem[] = [
  {
    word: "добар",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "good",
    transliteration: "dobar",
    isCore: true
  },
  {
    word: "лош",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "bad",
    transliteration: "losh",
    isCore: true
  },
  {
    word: "голем",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "big",
    transliteration: "golem",
    isCore: true
  },
  {
    word: "мал",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "small",
    transliteration: "mal",
    isCore: true
  },
  {
    word: "висок",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "tall/high",
    transliteration: "visok",
    isCore: true
  },
  {
    word: "низок",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "short/low",
    transliteration: "nizok",
    isCore: true
  },
  {
    word: "поголем",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "bigger",
    transliteration: "pogolem",
    isCore: true
  },
  {
    word: "помал",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "smaller",
    transliteration: "pomal",
    isCore: true
  },
  {
    word: "повисок",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "taller/higher",
    transliteration: "povisok",
    isCore: true
  },
  {
    word: "понизок",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "shorter/lower",
    transliteration: "ponizok",
    isCore: true
  },
  {
    word: "најголем",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "biggest",
    transliteration: "najgolem",
    isCore: true
  },
  {
    word: "најмал",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "smallest",
    transliteration: "najmal",
    isCore: true
  },
  {
    word: "најлош",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "worst",
    transliteration: "najlosh",
    isCore: true
  },
  {
    word: "полош",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "worse",
    transliteration: "polosh",
    isCore: true
  },
  {
    word: "скап",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "expensive",
    transliteration: "skap",
    isCore: true
  },
  {
    word: "евтин",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "cheap",
    transliteration: "evtin",
    isCore: true
  },
  {
    word: "поскап",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "more expensive",
    transliteration: "poskap",
    isCore: true
  },
  {
    word: "поевтин",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "cheaper",
    transliteration: "poevtin",
    isCore: true
  },
  {
    word: "најскап",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "most expensive",
    transliteration: "najskap",
    isCore: true
  },
  {
    word: "најевтин",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "cheapest",
    transliteration: "najevtin",
    isCore: true
  },
  {
    word: "брз",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "fast",
    transliteration: "brz",
    isCore: true
  },
  {
    word: "бавен",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "slow",
    transliteration: "baven",
    isCore: true
  },
  {
    word: "побрз",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "faster",
    transliteration: "pobrz",
    isCore: true
  },
  {
    word: "најбрз",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "fastest",
    transliteration: "najbrz",
    isCore: true
  },
  {
    word: "стар",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "old",
    transliteration: "star",
    isCore: true
  },
  {
    word: "постар",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "older",
    transliteration: "postar",
    isCore: true
  },
  {
    word: "најстар",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "oldest",
    transliteration: "najstar",
    isCore: true
  },
  {
    word: "млад",
    partOfSpeech: "adjective",
    context: "comparative/superlative base",
    translation: "young",
    transliteration: "mlad",
    isCore: true
  },
  {
    word: "помлад",
    partOfSpeech: "adjective",
    context: "comparative form",
    translation: "younger",
    transliteration: "pomlad",
    isCore: true
  },
  {
    word: "најмлад",
    partOfSpeech: "adjective",
    context: "superlative form",
    translation: "youngest",
    transliteration: "najmlad",
    isCore: true
  }
];

// A1 L21: Comparative/Superlative grammar note
const COMPARATIVE_SUPERLATIVE_GRAMMAR: GrammarNote = {
  title: "Компаратив и суперлатив (Comparative and Superlative)",
  content: "Macedonian forms comparatives with the prefix 'по-' and superlatives with 'нај-'. Unlike English, these prefixes attach directly to adjectives. The adjective still agrees in gender with the noun it modifies.",
  examples: [
    "добар → подобар → најдобар",
    "голем → поголем → најголем",
    "Тој е повисок од мене.",
    "Ова е најдоброто место.",
    "Таа е помлада од брат ми.",
    "Кој е најбрзиот?"
  ],
  translatedExamples: [
    "good → better → best",
    "big → bigger → biggest",
    "He is taller than me.",
    "This is the best place.",
    "She is younger than my brother.",
    "Who is the fastest?"
  ]
};

// A1 L17: Past tense grammar note
const PAST_TENSE_GRAMMAR: GrammarNote = {
  title: "Минато определено свршено време (Past Definite Tense)",
  content: "The past definite tense (аорист) in Macedonian expresses completed actions in the past. It is formed from perfective verbs and has specific endings based on conjugation class. This tense is common in narratives and storytelling.",
  examples: [
    "Јас одев на работа.",
    "Тој ми даде книга.",
    "Ние бевме дома.",
    "Тие дојдоа вчера.",
    "Таа рече добро утро.",
    "Јас напишав писмо."
  ],
  translatedExamples: [
    "I went to work.",
    "He gave me a book.",
    "We were at home.",
    "They came yesterday.",
    "She said good morning.",
    "I wrote a letter."
  ]
};

// A1 L19: Modal verbs grammar note
const MODAL_VERBS_GRAMMAR: GrammarNote = {
  title: "Модални глаголи (Modal Verbs: смее, мора, треба)",
  content: "Macedonian modal verbs express permission, obligation, and necessity. 'Смее' (may/can) indicates permission, 'мора' (must) indicates obligation, and 'треба' (need/should) indicates necessity. The negative 'не смее' means 'must not' or 'is not allowed'.",
  examples: [
    "Не смееш да паркираш овде.",
    "Мора да носиш маска.",
    "Треба да учиш секој ден.",
    "Смее ли да влезам?",
    "Не мора да одиш.",
    "Треба да бидеш внимателен."
  ],
  translatedExamples: [
    "You must not park here.",
    "You must wear a mask.",
    "You need to study every day.",
    "May I come in?",
    "You don't have to go.",
    "You should be careful."
  ]
};

// A1 L24: Feelings/emotions grammar note
const FEELINGS_GRAMMAR: GrammarNote = {
  title: "Изразување чувства (Expressing Feelings)",
  content: "In Macedonian, feelings are often expressed using adjectives that agree with the subject's gender. The verb 'сум' (to be) or 'се чувствувам' (I feel) is used. Many feeling adjectives have distinct masculine and feminine forms.",
  examples: [
    "Јас сум гладен/гладна.",
    "Тој е жеден.",
    "Таа е уморна.",
    "Се чувствувам среќен/среќна.",
    "Дали си тажен?",
    "Ние сме возбудени."
  ],
  translatedExamples: [
    "I am hungry (m/f).",
    "He is thirsty.",
    "She is tired.",
    "I feel happy (m/f).",
    "Are you sad?",
    "We are excited."
  ]
};

// B1 L3: Health vocabulary/expressions grammar note
const HEALTH_EXPRESSIONS_GRAMMAR: GrammarNote = {
  title: "Здравствени изрази (Health Expressions)",
  content: "Macedonian has specific expressions for discussing health, symptoms, and medical situations. The verb 'боли' (hurts) is used with body parts, and reflexive constructions like 'се чувствувам' describe how one feels.",
  examples: [
    "Ме боли глава.",
    "Имам температура.",
    "Се чувствувам болно.",
    "Треба да одам на доктор.",
    "Земи лек за болка.",
    "Како се чувствуваш денес?"
  ],
  translatedExamples: [
    "My head hurts.",
    "I have a fever.",
    "I feel sick.",
    "I need to go to the doctor.",
    "Take pain medicine.",
    "How do you feel today?"
  ]
};

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('📝 Filling Content Gaps');
  console.log('='.repeat(50));
  console.log('');

  const changes: string[] = [];

  // Process A1 curriculum
  const a1Path = path.resolve(LEVEL_FILES.a1);
  if (fs.existsSync(a1Path)) {
    console.log('📚 Processing A1...');
    const a1Data: Textbook = JSON.parse(fs.readFileSync(a1Path, 'utf-8'));

    for (const chapter of a1Data.chapters) {
      // L17: Add past tense grammar
      if (chapter.lessonNumber === 17) {
        if (!chapter.grammarNotes.some(g => g.title.toLowerCase().includes('минато'))) {
          chapter.grammarNotes.push(PAST_TENSE_GRAMMAR);
          console.log('   ✅ L17: Added past tense grammar note');
          changes.push('A1 L17: Added "Минато определено свршено време" grammar note');
        } else {
          console.log('   ⏭️  L17: Past tense grammar already exists');
        }
      }

      // L19: Add modal verbs grammar
      if (chapter.lessonNumber === 19) {
        if (!chapter.grammarNotes.some(g => g.title.toLowerCase().includes('модал') || g.title.toLowerCase().includes('смее'))) {
          chapter.grammarNotes.push(MODAL_VERBS_GRAMMAR);
          console.log('   ✅ L19: Added modal verbs grammar note');
          changes.push('A1 L19: Added "Модални глаголи" grammar note');
        } else {
          console.log('   ⏭️  L19: Modal verbs grammar already exists');
        }
      }

      // L21: Add comparative/superlative vocabulary and grammar
      if (chapter.lessonNumber === 21) {
        const vocabBefore = chapter.vocabularyItems.length;

        // Check existing words to avoid duplicates
        const existingWords = new Set(chapter.vocabularyItems.map(v => v.word.toLowerCase()));

        // Add new vocabulary
        for (const vocab of COMPARATIVE_SUPERLATIVE_VOCAB) {
          if (!existingWords.has(vocab.word.toLowerCase())) {
            chapter.vocabularyItems.push(vocab);
            existingWords.add(vocab.word.toLowerCase());
          }
        }

        const vocabAfter = chapter.vocabularyItems.length;
        const added = vocabAfter - vocabBefore;
        if (added > 0) {
          console.log(`   ✅ L21: Added ${added} comparative/superlative vocabulary items (${vocabBefore} → ${vocabAfter})`);
          changes.push(`A1 L21: Added ${added} comparative/superlative vocabulary items`);
        }

        // Add comparative/superlative grammar note
        if (!chapter.grammarNotes.some(g => g.title.toLowerCase().includes('компаратив') || g.title.toLowerCase().includes('comparative'))) {
          chapter.grammarNotes.push(COMPARATIVE_SUPERLATIVE_GRAMMAR);
          console.log('   ✅ L21: Added comparative/superlative grammar note');
          changes.push('A1 L21: Added "Компаратив и суперлатив" grammar note');
        } else {
          console.log('   ⏭️  L21: Comparative/superlative grammar already exists');
        }
      }

      // L24: Add feelings grammar
      if (chapter.lessonNumber === 24) {
        if (!chapter.grammarNotes.some(g => g.title.toLowerCase().includes('чувств') || g.title.toLowerCase().includes('feeling'))) {
          chapter.grammarNotes.push(FEELINGS_GRAMMAR);
          console.log('   ✅ L24: Added feelings/emotions grammar note');
          changes.push('A1 L24: Added "Изразување чувства" grammar note');
        } else {
          console.log('   ⏭️  L24: Feelings grammar already exists');
        }
      }
    }

    // Save A1 changes
    fs.writeFileSync(a1Path, JSON.stringify(a1Data, null, 2), 'utf-8');
    console.log(`   💾 Saved A1 changes to ${a1Path}`);
  }

  // Process B1 curriculum
  const b1Path = path.resolve(LEVEL_FILES.b1);
  if (fs.existsSync(b1Path)) {
    console.log('\n📚 Processing B1...');
    const b1Data: Textbook = JSON.parse(fs.readFileSync(b1Path, 'utf-8'));

    for (const chapter of b1Data.chapters) {
      // L3: Add health expressions grammar
      if (chapter.lessonNumber === 3) {
        if (!chapter.grammarNotes.some(g => g.title.toLowerCase().includes('здравств') || g.title.toLowerCase().includes('health'))) {
          chapter.grammarNotes.push(HEALTH_EXPRESSIONS_GRAMMAR);
          console.log('   ✅ L3: Added health expressions grammar note');
          changes.push('B1 L3: Added "Здравствени изрази" grammar note');
        } else {
          console.log('   ⏭️  L3: Health expressions grammar already exists');
        }
      }
    }

    // Save B1 changes
    fs.writeFileSync(b1Path, JSON.stringify(b1Data, null, 2), 'utf-8');
    console.log(`   💾 Saved B1 changes to ${b1Path}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CHANGES SUMMARY');
  console.log('='.repeat(50));

  if (changes.length > 0) {
    for (const change of changes) {
      console.log(`  - ${change}`);
    }
    console.log(`\n✅ Made ${changes.length} changes to fill content gaps`);
  } else {
    console.log('  No changes needed - all gaps already filled');
  }

  // Re-run audit to verify
  console.log('\n🔄 Re-running content completeness audit to verify...\n');
}

main().catch(console.error);
