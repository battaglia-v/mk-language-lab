-- CreateEnum
CREATE TYPE "PracticeAudioStatus" AS ENUM ('draft', 'processing', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PracticeAudioSource" AS ENUM ('human', 'tts');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ReaderLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- AlterTable
ALTER TABLE "GameProgress" ADD COLUMN     "dailyGoalXP" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "todayXP" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLessons" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReminderSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PracticeAudio" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'mk',
    "speaker" TEXT,
    "speed" TEXT,
    "variant" TEXT,
    "duration" DOUBLE PRECISION,
    "status" "PracticeAudioStatus" NOT NULL DEFAULT 'draft',
    "sourceType" "PracticeAudioSource" NOT NULL DEFAULT 'human',
    "cdnUrl" TEXT NOT NULL,
    "slowUrl" TEXT,
    "waveform" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "PracticeAudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDeck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "cardCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDeckCard" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "macedonian" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "macedonianAlternates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "englishAlternates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDeckCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "targetUnit" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "currencyReward" INTEGER NOT NULL DEFAULT 10,
    "difficultyLevel" TEXT NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" TEXT NOT NULL,
    "rarityTier" TEXT NOT NULL DEFAULT 'common',
    "unlockCondition" TEXT NOT NULL,
    "costGems" INTEGER NOT NULL DEFAULT 0,
    "isAvailableInShop" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3),
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "lifetimeGemsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currencyType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "minStreak" INTEGER NOT NULL,
    "maxStreak" INTEGER,
    "xpMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER DEFAULT 0,
    "weeklyXP" INTEGER NOT NULL DEFAULT 0,
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "relegated" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderText" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" "ReaderLevel" NOT NULL,
    "category" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMk" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "estimatedMins" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 20,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderSentence" (
    "id" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "contentMk" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "audioUrl" TEXT,
    "vocabulary" JSONB,
    "grammarNote" TEXT,
    "culturalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "currentSentence" INTEGER NOT NULL DEFAULT 0,
    "sentencesRead" INTEGER NOT NULL DEFAULT 0,
    "totalSentences" INTEGER NOT NULL,
    "timeSpentSecs" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "xpGoal" INTEGER NOT NULL DEFAULT 50,
    "practiceMinutes" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "streakProtected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakFreeze" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,

    CONSTRAINT "StreakFreeze_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordMk" TEXT NOT NULL,
    "wordEn" TEXT NOT NULL,
    "phonetic" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "audioUrl" TEXT,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "timesReviewed" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB,
    "screenName" TEXT,
    "deviceType" TEXT,
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeAudio_promptId_key" ON "PracticeAudio"("promptId");

-- CreateIndex
CREATE INDEX "PracticeAudio_promptId_idx" ON "PracticeAudio"("promptId");

-- CreateIndex
CREATE INDEX "PracticeAudio_status_idx" ON "PracticeAudio"("status");

-- CreateIndex
CREATE INDEX "CustomDeck_userId_isArchived_idx" ON "CustomDeck"("userId", "isArchived");

-- CreateIndex
CREATE INDEX "CustomDeck_userId_createdAt_idx" ON "CustomDeck"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomDeckCard_deckId_orderIndex_idx" ON "CustomDeckCard"("deckId", "orderIndex");

-- CreateIndex
CREATE INDEX "CustomDeckCard_deckId_createdAt_idx" ON "CustomDeckCard"("deckId", "createdAt");

-- CreateIndex
CREATE INDEX "Quest_type_isActive_startDate_idx" ON "Quest"("type", "isActive", "startDate");

-- CreateIndex
CREATE INDEX "Quest_category_idx" ON "Quest"("category");

-- CreateIndex
CREATE INDEX "UserQuestProgress_userId_status_idx" ON "UserQuestProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "UserQuestProgress_questId_status_idx" ON "UserQuestProgress"("questId", "status");

-- CreateIndex
CREATE INDEX "UserQuestProgress_userId_updatedAt_idx" ON "UserQuestProgress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestProgress_userId_questId_key" ON "UserQuestProgress"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE INDEX "Badge_category_isActive_idx" ON "Badge"("category", "isActive");

-- CreateIndex
CREATE INDEX "Badge_isAvailableInShop_isActive_idx" ON "Badge"("isAvailableInShop", "isActive");

-- CreateIndex
CREATE INDEX "UserBadge_userId_isEquipped_idx" ON "UserBadge"("userId", "isEquipped");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE INDEX "UserBadge_userId_createdAt_idx" ON "UserBadge"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_userId_key" ON "Currency"("userId");

-- CreateIndex
CREATE INDEX "Currency_userId_idx" ON "Currency"("userId");

-- CreateIndex
CREATE INDEX "CurrencyTransaction_userId_createdAt_idx" ON "CurrencyTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CurrencyTransaction_reason_idx" ON "CurrencyTransaction"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "League_name_key" ON "League"("name");

-- CreateIndex
CREATE INDEX "League_tier_idx" ON "League"("tier");

-- CreateIndex
CREATE INDEX "LeagueMembership_leagueId_rank_idx" ON "LeagueMembership"("leagueId", "rank");

-- CreateIndex
CREATE INDEX "LeagueMembership_userId_idx" ON "LeagueMembership"("userId");

-- CreateIndex
CREATE INDEX "LeagueMembership_leagueId_weeklyXP_idx" ON "LeagueMembership"("leagueId", "weeklyXP");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMembership_userId_leagueId_key" ON "LeagueMembership"("userId", "leagueId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_scheduledFor_idx" ON "Notification"("type", "scheduledFor");

-- CreateIndex
CREATE INDEX "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");

