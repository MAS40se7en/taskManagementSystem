/*
  Warnings:

  - You are about to drop the `MessageSeenBy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MessageSeenBy` DROP FOREIGN KEY `MessageSeenBy_messageId_fkey`;

-- DropForeignKey
ALTER TABLE `MessageSeenBy` DROP FOREIGN KEY `MessageSeenBy_userId_fkey`;

-- DropTable
DROP TABLE `MessageSeenBy`;
