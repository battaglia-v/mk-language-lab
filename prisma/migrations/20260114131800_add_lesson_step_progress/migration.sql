-- AlterTable
ALTER TABLE "UserLessonProgress" ADD COLUMN     "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stepAnswers" JSONB;
