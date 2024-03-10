/*
  Warnings:

  - A unique constraint covering the columns `[street]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zip]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[city]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[state]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "addresses_street_key" ON "addresses"("street");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_zip_key" ON "addresses"("zip");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_city_key" ON "addresses"("city");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_state_key" ON "addresses"("state");
