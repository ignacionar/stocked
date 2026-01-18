import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { JobStatus } from "@shared/types/entities";
import { processInvoices } from "@/lib/processInvoices";

console.log("[Worker] Starting invoice processing worker...");

new Worker(
  "invoice-processing",
  async (job) => {
    const { jobId, files } = job.data;

    console.log(`[Worker] processing job ${jobId} with ${files.length} files`);

    try {
      await prisma.invoiceJob.update({
        where: { id: jobId },
        data: { status: JobStatus.PROCESSING },
      });

      const result = await processInvoices(files);
      if (result && result.includes("Imagen invalida")) {
        await prisma.invoiceJob.update({
          where: { id: jobId },
          data: { status: JobStatus.INVALID },
        });

        console.log(`[Worker] job ${jobId} marked as INVALID due to invalid image`);
      } else {
        await prisma.invoiceJob.update({
          where: { id: jobId },
          data: {
            status: JobStatus.COMPLETED,
            response: result,
          },
        });
        console.log(`[Worker] job ${jobId} completed successfully`);
      }
      } catch (err) {
        await prisma.invoiceJob.update({
          where: { id: jobId },
          data: { status: JobStatus.FAILED, error: (err as Error).message },
        });

        console.log(`[Worker] job ${jobId} failed with error: ${(err as Error).message}`);

        throw err;
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? "127.0.0.1",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      concurrency: 2,
    }
);

console.log("[Worker] Invoice processing worker is running and waiting for jobs...");
