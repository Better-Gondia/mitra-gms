/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('DETAILS', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'DETAILS';
