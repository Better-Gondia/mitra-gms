/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Complaint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "isPublic",
ADD COLUMN     "isMediaApproved" BOOLEAN NOT NULL DEFAULT false;
