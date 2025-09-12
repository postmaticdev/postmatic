-- AlterTable
ALTER TABLE "AppProductToken" ADD COLUMN     "tokenType" "TokenType" NOT NULL DEFAULT 'Image';

-- AlterTable
ALTER TABLE "TokenIncome" ADD COLUMN     "tokenType" "TokenType" NOT NULL DEFAULT 'Image';
