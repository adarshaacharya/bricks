/*
  Warnings:

  - Added the required column `description` to the `real_estates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `real_estates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `real_estates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SuperAdmin';

-- AlterTable
ALTER TABLE "real_estates" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
