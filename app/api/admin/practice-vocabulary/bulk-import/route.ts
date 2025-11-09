import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for CSV row
const csvRowSchema = z.object({
  macedonian: z.string().min(1, 'Macedonian word/phrase is required').max(200),
  english: z.string().min(1, 'English translation is required').max(200),
  pronunciation: z.string().max(200).optional().nullable(),
  partOfSpeech: z.string().max(100).optional().nullable(),
  exampleMk: z.string().optional().nullable(),
  exampleEn: z.string().optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  formality: z.enum(['formal', 'neutral', 'informal']).optional().default('neutral'),
  usageContext: z.string().optional().nullable(),
  includeInWOTD: z.string().optional().nullable().transform((val) => {
    if (!val) return false;
    const lower = val.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }),
});

type ValidationResult = {
  valid: Array<{
    rowIndex: number;
    data: z.infer<typeof csvRowSchema>;
  }>;
  invalid: Array<{
    rowIndex: number;
    errors: string[];
    data: Record<string, unknown>;
  }>;
};

// POST - Bulk import vocabulary from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No rows provided for import' },
        { status: 400 }
      );
    }

    // Validate all rows
    const validationResult: ValidationResult = {
      valid: [],
      invalid: [],
    };

    rows.forEach((row, index) => {
      const result = csvRowSchema.safeParse(row);

      if (result.success) {
        validationResult.valid.push({
          rowIndex: index + 1,
          data: result.data,
        });
      } else {
        const errors = result.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        validationResult.invalid.push({
          rowIndex: index + 1,
          errors,
          data: row,
        });
      }
    });

    // If no valid rows, return validation errors
    if (validationResult.valid.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid rows to import',
          imported: 0,
          failed: validationResult.invalid.length,
          errors: validationResult.invalid,
        },
        { status: 400 }
      );
    }

    // Prepare data for bulk insert
    const dataToInsert = validationResult.valid.map((item) => ({
      macedonian: item.data.macedonian,
      english: item.data.english,
      pronunciation: item.data.pronunciation || null,
      partOfSpeech: item.data.partOfSpeech || null,
      exampleMk: item.data.exampleMk || null,
      exampleEn: item.data.exampleEn || null,
      icon: item.data.icon || null,
      category: item.data.category || null,
      difficulty: item.data.difficulty,
      formality: item.data.formality || 'neutral',
      usageContext: item.data.usageContext || null,
      includeInWOTD: item.data.includeInWOTD || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Bulk insert using Prisma
    const result = await prisma.practiceVocabulary.createMany({
      data: dataToInsert,
      skipDuplicates: false,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.count} vocabulary words`,
      imported: result.count,
      failed: validationResult.invalid.length,
      errors: validationResult.invalid.length > 0 ? validationResult.invalid : undefined,
    });
  } catch (error) {
    console.error('[API] Error bulk importing vocabulary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
