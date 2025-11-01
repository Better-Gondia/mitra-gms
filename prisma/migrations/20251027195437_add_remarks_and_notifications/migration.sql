-- CreateEnum
CREATE TYPE "RemarkVisibility" AS ENUM ('PUBLIC', 'INTERNAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REMARK', 'STATUS_CHANGE', 'TAG', 'ASSIGNMENT');

-- AlterTable
ALTER TABLE "ComplaintHistory" ADD COLUMN     "isRemark" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newStatus" "ComplaintStatus",
ADD COLUMN     "oldStatus" "ComplaintStatus",
ADD COLUMN     "visibility" "RemarkVisibility" NOT NULL DEFAULT 'INTERNAL';

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER,
    "forRole" "Role" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_complaintId_idx" ON "Notification"("complaintId");

-- CreateIndex
CREATE INDEX "Notification_forRole_idx" ON "Notification"("forRole");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "ComplaintHistory_isRemark_idx" ON "ComplaintHistory"("isRemark");

-- CreateIndex
CREATE INDEX "ComplaintHistory_visibility_idx" ON "ComplaintHistory"("visibility");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
