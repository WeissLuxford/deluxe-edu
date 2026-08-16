-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "lastLessonId" TEXT,
ADD COLUMN     "lastVisitedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "moduleId" TEXT;

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "lastStep" TEXT;

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");

-- CreateIndex
CREATE INDEX "Enrollment_userId_status_idx" ON "Enrollment"("userId", "status");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_order_idx" ON "Lesson"("moduleId", "order");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
