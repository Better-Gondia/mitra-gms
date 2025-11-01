/*
  Warnings:

  - Added the required column `role` to the `Remark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Remark" ADD COLUMN     "role" "Role" NOT NULL;
