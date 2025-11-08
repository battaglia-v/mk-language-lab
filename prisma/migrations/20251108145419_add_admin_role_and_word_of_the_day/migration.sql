-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "WordOfTheDay" (
    "id" TEXT NOT NULL,
    "macedonian" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "exampleMk" TEXT NOT NULL,
    "exampleEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordOfTheDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordOfTheDay_scheduledDate_key" ON "WordOfTheDay"("scheduledDate");

-- CreateIndex
CREATE INDEX "WordOfTheDay_scheduledDate_isActive_idx" ON "WordOfTheDay"("scheduledDate", "isActive");

-- CreateIndex
CREATE INDEX "WordOfTheDay_isActive_idx" ON "WordOfTheDay"("isActive");
