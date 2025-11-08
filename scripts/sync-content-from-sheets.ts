import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CONTENT_ID || '';
// POC: Only sync Family journey for MVP
const JOURNEYS = ['Family'] as const;

type JourneyName = (typeof JOURNEYS)[number];

interface ContentRow {
  moduleNum: string;
  moduleTitle: string;
  lessonNum: string;
  lessonTitle: string;
  lessonSummary: string;
  estimatedMinutes: string;
  difficultyLevel: string;
  vocabMK: string;
  vocabEN: string;
  vocabPronunciation: string;
  exampleMK: string;
  exampleEN: string;
  grammarTitle: string;
  grammarExplanation: string;
  exerciseType: string;
  exerciseQuestion: string;
  exerciseOptions: string;
  correctAnswer: string;
  audioUrl: string;
  videoUrl: string;
}

function parseRow(row: string[]): ContentRow {
  return {
    moduleNum: row[0] || '',
    moduleTitle: row[1] || '',
    lessonNum: row[2] || '',
    lessonTitle: row[3] || '',
    lessonSummary: row[4] || '',
    estimatedMinutes: row[5] || '15',
    difficultyLevel: row[6] || 'beginner',
    vocabMK: row[7] || '',
    vocabEN: row[8] || '',
    vocabPronunciation: row[9] || '',
    exampleMK: row[10] || '',
    exampleEN: row[11] || '',
    grammarTitle: row[12] || '',
    grammarExplanation: row[13] || '',
    exerciseType: row[14] || '',
    exerciseQuestion: row[15] || '',
    exerciseOptions: row[16] || '',
    correctAnswer: row[17] || '',
    audioUrl: row[18] || '',
    videoUrl: row[19] || '',
  };
}

async function authenticateGoogleSheets() {
  console.log('📝 Authenticating with Google Sheets API...');

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_CONTENT_ID environment variable is not set');
  }

  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as any });

  console.log('✅ Authenticated successfully');
  return sheets;
}

async function syncJourneyContent(
  sheets: any,
  journeyName: JourneyName
): Promise<void> {
  console.log(`\n📚 Syncing ${journeyName} journey...`);

  const journeyId = journeyName.toLowerCase();

  try {
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${journeyName}!A2:T1000`, // Skip header row, columns A-T
    });

    const rows = response.data.values || [];
    console.log(`   Found ${rows.length} rows`);

    if (rows.length === 0) {
      console.log(`   ⚠️  No content found for ${journeyName}`);
      return;
    }

    let currentModule: any = null;
    let lessonsCreated = 0;
    let lessonsUpdated = 0;

    for (const rawRow of rows) {
      const row = parseRow(rawRow);

      // Skip empty rows
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

        console.log(`   📦 Module: ${row.moduleTitle}`);
      }

      // Check if lesson already exists
      const lessonOrderIndex = parseInt(row.lessonNum) || 1;
      const existingLesson = await prisma.curriculumLesson.findUnique({
        where: {
          moduleId_orderIndex: {
            moduleId: currentModule.id,
            orderIndex: lessonOrderIndex,
          },
        },
      });

      const isUpdate = !!existingLesson;

      // Create or update lesson
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

      if (isUpdate) {
        lessonsUpdated++;
      } else {
        lessonsCreated++;
      }

      console.log(`      ${isUpdate ? '✏️' : '✨'} Lesson ${lessonOrderIndex}: ${row.lessonTitle}`);

      // Delete existing vocabulary, grammar, and exercises for this lesson
      if (isUpdate) {
        await prisma.$transaction([
          prisma.vocabularyItem.deleteMany({ where: { lessonId: lesson.id } }),
          prisma.grammarNote.deleteMany({ where: { lessonId: lesson.id } }),
          prisma.exercise.deleteMany({ where: { lessonId: lesson.id } }),
        ]);
      }

      // Add vocabulary items
      if (row.vocabMK && row.vocabEN) {
        const macedonianWords = row.vocabMK.split('|').map(w => w.trim());
        const englishWords = row.vocabEN.split('|').map(w => w.trim());
        const pronunciations = row.vocabPronunciation
          ? row.vocabPronunciation.split('|').map(w => w.trim())
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

        console.log(`         📝 Added ${macedonianWords.length} vocabulary items`);
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

        console.log(`         📖 Added grammar note: ${row.grammarTitle}`);
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

        console.log(`         🎯 Added ${row.exerciseType} exercise`);
      }
    }

    console.log(`   ✅ ${journeyName}: Created ${lessonsCreated} lessons, Updated ${lessonsUpdated} lessons`);
  } catch (error) {
    console.error(`   ❌ Error syncing ${journeyName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting content sync from Google Sheets...\n');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}\n`);

  try {
    const sheets = await authenticateGoogleSheets();

    // Sync each journey
    for (const journey of JOURNEYS) {
      await syncJourneyContent(sheets, journey);
    }

    console.log('\n✨ Content sync completed successfully!');
    console.log('\n📈 Summary:');

    // Print summary statistics
    const modules = await prisma.module.count();
    const lessons = await prisma.curriculumLesson.count();
    const vocabulary = await prisma.vocabularyItem.count();
    const exercises = await prisma.exercise.count();

    console.log(`   Modules: ${modules}`);
    console.log(`   Lessons: ${lessons}`);
    console.log(`   Vocabulary Items: ${vocabulary}`);
    console.log(`   Exercises: ${exercises}`);

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
main();
