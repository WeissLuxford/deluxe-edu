-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('WEB', 'IOS', 'ANDROID');

-- AlterTable
ALTER TABLE "UserDevice" ADD COLUMN     "clientDeviceId" TEXT,
ADD COLUMN     "platform" "DevicePlatform" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_clientDeviceId_key" ON "UserDevice"("userId", "clientDeviceId");
