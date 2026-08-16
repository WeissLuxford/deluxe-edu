-- Раздел «Трансляции» работал на трёх захардкоженных роликах:
-- модели в базе не было вовсе.
CREATE TYPE "StreamKind" AS ENUM ('YOUTUBE', 'ZOOM');

CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "kind" "StreamKind" NOT NULL DEFAULT 'YOUTUBE',
    "youtubeId" TEXT,
    "zoomJoinUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "recordingUrl" TEXT,
    "requiredPlan" "Plan",
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Stream_startsAt_idx" ON "Stream"("startsAt");
CREATE INDEX "Stream_published_idx" ON "Stream"("published");
