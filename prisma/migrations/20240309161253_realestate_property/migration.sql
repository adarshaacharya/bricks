/*
  Warnings:

  - You are about to drop the column `realEstateId` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `propertyId` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_realEstateId_fkey";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "realEstateId",
ADD COLUMN     "propertyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "real_estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
