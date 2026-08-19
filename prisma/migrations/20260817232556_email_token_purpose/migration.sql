-- CreateEnum
CREATE TYPE "EmailTokenPurpose" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "public"."VerificationToken_userId_idx";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "purpose" "EmailTokenPurpose" NOT NULL DEFAULT 'EMAIL_VERIFY';

-- CreateIndex
CREATE INDEX "VerificationToken_userId_purpose_idx" ON "VerificationToken"("userId", "purpose");

