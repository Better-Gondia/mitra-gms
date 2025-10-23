-- AlterTable
ALTER TABLE "public"."Complaint" ADD COLUMN     "taluka" TEXT;

-- CreateTable
CREATE TABLE "public"."StatusUpdate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "complaintId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatusUpdate_complaintId_idx" ON "public"."StatusUpdate"("complaintId");

-- CreateIndex
CREATE INDEX "StatusUpdate_isActive_idx" ON "public"."StatusUpdate"("isActive");

-- CreateIndex
CREATE INDEX "StatusUpdate_createdAt_idx" ON "public"."StatusUpdate"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."StatusUpdate" ADD CONSTRAINT "StatusUpdate_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
