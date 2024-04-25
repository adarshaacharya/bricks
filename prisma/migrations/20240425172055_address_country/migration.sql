/*
  Warnings:

  - Added the required column `country` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "addresses_city_key";

-- DropIndex
DROP INDEX "addresses_state_key";

-- DropIndex
DROP INDEX "addresses_street_key";

-- DropIndex
DROP INDEX "addresses_zip_key";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "zip" SET DATA TYPE TEXT;
