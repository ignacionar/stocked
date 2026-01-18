import { Queue } from "bullmq";
import { redis } from "../redis";

export const invoiceQueue = new Queue("invoice-processing", {
  connection: redis as any,
});
