-- AlterTable
ALTER TABLE "public"."Bug" ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "screenshot" TEXT,
ADD COLUMN     "steps" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'bug',
ADD COLUMN     "url" TEXT,
ADD COLUMN     "userAgent" TEXT;
