/*
  Warnings:

  - Made the column `startsAt` on table `project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endsAt` on table `project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `startsAt` DATETIME(3) NOT NULL,
    MODIFY `endsAt` DATETIME(3) NOT NULL;
