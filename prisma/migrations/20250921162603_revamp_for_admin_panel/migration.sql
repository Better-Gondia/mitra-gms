/*
  Warnings:

  - The values [CATEGORY] on the enum `ComplaintPhase` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `imageUrls` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `messages` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrls` on the `Complaint` table. All the data in the column will be lost.
  - The `status` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `latitude` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `longitude` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `StatusUpdate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Bug` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `Complaint` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ComplaintStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'BACKLOG', 'NEED_DETAILS', 'INVALID');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."Department" AS ENUM ('PUBLIC_WORKS', 'WATER_SUPPLY', 'SANITATION', 'HEALTH', 'URBAN_PLANNING', 'POLICE');

-- CreateEnum
CREATE TYPE "public"."BugStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ComplaintPhase_new" AS ENUM ('INIT', 'LANGUAGE', 'COMPLAINT_TYPE', 'TALUKA', 'DESCRIPTION', 'ATTACHMENT', 'LOCATION', 'COMPLETED');
ALTER TABLE "public"."Complaint" ALTER COLUMN "phase" TYPE "public"."ComplaintPhase_new" USING ("phase"::text::"public"."ComplaintPhase_new");
ALTER TYPE "public"."ComplaintPhase" RENAME TO "ComplaintPhase_old";
ALTER TYPE "public"."ComplaintPhase_new" RENAME TO "ComplaintPhase";
DROP TYPE "public"."ComplaintPhase_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'COLLECTOR_TEAM';
ALTER TYPE "public"."Role" ADD VALUE 'DEPARTMENT_TEAM';
ALTER TYPE "public"."Role" ADD VALUE 'SUPERINTENDENT_OF_POLICE';
ALTER TYPE "public"."Role" ADD VALUE 'MP_RAJYA_SABHA';

-- DropForeignKey
ALTER TABLE "public"."Bug" DROP CONSTRAINT "Bug_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Complaint" DROP CONSTRAINT "Complaint_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Interaction" DROP CONSTRAINT "Interaction_complaintId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Interaction" DROP CONSTRAINT "Interaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StatusUpdate" DROP CONSTRAINT "StatusUpdate_complaintId_fkey";

-- AlterTable
ALTER TABLE "public"."Bug" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "status" "public"."BugStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Complaint" DROP COLUMN "imageUrls",
DROP COLUMN "messages",
DROP COLUMN "videoUrls",
ADD COLUMN     "department" "public"."Department",
ADD COLUMN     "linkedComplaintIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "media" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "subcategory" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ComplaintStatus" NOT NULL DEFAULT 'OPEN',
DROP COLUMN "latitude",
ADD COLUMN     "latitude" DECIMAL(65,30),
DROP COLUMN "longitude",
ADD COLUMN     "longitude" DECIMAL(65,30),
ALTER COLUMN "type" SET NOT NULL;

-- DropTable
DROP TABLE "public"."StatusUpdate";

-- CreateTable
CREATE TABLE "public"."ComplaintHistory" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "public"."Role" NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "attachment" TEXT,
    "eta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintHistory_complaintId_idx" ON "public"."ComplaintHistory"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintHistory_userId_idx" ON "public"."ComplaintHistory"("userId");

-- CreateIndex
CREATE INDEX "ComplaintHistory_createdAt_idx" ON "public"."ComplaintHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "public"."Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_department_idx" ON "public"."Complaint"("department");

-- CreateIndex
CREATE INDEX "Complaint_priority_idx" ON "public"."Complaint"("priority");

-- CreateIndex
CREATE INDEX "Complaint_category_subcategory_idx" ON "public"."Complaint"("category", "subcategory");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- AddForeignKey
ALTER TABLE "public"."Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplaintHistory" ADD CONSTRAINT "ComplaintHistory_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplaintHistory" ADD CONSTRAINT "ComplaintHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interaction" ADD CONSTRAINT "Interaction_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bug" ADD CONSTRAINT "Bug_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
