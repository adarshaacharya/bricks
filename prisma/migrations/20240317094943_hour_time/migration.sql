/*
  Warnings:

  - You are about to drop the column `hour` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `time` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "hour",
ADD COLUMN     "time" TEXT NOT NULL;
