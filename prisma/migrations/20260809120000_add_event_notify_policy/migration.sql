-- CreateEnum
CREATE TYPE "NotifyPolicy" AS ENUM ('ALERT', 'REFERENCE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "notifyPolicy" "NotifyPolicy" NOT NULL DEFAULT 'ALERT';
