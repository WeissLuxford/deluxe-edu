-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordTail",
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ALTER COLUMN "phone" DROP NOT NULL;

-- Бэкфилл: до этой миграции phoneVerified проставлялся только OTP-регистрацией
-- и скриптом создания администратора. Все существующие пользователи пришли
-- через путь с подтверждением номера, поэтому отметка соответствует истине.
-- Без бэкфилла гейт "номер обязателен" отправит их всех на экран привязки.
UPDATE "User"
SET "phoneVerified" = COALESCE("phoneVerified", "createdAt")
WHERE "phone" IS NOT NULL;
