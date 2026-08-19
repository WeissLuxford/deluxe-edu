-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('HOME_FORM', 'COURSE_PAGE', 'CONTACTS_PAGE', 'TRIAL_LESSON', 'LEVEL_TEST');

-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'ru',
ADD COLUMN     "plan" "Plan",
ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'HOME_FORM';

-- CreateIndex
CREATE INDEX "ContactRequest_courseId_idx" ON "ContactRequest"("courseId");

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
