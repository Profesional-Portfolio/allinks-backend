-- AlterTable
ALTER TABLE "EmailVerificationToken" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
