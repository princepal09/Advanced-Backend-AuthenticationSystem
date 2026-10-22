/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `isRevoked` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `AuthAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuthAccount" DROP CONSTRAINT "AuthAccount_userId_fkey";

-- DropIndex
DROP INDEX "RolePermission_permissionId_idx";

-- DropIndex
DROP INDEX "RolePermission_roleId_idx";

-- DropIndex
DROP INDEX "UserRole_roleId_idx";

-- DropIndex
DROP INDEX "UserRole_userId_idx";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "isSystem";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "isDeleted",
DROP COLUMN "isRevoked";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL';

-- DropTable
DROP TABLE "AuthAccount";
