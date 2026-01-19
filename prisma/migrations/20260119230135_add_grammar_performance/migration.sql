/*
  Warnings:

  - You are about to drop the `PracticeAudio` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "GameProgress" ADD COLUMN     "weekResetAt" TIMESTAMP(3),
ADD COLUMN     "weeklyXP" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GrammarNote" ADD COLUMN     "category" TEXT,
ADD COLUMN     "relatedVerb" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyGoal" INTEGER DEFAULT 20,
ADD COLUMN     "locale" TEXT DEFAULT 'en';

-- AlterTable
ALTER TABLE "VocabularyItem" ADD COLUMN     "category" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isCore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "partOfSpeech" TEXT,
ADD COLUMN     "transliteration" TEXT;

-- DropTable
DROP TABLE "PracticeAudio";

-- DropEnum
DROP TYPE "PracticeAudioSource";

-- DropEnum
DROP TYPE "PracticeAudioStatus";

-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dialogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueLine" (
    "id" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "speaker" TEXT,
    "textMk" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "transliteration" TEXT,
    "hasBlanks" BOOLEAN NOT NULL DEFAULT false,
    "blanksData" TEXT,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "DialogueLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConjugationTable" (
    "id" TEXT NOT NULL,
    "grammarNoteId" TEXT NOT NULL,
    "verb" TEXT NOT NULL,
    "verbEn" TEXT,
    "tense" TEXT NOT NULL DEFAULT 'present',
    "type" TEXT NOT NULL DEFAULT 'affirmative',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConjugationTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConjugationRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "pronoun" TEXT NOT NULL,
    "conjugation" TEXT NOT NULL,
    "transliteration" TEXT,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "ConjugationRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PictureExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT,
    "instructions" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PictureExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PictureExerciseItem" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "textMk" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "PictureExerciseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "attempts" JSONB NOT NULL DEFAULT '[]',
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dialogue_lessonId_orderIndex_idx" ON "Dialogue"("lessonId", "orderIndex");

-- CreateIndex
CREATE INDEX "DialogueLine_dialogueId_orderIndex_idx" ON "DialogueLine"("dialogueId", "orderIndex");

-- CreateIndex
CREATE INDEX "ConjugationTable_grammarNoteId_idx" ON "ConjugationTable"("grammarNoteId");

-- CreateIndex
CREATE INDEX "ConjugationRow_tableId_orderIndex_idx" ON "ConjugationRow"("tableId", "orderIndex");

-- CreateIndex
CREATE INDEX "PictureExercise_lessonId_orderIndex_idx" ON "PictureExercise"("lessonId", "orderIndex");

-- CreateIndex
CREATE INDEX "PictureExerciseItem_exerciseId_orderIndex_idx" ON "PictureExerciseItem"("exerciseId", "orderIndex");

-- CreateIndex
CREATE INDEX "GrammarPerformance_userId_idx" ON "GrammarPerformance"("userId");

-- CreateIndex
CREATE INDEX "GrammarPerformance_topicId_idx" ON "GrammarPerformance"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarPerformance_userId_topicId_key" ON "GrammarPerformance"("userId", "topicId");

-- CreateIndex
CREATE INDEX "VocabularyItem_category_idx" ON "VocabularyItem"("category");

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueLine" ADD CONSTRAINT "DialogueLine_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "Dialogue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConjugationTable" ADD CONSTRAINT "ConjugationTable_grammarNoteId_fkey" FOREIGN KEY ("grammarNoteId") REFERENCES "GrammarNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConjugationRow" ADD CONSTRAINT "ConjugationRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "ConjugationTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PictureExercise" ADD CONSTRAINT "PictureExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PictureExerciseItem" ADD CONSTRAINT "PictureExerciseItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "PictureExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarPerformance" ADD CONSTRAINT "GrammarPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
