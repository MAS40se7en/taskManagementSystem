/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `task` DROP COLUMN `imageUrl`,
    ADD COLUMN `imagePath` VARCHAR(191) NULL;
