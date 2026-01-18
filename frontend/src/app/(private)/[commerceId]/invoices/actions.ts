"use server";

import { InvoiceApiClient, LocalItem } from "@/lib/api/invoice-api";
import { JobStatus } from "@shared/types/entities";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

// TODO: Further validation of user plan to use this feature

export async function getAllInvoiceJobs(commerceId: string) {
  try {
    return await InvoiceApiClient.getAllInvoiceJobs(commerceId);
  } catch (error) {
    console.error(error);
  } 
}

export async function getInvoiceJob(commerceId: string, jobId: string) {
  try {
    return await InvoiceApiClient.getInvoiceJob(commerceId, jobId);
  } catch (error) {
    console.error(error);
  }
}

export async function createInvoiceJob(commerceId: string, formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      throw new Error("No se han proporcionado archivos");
    }

    return await InvoiceApiClient.createInvoiceJob(commerceId, formData);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteInvoiceJob(commerceId: string, jobId: string) {
  try {
    await InvoiceApiClient.deleteInvoiceJob(commerceId, jobId);
    revalidatePath(`/private/${commerceId}/invoices`);
  } catch (error) {
    console.error(error);
  }
}

export async function updateInvoiceJobStatus(commerceId: string, jobId: string, status: JobStatus) {
  try {
    await InvoiceApiClient.updateInvoiceJobStatus(commerceId, jobId, status);
    revalidatePath(`/private/${commerceId}/invoices`);
  } catch (error) {
    console.error(error);
  }
}

export async function updateInvoiceJobResponse(commerceId: string, jobId: string, response: string, newFilesCount?: number) {
  try {
    await InvoiceApiClient.updateInvoiceJobResponse(commerceId, jobId, response, newFilesCount);
    revalidatePath(`/private/${commerceId}/invoices`);
  } catch (error) {
    console.error(error);
  }
}

export async function acceptInvoiceAnalysis(
  commerceId: string,
  supplier: string,
  localItems: LocalItem[],
) {
  try {
    await InvoiceApiClient.acceptInvoiceAnalysis(commerceId, supplier, localItems);
    revalidatePath(`/private/${commerceId}/invoices`);
  } catch (error) {
    console.error(error);
  }
}

export type { LocalItem };
