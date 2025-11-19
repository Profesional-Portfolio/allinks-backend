/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Platform` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");
