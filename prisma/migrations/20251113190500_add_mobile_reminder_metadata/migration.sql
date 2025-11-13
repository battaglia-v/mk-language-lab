-- Add timezone + reminder metadata fields for mobile push tokens
ALTER TABLE "MobilePushToken"
  ADD COLUMN IF NOT EXISTS "timezone" TEXT,
  ADD COLUMN IF NOT EXISTS "lastReminderSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastReminderWindowId" TEXT;
