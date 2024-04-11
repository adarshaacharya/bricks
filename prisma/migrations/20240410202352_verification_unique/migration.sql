/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `verifications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "verifications_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "verifications_code_key" ON "verifications"("code");
