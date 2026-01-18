-- AddForeignKey
ALTER TABLE "invoice_job" ADD CONSTRAINT "invoice_job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
