/*
  Warnings:

  - Made the column `birthDate` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "birthDate" SET DATA TYPE DATE;
