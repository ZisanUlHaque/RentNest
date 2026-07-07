/*
  Warnings:

  - You are about to drop the column `propertyType` on the `property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "property" DROP COLUMN "propertyType";

-- DropEnum
DROP TYPE "PropertyType";
