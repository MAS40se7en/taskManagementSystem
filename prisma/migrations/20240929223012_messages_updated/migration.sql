/*
  Warnings:

  - You are about to drop the column `userId` on the `message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_userId_fkey`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `userId`,
    ADD COLUMN `receiverId` VARCHAR(191) NULL,
    ADD COLUMN `senderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
