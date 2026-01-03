-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Department" ADD VALUE 'NAGAR_PANCHAYAT_SALEKASA';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PANCHAYAT_DEORI';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PANCHAYAT_ARJUNI_MOR';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PANCHAYAT_SADAK_ARJUNI';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'NAGAR_PANCHAYAT_SALEKASA';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PANCHAYAT_DEORI';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PANCHAYAT_ARJUNI_MOR';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PANCHAYAT_SADAK_ARJUNI';
