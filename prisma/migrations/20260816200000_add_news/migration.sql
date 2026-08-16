CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "coverUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "News_locale_slug_key" ON "News"("locale", "slug");
CREATE INDEX "News_groupId_idx" ON "News"("groupId");
CREATE INDEX "News_locale_published_publishedAt_idx" ON "News"("locale", "published", "publishedAt");
