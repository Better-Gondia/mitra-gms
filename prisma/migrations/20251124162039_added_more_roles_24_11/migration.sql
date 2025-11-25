-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Department" ADD VALUE 'RDC_GONDIA';
ALTER TYPE "Department" ADD VALUE 'DEPUTY_COLLECTOR_GENERAL_GONDIA';
ALTER TYPE "Department" ADD VALUE 'PO_OFFICE_DEORI';
ALTER TYPE "Department" ADD VALUE 'ST_DEPO_OFFICE_GONDIA';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'RDC_GONDIA';
ALTER TYPE "Role" ADD VALUE 'DEPUTY_COLLECTOR_GENERAL_GONDIA';
ALTER TYPE "Role" ADD VALUE 'PO_OFFICE_DEORI';
ALTER TYPE "Role" ADD VALUE 'ST_DEPO_OFFICE_GONDIA';
