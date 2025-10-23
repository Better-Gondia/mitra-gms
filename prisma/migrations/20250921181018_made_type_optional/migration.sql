/*
  Warnings:

  - The `media` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Complaint" ALTER COLUMN "type" DROP NOT NULL,
DROP COLUMN "media",
ADD COLUMN     "media" JSONB[] DEFAULT ARRAY[]::JSONB[];
