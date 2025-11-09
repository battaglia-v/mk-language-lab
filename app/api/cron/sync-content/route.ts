import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to parse Google credentials (handles both raw JSON and base64-encoded)
const parseCredentials = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      throw error;
    }
  }
};

// This will be called by Vercel Cron or manually
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Starting content sync from cron job...');
    }

    // Run the sync
    await syncContentFromSheets();

    return NextResponse.json({
      success: true,
      message: 'Content synced successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron sync failed:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function syncContentFromSheets() {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CONTENT_ID || '';
  // POC: Only sync Family journey for MVP
  const JOURNEYS = ['Family'] as const;

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not set');
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_CONTENT_ID not set');
  }

  const credentials = parseCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as unknown as string | OAuth2Client });

  for (const journeyName of JOURNEYS) {
    const journeyId = journeyName.toLowerCase();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${journeyName}!A2:T1000`,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      continue;
    }

    let currentModule: { id: string; orderIndex: number; title: string } | null = null;

    for (const rawRow of rows) {
      const row = {
        moduleNum: rawRow[0] || '',
        moduleTitle: rawRow[1] || '',
        lessonNum: rawRow[2] || '',
        lessonTitle: rawRow[3] || '',
        lessonSummary: rawRow[4] || '',
        estimatedMinutes: rawRow[5] || '15',
        difficultyLevel: rawRow[6] || 'beginner',
        vocabMK: rawRow[7] || '',
        vocabEN: rawRow[8] || '',
        vocabPronunciation: rawRow[9] || '',
        exampleMK: rawRow[10] || '',
        exampleEN: rawRow[11] || '',
        grammarTitle: rawRow[12] || '',
        grammarExplanation: rawRow[13] || '',
        exerciseType: rawRow[14] || '',
        exerciseQuestion: rawRow[15] || '',
        exerciseOptions: rawRow[16] || '',
        correctAnswer: rawRow[17] || '',
        audioUrl: rawRow[18] || '',
        videoUrl: rawRow[19] || '',
      };

      if (!row.moduleTitle || !row.lessonTitle) {
        continue;
      }

      // Create or update module
      if (!currentModule || currentModule.title !== row.moduleTitle) {
        const moduleOrderIndex = parseInt(row.moduleNum) || 1;

        currentModule = await prisma.module.upsert({
          where: {
            journeyId_orderIndex: {
              journeyId,
              orderIndex: moduleOrderIndex,
            },
          },
          update: {
            title: row.moduleTitle,
            description: row.moduleTitle,
          },
          create: {
            journeyId,
            title: row.moduleTitle,
            description: row.moduleTitle,
            orderIndex: moduleOrderIndex,
          },
        });
      }

      // Create or update lesson
      const lessonOrderIndex = parseInt(row.lessonNum) || 1;
      const existingLesson = await prisma.curriculumLesson.findUnique({
        where: {
          moduleId_orderIndex: {
            moduleId: currentModule.id,
            orderIndex: lessonOrderIndex,
          },
        },
      });

      const lesson = await prisma.curriculumLesson.upsert({
        where: {
          moduleId_orderIndex: {
            moduleId: currentModule.id,
            orderIndex: lessonOrderIndex,
          },
        },
        update: {
          title: row.lessonTitle,
          summary: row.lessonSummary || null,
          content: row.lessonSummary || '',
          estimatedMinutes: parseInt(row.estimatedMinutes) || 15,
          difficultyLevel: row.difficultyLevel || 'beginner',
          audioUrl: row.audioUrl || null,
          videoUrl: row.videoUrl || null,
        },
        create: {
          moduleId: currentModule.id,
          title: row.lessonTitle,
          summary: row.lessonSummary || null,
          content: row.lessonSummary || '',
          orderIndex: lessonOrderIndex,
          estimatedMinutes: parseInt(row.estimatedMinutes) || 15,
          difficultyLevel: row.difficultyLevel || 'beginner',
          audioUrl: row.audioUrl || null,
          videoUrl: row.videoUrl || null,
        },
      });

      // Delete and recreate vocabulary, grammar, exercises
      if (existingLesson) {
        await prisma.$transaction([
          prisma.vocabularyItem.deleteMany({ where: { lessonId: lesson.id } }),
          prisma.grammarNote.deleteMany({ where: { lessonId: lesson.id } }),
          prisma.exercise.deleteMany({ where: { lessonId: lesson.id } }),
        ]);
      }

      // Add vocabulary
      if (row.vocabMK && row.vocabEN) {
        const macedonianWords = row.vocabMK.split('|').map((w: string) => w.trim());
        const englishWords = row.vocabEN.split('|').map((w: string) => w.trim());
        const pronunciations = row.vocabPronunciation
          ? row.vocabPronunciation.split('|').map((w: string) => w.trim())
          : [];

        for (let i = 0; i < macedonianWords.length; i++) {
          if (macedonianWords[i] && englishWords[i]) {
            await prisma.vocabularyItem.create({
              data: {
                lessonId: lesson.id,
                macedonianText: macedonianWords[i],
                englishText: englishWords[i],
                pronunciation: pronunciations[i] || null,
                exampleSentenceMk: row.exampleMK || null,
                exampleSentenceEn: row.exampleEN || null,
                orderIndex: i,
              },
            });
          }
        }
      }

      // Add grammar note
      if (row.grammarTitle && row.grammarExplanation) {
        await prisma.grammarNote.create({
          data: {
            lessonId: lesson.id,
            title: row.grammarTitle,
            explanation: row.grammarExplanation,
            examples: JSON.stringify([]),
            orderIndex: 0,
          },
        });
      }

      // Add exercise
      if (row.exerciseType && row.exerciseQuestion) {
        await prisma.exercise.create({
          data: {
            lessonId: lesson.id,
            type: row.exerciseType,
            question: row.exerciseQuestion,
            options: row.exerciseOptions || '',
            correctAnswer: row.correctAnswer || '',
            explanation: '',
            orderIndex: 0,
          },
        });
      }
    }
  }

  await prisma.$disconnect();
}
