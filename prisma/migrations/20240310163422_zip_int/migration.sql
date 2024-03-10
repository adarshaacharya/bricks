/*
  Warnings:

  - Changed the type of `zip` on the `addresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "real_estates" DROP CONSTRAINT "real_estates_addressId_fkey";

-- DropIndex
DROP INDEX "real_estates_addressId_key";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "zip",
ADD COLUMN     "zip" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "real_estates" ALTER COLUMN "addressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "real_estates" ADD CONSTRAINT "real_estates_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
