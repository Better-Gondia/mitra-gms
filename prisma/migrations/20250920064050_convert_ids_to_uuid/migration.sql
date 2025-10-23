/*
  Warnings:

  - The primary key for the `Bug` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Complaint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `latitude` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Complaint` table. All the data in the column will be lost.
  - The primary key for the `StatusUpdate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `phase` to the `Complaint` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ComplaintPhase" AS ENUM ('INIT', 'LANGUAGE', 'COMPLAINT_TYPE', 'CATEGORY', 'DESCRIPTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('HINDI', 'ENGLISH', 'MARATHI');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('COMPLAINT', 'SUGGESTION');

-- DropForeignKey
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_userId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_complaintId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatusUpdate" DROP CONSTRAINT "StatusUpdate_complaintId_fkey";

-- AlterTable
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "reporterId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Bug_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Bug_id_seq";

-- AlterTable
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_pkey",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "title",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'ENGLISH',
ADD COLUMN     "phase" "ComplaintPhase" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ADD CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Complaint_id_seq";

-- AlterTable
ALTER TABLE "Interaction" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "complaintId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "StatusUpdate" DROP CONSTRAINT "StatusUpdate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "complaintId" SET DATA TYPE TEXT,
ADD CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "StatusUpdate_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
