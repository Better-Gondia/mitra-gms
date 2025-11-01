-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'DISTRICT_COLLECTOR';
ALTER TYPE "Role" ADD VALUE 'MP_LOK_SABHA';
ALTER TYPE "Role" ADD VALUE 'MLA_GONDIA';
ALTER TYPE "Role" ADD VALUE 'MLA_TIRORA';
ALTER TYPE "Role" ADD VALUE 'MLA_ARJUNI_MORGAON';
ALTER TYPE "Role" ADD VALUE 'MLA_AMGAON_DEORI';
ALTER TYPE "Role" ADD VALUE 'MLC';
ALTER TYPE "Role" ADD VALUE 'ZP_CEO';
ALTER TYPE "Role" ADD VALUE 'IFS';
