/*
  Warnings:

  - You are about to drop the `UpgradedUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UpgradedUsers` DROP FOREIGN KEY `UpgradedUsers_userId_fkey`;

-- DropTable
DROP TABLE `UpgradedUsers`;
