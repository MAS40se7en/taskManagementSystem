/*
  Warnings:

  - Added the required column `customerId` to the `UpgradedUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UpgradedUsers` ADD COLUMN `customerId` INTEGER NOT NULL;
