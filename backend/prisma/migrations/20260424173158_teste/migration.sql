-- CreateTable
CREATE TABLE `Nota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotaNorma` (
    `notaId` INTEGER NOT NULL,
    `normaId` INTEGER NOT NULL,

    PRIMARY KEY (`notaId`, `normaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NormaReferencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `normaOrigemId` INTEGER NOT NULL,
    `normaDestinoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotaNorma` ADD CONSTRAINT `NotaNorma_notaId_fkey` FOREIGN KEY (`notaId`) REFERENCES `Nota`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotaNorma` ADD CONSTRAINT `NotaNorma_normaId_fkey` FOREIGN KEY (`normaId`) REFERENCES `Norma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NormaReferencia` ADD CONSTRAINT `NormaReferencia_normaOrigemId_fkey` FOREIGN KEY (`normaOrigemId`) REFERENCES `Norma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NormaReferencia` ADD CONSTRAINT `NormaReferencia_normaDestinoId_fkey` FOREIGN KEY (`normaDestinoId`) REFERENCES `Norma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
