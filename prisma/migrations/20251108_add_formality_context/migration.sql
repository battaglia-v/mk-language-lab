-- Add formality and usageContext fields to PracticeVocabulary
-- Migration: 20251108_add_formality_context

ALTER TABLE "PracticeVocabulary"
ADD COLUMN IF NOT EXISTS "formality" TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS "usageContext" TEXT;

-- Add index for formality filtering
CREATE INDEX IF NOT EXISTS "PracticeVocabulary_formality_idx" ON "PracticeVocabulary"("formality");

-- Add comment
COMMENT ON COLUMN "PracticeVocabulary"."formality" IS 'Formality level: formal, neutral, or informal';
COMMENT ON COLUMN "PracticeVocabulary"."usageContext" IS 'Usage context and situational notes';
