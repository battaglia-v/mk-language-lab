-- CreateEnum
CREATE TYPE "MobilePushPlatform" AS ENUM ('ios', 'android');

-- CreateTable
CREATE TABLE "MobilePushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "expoPushToken" TEXT NOT NULL,
    "platform" "MobilePushPlatform" NOT NULL,
    "appVersion" TEXT,
    "locale" TEXT,
    "reminderWindows" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "lastSuccessfulSync" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilePushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobilePushToken_expoPushToken_key" ON "MobilePushToken"("expoPushToken");

-- CreateIndex
CREATE INDEX "MobilePushToken_userId_idx" ON "MobilePushToken"("userId");

-- AddForeignKey
ALTER TABLE "MobilePushToken" ADD CONSTRAINT "MobilePushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
