/*
  Warnings:

  - You are about to drop the column `users` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `createdProjects` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `project` DROP COLUMN `users`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdProjects`;

-- CreateTable
CREATE TABLE `_UserProjects` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserProjects_AB_unique`(`A`, `B`),
    INDEX `_UserProjects_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserProjects` ADD CONSTRAINT `_UserProjects_A_fkey` FOREIGN KEY (`A`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserProjects` ADD CONSTRAINT `_UserProjects_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
