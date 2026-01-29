-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "driveViewUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_hash_key" ON "Image"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Image_driveFileId_key" ON "Image"("driveFileId");
