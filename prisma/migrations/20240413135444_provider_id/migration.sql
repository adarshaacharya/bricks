/*
  Warnings:

  - You are about to drop the column `authProvider` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "authProvider",
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'Local',
ADD COLUMN     "providerId" TEXT;
