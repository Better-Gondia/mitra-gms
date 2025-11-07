-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Department" ADD VALUE 'PWD_1';
ALTER TYPE "Department" ADD VALUE 'PWD_2';
ALTER TYPE "Department" ADD VALUE 'RTO';
ALTER TYPE "Department" ADD VALUE 'ZILLA_PARISHAD';
ALTER TYPE "Department" ADD VALUE 'SP_OFFICE_GONDIA';
ALTER TYPE "Department" ADD VALUE 'SUPPLY_DEPARTMENT';
ALTER TYPE "Department" ADD VALUE 'HEALTH_DEPARTMENT';
ALTER TYPE "Department" ADD VALUE 'MSEB_GONDIA';
ALTER TYPE "Department" ADD VALUE 'TRAFFIC_POLICE';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PARISHAD_TIRORA';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PARISHAD_GONDIA';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PARISHAD_AMGAON';
ALTER TYPE "Department" ADD VALUE 'NAGAR_PARISHAD_GOREGAON';
ALTER TYPE "Department" ADD VALUE 'DEAN_MEDICAL_COLLEGE_GONDIA';
ALTER TYPE "Department" ADD VALUE 'FOREST_OFFICE_GONDIA';
ALTER TYPE "Department" ADD VALUE 'SAMAJ_KALYAN_OFFICE_GONDIA';
ALTER TYPE "Department" ADD VALUE 'SLR_OFFICE_GONDIA';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PWD_1';
ALTER TYPE "Role" ADD VALUE 'PWD_2';
ALTER TYPE "Role" ADD VALUE 'RTO';
ALTER TYPE "Role" ADD VALUE 'ZILLA_PARISHAD';
ALTER TYPE "Role" ADD VALUE 'SP_OFFICE_GONDIA';
ALTER TYPE "Role" ADD VALUE 'SUPPLY_DEPARTMENT';
ALTER TYPE "Role" ADD VALUE 'HEALTH_DEPARTMENT';
ALTER TYPE "Role" ADD VALUE 'MSEB_GONDIA';
ALTER TYPE "Role" ADD VALUE 'TRAFFIC_POLICE';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PARISHAD_TIRORA';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PARISHAD_GONDIA';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PARISHAD_AMGAON';
ALTER TYPE "Role" ADD VALUE 'NAGAR_PARISHAD_GOREGAON';
ALTER TYPE "Role" ADD VALUE 'DEAN_MEDICAL_COLLEGE_GONDIA';
ALTER TYPE "Role" ADD VALUE 'FOREST_OFFICE_GONDIA';
ALTER TYPE "Role" ADD VALUE 'SAMAJ_KALYAN_OFFICE_GONDIA';
ALTER TYPE "Role" ADD VALUE 'SLR_OFFICE_GONDIA';
