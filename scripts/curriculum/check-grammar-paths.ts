import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const GRAMMAR_ID_PREFIX = 'grammar-';

type CurriculumRef = {
  journeyId: string;
  lessonNumber: number;
  lessonTitle?: string;
  relevance?: string;
};

type GrammarMapping = {
  grammarLessonId: string;
  curriculumRefs: CurriculumRef[];
};

function loadJson<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

function buildExpectedMap(mappings: GrammarMapping[]): Map<string, Set<string>> {
  const expected = new Map<string, Set<string>>();
  for (const mapping of mappings) {
    for (const ref of mapping.curriculumRefs) {
      if (!expected.has(ref.journeyId)) {
        expected.set(ref.journeyId, new Set());
      }
      expected.get(ref.journeyId)?.add(`${GRAMMAR_ID_PREFIX}${mapping.grammarLessonId}`);
    }
  }
  return expected;
}

async function auditJourney(journeyId: string, expected: Set<string> | undefined) {
  const modules = await prisma.module.findMany({
    where: { journeyId },
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true, orderIndex: true },
      },
    },
  });

  console.log(`\n[${journeyId}] ${modules.length} modules`);

  const foundGrammar = new Set<string>();
  let totalLessons = 0;

  for (const curriculumModule of modules) {
    console.log(`  Module ${curriculumModule.orderIndex}: ${curriculumModule.title} (${curriculumModule.lessons.length} lessons)`);
    let lastBaseTitle = '';

    for (const lesson of curriculumModule.lessons) {
      totalLessons += 1;
      const isGrammar = lesson.id.startsWith(GRAMMAR_ID_PREFIX);
      if (isGrammar) {
        foundGrammar.add(lesson.id);
      } else {
        lastBaseTitle = lesson.title;
      }

      const marker = isGrammar ? '*' : ' ';
      const placement = isGrammar ? ` (grammar after ${lastBaseTitle || 'start'})` : '';
      console.log(`    ${marker} ${lesson.orderIndex}. ${lesson.title}${placement}`);
    }
  }

  const expectedSet = expected ?? new Set<string>();
  const missing = Array.from(expectedSet).filter((id) => !foundGrammar.has(id));
  const extra = Array.from(foundGrammar).filter((id) => !expectedSet.has(id));

  console.log(`\n  Summary: ${totalLessons} lessons, ${foundGrammar.size} grammar inserted`);
  if (missing.length > 0) {
    console.warn(`  Missing grammar lessons: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    console.warn(`  Extra grammar lessons (not mapped): ${extra.join(', ')}`);
  }
}

async function main() {
  const grammarMap = loadJson<{ mappings: GrammarMapping[] }>('data/grammar-curriculum-map.json');
  const expected = buildExpectedMap(grammarMap.mappings);

  const journeys = ['ukim-a1', 'ukim-a2', 'ukim-b1'];
  for (const journeyId of journeys) {
    await auditJourney(journeyId, expected.get(journeyId));
  }
}

main()
  .catch((error) => {
    console.error('Error auditing grammar paths:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
