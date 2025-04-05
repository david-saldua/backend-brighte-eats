-- DropForeignKey
ALTER TABLE "ServiceInterest" DROP CONSTRAINT "ServiceInterest_leadId_fkey";

-- AddForeignKey
ALTER TABLE "ServiceInterest" ADD CONSTRAINT "ServiceInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
