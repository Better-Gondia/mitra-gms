/*
  Warnings:

  - You are about to drop the column `isRemark` on the `ComplaintHistory` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `ComplaintHistory` table. All the data in the column will be lost.
  - You are about to drop the column `complaintId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_complaintId_fkey";

-- DropIndex
DROP INDEX "public"."ComplaintHistory_isRemark_idx";

-- DropIndex
DROP INDEX "public"."ComplaintHistory_visibility_idx";

-- DropIndex
DROP INDEX "public"."Notification_complaintId_idx";

-- DropIndex
DROP INDEX "public"."Notification_isRead_idx";

-- AlterTable
ALTER TABLE "ComplaintHistory" DROP COLUMN "isRemark",
DROP COLUMN "visibility";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "complaintId",
DROP COLUMN "isRead",
DROP COLUMN "readAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasNotifications" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Remark" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "visibility" "RemarkVisibility" NOT NULL DEFAULT 'INTERNAL',
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Remark_complaintId_idx" ON "Remark"("complaintId");

-- CreateIndex
CREATE INDEX "Remark_userId_idx" ON "Remark"("userId");

-- CreateIndex
CREATE INDEX "Remark_visibility_idx" ON "Remark"("visibility");

-- CreateIndex
CREATE INDEX "Remark_createdAt_idx" ON "Remark"("createdAt");

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
