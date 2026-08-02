-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegramUserId" TEXT,
ADD COLUMN "telegramUsername" TEXT,
ADD COLUMN "linkCode" TEXT,
ADD COLUMN "linkCodeExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_linkCode_key" ON "User"("linkCode");
