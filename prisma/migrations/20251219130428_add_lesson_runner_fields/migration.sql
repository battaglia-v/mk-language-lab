/*
  Warnings:

  - Added the required column `updatedAt` to the `CurriculumLesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'inactive', 'canceled', 'past_due', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionSource" AS ENUM ('none', 'google_play', 'stripe', 'promo');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'needs_review', 'approved', 'published');

-- AlterTable
ALTER TABLE "CurriculumLesson" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastEditedAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedBy" TEXT,
ADD COLUMN     "lessonRunnerConfig" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "useLessonRunner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PracticeAudio" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "lastEditedAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedBy" TEXT;

-- AlterTable
ALTER TABLE "PracticeVocabulary" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'published',
ADD COLUMN     "lastEditedAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedBy" TEXT;

-- AlterTable
ALTER TABLE "WordOfTheDay" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'published',
ADD COLUMN     "lastEditedAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedBy" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'inactive',
    "source" "SubscriptionSource" NOT NULL DEFAULT 'none',
    "productId" TEXT,
    "period" TEXT,
    "purchaseToken" TEXT,
    "orderId" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "grantedBy" TEXT,
    "grantReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentEditLog" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_source_idx" ON "Subscription"("source");

-- CreateIndex
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");

-- CreateIndex
CREATE INDEX "ContentEditLog_contentType_contentId_idx" ON "ContentEditLog"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "ContentEditLog_userId_idx" ON "ContentEditLog"("userId");

-- CreateIndex
CREATE INDEX "ContentEditLog_createdAt_idx" ON "ContentEditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ContentEditLog_action_idx" ON "ContentEditLog"("action");

-- CreateIndex
CREATE INDEX "CurriculumLesson_contentStatus_idx" ON "CurriculumLesson"("contentStatus");

-- CreateIndex
CREATE INDEX "PracticeVocabulary_contentStatus_idx" ON "PracticeVocabulary"("contentStatus");

-- CreateIndex
CREATE INDEX "WordOfTheDay_contentStatus_idx" ON "WordOfTheDay"("contentStatus");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
