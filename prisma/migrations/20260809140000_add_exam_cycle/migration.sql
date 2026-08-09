-- CreateEnum
CREATE TYPE "ExamCyclePhase" AS ENUM ('REGISTRATION', 'PRE_EXAM', 'POST_EXAM', 'COUNSELLING', 'COMPLETE');

-- CreateTable
CREATE TABLE "ExamCycle" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "phase" "ExamCyclePhase" NOT NULL DEFAULT 'REGISTRATION',
    "registrationClose" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "counsellingClose" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamCycle_examId_phase_idx" ON "ExamCycle"("examId", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCycle_examId_cycleYear_key" ON "ExamCycle"("examId", "cycleYear");

-- AddForeignKey
ALTER TABLE "ExamCycle" ADD CONSTRAINT "ExamCycle_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
