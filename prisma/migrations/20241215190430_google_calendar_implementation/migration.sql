-- AlterTable
ALTER TABLE `project` ADD COLUMN `googleCalendar` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `task` ADD COLUMN `googleCalendar` BOOLEAN NOT NULL DEFAULT false;
