INSERT INTO "Module" ("id", "courseId", "title", "description", "order")
SELECT
  'mod_' || c."id",
  c."id",
  '{"ru":"Основная программа","uz":"Asosiy dastur","en":"Main programme"}'::jsonb,
  NULL,
  0
FROM "Course" c
WHERE EXISTS (SELECT 1 FROM "Lesson" l WHERE l."courseId" = c."id")
  AND NOT EXISTS (SELECT 1 FROM "Module" m WHERE m."courseId" = c."id");

UPDATE "Lesson" l
SET "moduleId" = m."id"
FROM "Module" m
WHERE m."courseId" = l."courseId"
  AND m."order" = 0
  AND l."moduleId" IS NULL;
