-- Merge the three per-locale News rows (grouped by "groupId") into a single
-- row per article, with title/lead/body/metaTitle/metaDescription stored as
-- {ru,uz,en} JSON, one shared slug, one publishedAt, one published flag.
-- Canonical row per group is preferred in order ru -> uz -> en.

BEGIN;

CREATE TEMP TABLE news_canonical AS
SELECT DISTINCT ON ("groupId") "groupId", "id" AS canonical_id
FROM "News"
ORDER BY "groupId",
  CASE "locale" WHEN 'ru' THEN 0 WHEN 'uz' THEN 1 WHEN 'en' THEN 2 ELSE 3 END;

CREATE TEMP TABLE news_agg AS
SELECT
  "groupId",
  jsonb_object_agg("locale", "title") AS title_json,
  jsonb_object_agg("locale", "lead") AS lead_json,
  jsonb_object_agg("locale", "body") AS body_json,
  jsonb_object_agg("locale", "metaTitle") FILTER (WHERE "metaTitle" IS NOT NULL) AS meta_title_json,
  jsonb_object_agg("locale", "metaDescription") FILTER (WHERE "metaDescription" IS NOT NULL) AS meta_description_json,
  COALESCE(MAX("coverUrl") FILTER (WHERE "locale" = 'ru'), MAX("coverUrl")) AS cover_url,
  COALESCE(
    MAX("slug") FILTER (WHERE "locale" = 'ru'),
    MAX("slug") FILTER (WHERE "locale" = 'uz'),
    MAX("slug") FILTER (WHERE "locale" = 'en')
  ) AS canonical_slug,
  bool_or("published") AS any_published,
  MIN("publishedAt") AS min_published_at
FROM "News"
GROUP BY "groupId";

ALTER TABLE "News" ADD COLUMN "titleJson" JSONB;
ALTER TABLE "News" ADD COLUMN "leadJson" JSONB;
ALTER TABLE "News" ADD COLUMN "bodyJson" JSONB;
ALTER TABLE "News" ADD COLUMN "metaTitleJson" JSONB;
ALTER TABLE "News" ADD COLUMN "metaDescriptionJson" JSONB;

UPDATE "News" n
SET
  "titleJson" = ag.title_json,
  "leadJson" = ag.lead_json,
  "bodyJson" = ag.body_json,
  "metaTitleJson" = ag.meta_title_json,
  "metaDescriptionJson" = ag.meta_description_json,
  "slug" = ag.canonical_slug,
  "coverUrl" = ag.cover_url,
  "published" = ag.any_published,
  "publishedAt" = ag.min_published_at
FROM news_canonical c
JOIN news_agg ag ON ag."groupId" = c."groupId"
WHERE n."id" = c.canonical_id;

DELETE FROM "News" n
WHERE n."id" NOT IN (SELECT canonical_id FROM news_canonical);

DROP TABLE news_canonical;
DROP TABLE news_agg;

-- DropIndex
DROP INDEX "News_locale_slug_key";
DROP INDEX "News_groupId_idx";
DROP INDEX "News_locale_published_publishedAt_idx";

-- AlterTable: drop old per-locale columns, promote new JSON columns
ALTER TABLE "News" DROP COLUMN "groupId";
ALTER TABLE "News" DROP COLUMN "locale";
ALTER TABLE "News" DROP COLUMN "title";
ALTER TABLE "News" DROP COLUMN "lead";
ALTER TABLE "News" DROP COLUMN "body";
ALTER TABLE "News" DROP COLUMN "metaTitle";
ALTER TABLE "News" DROP COLUMN "metaDescription";

ALTER TABLE "News" RENAME COLUMN "titleJson" TO "title";
ALTER TABLE "News" RENAME COLUMN "leadJson" TO "lead";
ALTER TABLE "News" RENAME COLUMN "bodyJson" TO "body";
ALTER TABLE "News" RENAME COLUMN "metaTitleJson" TO "metaTitle";
ALTER TABLE "News" RENAME COLUMN "metaDescriptionJson" TO "metaDescription";

ALTER TABLE "News" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "News" ALTER COLUMN "lead" SET NOT NULL;
ALTER TABLE "News" ALTER COLUMN "body" SET NOT NULL;
ALTER TABLE "News" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
CREATE INDEX "News_published_publishedAt_idx" ON "News"("published", "publishedAt");

COMMIT;
