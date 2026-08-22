-- CreateEnum
CREATE TYPE "ExamReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DialogueAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "hasDialogue" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "passedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "prompt" JSONB NOT NULL,
    "answerKey" JSONB,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "grade" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "ExamReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "characters" JSONB NOT NULL,
    "lines" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dialogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueAttempt" (
    "id" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "status" "DialogueAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DialogueAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueLineRecording" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DialogueLineRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_moduleId_key" ON "Exam"("moduleId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_userId_submittedAt_idx" ON "ExamAttempt"("examId", "userId", "submittedAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_reviewStatus_idx" ON "ExamAttempt"("reviewStatus");

-- CreateIndex
CREATE INDEX "DialogueAttempt_dialogueId_userId_idx" ON "DialogueAttempt"("dialogueId", "userId");

-- CreateIndex
CREATE INDEX "DialogueLineRecording_attemptId_idx" ON "DialogueLineRecording"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "DialogueLineRecording_attemptId_lineId_key" ON "DialogueLineRecording"("attemptId", "lineId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_passedAt_idx" ON "LessonProgress"("userId", "passedAt");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueAttempt" ADD CONSTRAINT "DialogueAttempt_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "Dialogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueAttempt" ADD CONSTRAINT "DialogueAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueLineRecording" ADD CONSTRAINT "DialogueLineRecording_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DialogueAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
