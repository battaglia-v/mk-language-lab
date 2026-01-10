import { NextResponse } from 'next/server';
import practiceVocabulary from '@/data/practice-vocabulary.json';
import prisma from '@/lib/prisma';
import type { PracticeItem } from '@mk/api-client';

export async function GET() {
  try {
    // Fetch all active vocabulary from database
    const vocabItems = await prisma.practiceVocabulary.findMany({
      where: { isActive: true },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    // Map database items to PracticeItem format
    const prompts: PracticeItem[] = vocabItems.map((item) => {
      const id = item.id;
      return {
        id,
        macedonian: item.macedonian,
        english: item.english,
        category: item.category ?? undefined,
        difficulty: item.difficulty ?? 'mixed',
        audioClip: null,
      };
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('[PracticePromptsAPI] Failed to fetch vocabulary from database, using fallback', error);
    // Fallback to static JSON if database query fails
    const prompts = (practiceVocabulary as PracticeItem[]).map((item, index) => {
      const id = item.id ?? `prompt-${index + 1}`;
      return {
        ...item,
        id,
        difficulty: item.difficulty ?? 'mixed',
        audioClip: null,
      };
    });
    return NextResponse.json(prompts);
  }
}
