-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "displayId" TEXT,
ADD COLUMN     "isMerged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSplit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mergedIntoComplaintId" INTEGER,
ADD COLUMN     "originalComplaintIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "parentComplaintId" INTEGER,
ADD COLUMN     "splitIndex" INTEGER;

-- CreateIndex
CREATE INDEX "Complaint_parentComplaintId_idx" ON "Complaint"("parentComplaintId");

-- CreateIndex
CREATE INDEX "Complaint_mergedIntoComplaintId_idx" ON "Complaint"("mergedIntoComplaintId");
