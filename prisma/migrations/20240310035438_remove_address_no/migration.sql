/*
  Warnings:

  - You are about to drop the column `number` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `zip` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "number",
DROP COLUMN "zipCode",
ADD COLUMN     "zip" TEXT NOT NULL;
