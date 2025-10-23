/*
  Warnings:

  - You are about to drop the column `ward` on the `User` table. All the data in the column will be lost.
  - Added the required column `category` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longitude" TEXT,
ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ward",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;
