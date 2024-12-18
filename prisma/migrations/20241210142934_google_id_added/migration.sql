/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `startsAt` DATETIME(3) NULL,
    MODIFY `endsAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `googleId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
