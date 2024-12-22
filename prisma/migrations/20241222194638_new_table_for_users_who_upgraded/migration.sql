-- CreateTable
CREATE TABLE `UpgradedUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orderId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sessionId` INTEGER NOT NULL,
    `invoiceUrl` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UpgradedUsers_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UpgradedUsers` ADD CONSTRAINT `UpgradedUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
