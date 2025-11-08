-- CreateTable
CREATE TABLE "PracticeVocabulary" (
    "id" TEXT NOT NULL,
    "macedonian" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeVocabulary_isActive_difficulty_idx" ON "PracticeVocabulary"("isActive", "difficulty");

-- CreateIndex
CREATE INDEX "PracticeVocabulary_category_idx" ON "PracticeVocabulary"("category");
