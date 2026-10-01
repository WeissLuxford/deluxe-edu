-- News imported from Instagram: post id (imported once) and its link.
ALTER TABLE "News" ADD COLUMN "instagramId" TEXT;
ALTER TABLE "News" ADD COLUMN "instagramUrl" TEXT;
CREATE UNIQUE INDEX "News_instagramId_key" ON "News"("instagramId");

-- Integration state that must survive deploys (Instagram token, last sync).
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);
