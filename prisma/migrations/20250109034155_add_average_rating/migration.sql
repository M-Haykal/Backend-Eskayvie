/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `emailPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OrderItemProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rataRataRatting` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItemProduct" DROP CONSTRAINT "OrderItemProduct_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemProduct" DROP CONSTRAINT "OrderItemProduct_productId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "averageRating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "rataRataRatting" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailPassword",
DROP COLUMN "otpExpiration",
ADD COLUMN     "otpExpired" TIMESTAMP(3);

-- DropTable
DROP TABLE "OrderItemProduct";

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
