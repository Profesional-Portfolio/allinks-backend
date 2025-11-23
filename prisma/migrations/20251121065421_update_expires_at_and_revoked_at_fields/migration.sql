-- AlterTable
ALTER TABLE "EmailVerificationToken" ALTER COLUMN "verified_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "used_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "revoked_at" DROP NOT NULL;
