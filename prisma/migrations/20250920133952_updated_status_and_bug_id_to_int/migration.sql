/*
  Warnings:

  - The primary key for the `Bug` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Bug` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `StatusUpdate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `StatusUpdate` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Bug_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StatusUpdate" DROP CONSTRAINT "StatusUpdate_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id");