-- CreateIndex
CREATE INDEX "Friendship_requesterId_status_idx" ON "Friendship"("requesterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderText_slug_key" ON "ReaderText"("slug");

-- CreateIndex
CREATE INDEX "ReaderText_level_isPublished_idx" ON "ReaderText"("level", "isPublished");

-- CreateIndex
CREATE INDEX "ReaderText_category_idx" ON "ReaderText"("category");

-- CreateIndex
CREATE INDEX "ReaderSentence_textId_idx" ON "ReaderSentence"("textId");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderSentence_textId_orderIndex_key" ON "ReaderSentence"("textId", "orderIndex");

-- CreateIndex
CREATE INDEX "ReaderSession_userId_textId_idx" ON "ReaderSession"("userId", "textId");

-- CreateIndex
CREATE INDEX "ReaderSession_userId_completedAt_idx" ON "ReaderSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "DailyProgress_userId_date_idx" ON "DailyProgress"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyProgress_userId_date_key" ON "DailyProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "StreakFreeze_userId_usedAt_idx" ON "StreakFreeze"("userId", "usedAt");

-- CreateIndex
CREATE INDEX "VocabularyWord_userId_mastery_idx" ON "VocabularyWord"("userId", "mastery");

-- CreateIndex
CREATE INDEX "VocabularyWord_userId_nextReviewAt_idx" ON "VocabularyWord"("userId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyWord_userId_wordMk_key" ON "VocabularyWord"("userId", "wordMk");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_eventName_idx" ON "AnalyticsEvent"("userId", "eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_createdAt_idx" ON "AnalyticsEvent"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "CustomDeck" ADD CONSTRAINT "CustomDeck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDeckCard" ADD CONSTRAINT "CustomDeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "CustomDeck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyTransaction" ADD CONSTRAINT "CurrencyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMembership" ADD CONSTRAINT "LeagueMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMembership" ADD CONSTRAINT "LeagueMembership_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderSentence" ADD CONSTRAINT "ReaderSentence_textId_fkey" FOREIGN KEY ("textId") REFERENCES "ReaderText"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderSession" ADD CONSTRAINT "ReaderSession_textId_fkey" FOREIGN KEY ("textId") REFERENCES "ReaderText"("id") ON DELETE CASCADE ON UPDATE CASCADE;
