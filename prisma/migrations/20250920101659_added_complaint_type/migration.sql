-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitude" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" "ComplaintType";
