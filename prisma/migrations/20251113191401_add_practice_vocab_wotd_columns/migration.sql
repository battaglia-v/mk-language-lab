/*
  Warnings:

  - A unique constraint covering the columns `[scheduledDate]` on the table `PracticeVocabulary` will be added. If there are existing duplicate values, this will fail.
  - Made the column `formality` on table `PracticeVocabulary` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PracticeVocabulary" ADD COLUMN     "exampleEn" TEXT,
ADD COLUMN     "exampleMk" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "includeInWOTD" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partOfSpeech" TEXT,
ADD COLUMN     "pronunciation" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ALTER COLUMN "formality" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "GameProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "hearts" INTEGER NOT NULL DEFAULT 5,
    "lastPracticeDate" TIMESTAMP(3),
    "streakUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProgress_userId_key" ON "GameProgress"("userId");

-- CreateIndex
CREATE INDEX "GameProgress_userId_idx" ON "GameProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeVocabulary_scheduledDate_key" ON "PracticeVocabulary"("scheduledDate");

-- CreateIndex
CREATE INDEX "PracticeVocabulary_includeInWOTD_scheduledDate_idx" ON "PracticeVocabulary"("includeInWOTD", "scheduledDate");

-- AddForeignKey
ALTER TABLE "GameProgress" ADD CONSTRAINT "GameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
