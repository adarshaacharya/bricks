-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('Local', 'Google', 'Facebook', 'Github', 'Twitter');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'Local';
