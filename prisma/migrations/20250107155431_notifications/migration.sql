-- AlterTable
ALTER TABLE `Project` ADD COLUMN `notification` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Task` ADD COLUMN `notification` INTEGER NOT NULL DEFAULT 0;
