/*
  Warnings:

  - Made the column `lastUsedAt` on table `ShitChat` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values
UPDATE "ShitChat" SET "lastUsedAt" = "createdAt" WHERE "lastUsedAt" IS NULL;

-- AlterTable
ALTER TABLE "ShitChat" ALTER COLUMN "lastUsedAt" SET NOT NULL,
ALTER COLUMN "lastUsedAt" SET DEFAULT CURRENT_TIMESTAMP;
