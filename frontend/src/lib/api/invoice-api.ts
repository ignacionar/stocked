import { InvoiceJob, JobStatus } from "@shared/types/entities";
import { ApiClient } from "./api-client";

export type LocalItem = {
  name: string;
  quantity: number;
  unit_price: number;
  measure: string;
  id: string;
};

export class InvoiceApiClient {
  private static baseUrl = "/api/commerces"

  static async createInvoiceJob(commerceId: string, formData: FormData): Promise<InvoiceJob> {
    return ApiClient.fetcher(`${this.baseUrl}/${commerceId}/invoices`, {
      method: "POST",
      body: formData,
    });
  }

  static async getAllInvoiceJobs(commerceId: string): Promise<InvoiceJob[]> {
    return ApiClient.fetcher<InvoiceJob[]>(`${this.baseUrl}/${commerceId}/invoices`, {
      method: "GET",
    });
  }

  static async getInvoiceJob(commerceId: string, jobId: string): Promise<InvoiceJob> {
    return ApiClient.fetcher<InvoiceJob>(`${this.baseUrl}/${commerceId}/invoices/${jobId}`, {
      method: "GET",
    });
  }

  static async deleteInvoiceJob(commerceId: string, jobId: string): Promise<void> {
    await ApiClient.fetcher<void>(`${this.baseUrl}/${commerceId}/invoices/${jobId}`, {
      method: "DELETE",
    });
  }

  static async updateInvoiceJobStatus(
    commerceId: string,
    jobId: string,
    status: JobStatus
  ): Promise<{ success: boolean }> {
    return ApiClient.fetcher<{ success: boolean }>(`${this.baseUrl}/${commerceId}/invoices/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  static async updateInvoiceJobResponse(
    commerceId: string,
    jobId: string,
    response: string,
    filesCount?: number
  ): Promise<{ success: boolean }> {
    return ApiClient.fetcher<{ success: boolean }>(`${this.baseUrl}/${commerceId}/invoices/${jobId}/response`, {
      method: "PATCH",
      body: JSON.stringify({ response, filesCount }),
    });
  }

  static async acceptInvoiceAnalysis(
    commerceId: string,
    supplier: string,
    items: LocalItem[],
  ): Promise<{ success: boolean }> {
    return ApiClient.fetcher<{ success: boolean }>(`${this.baseUrl}/${commerceId}/invoices/accept`, {
      method: "POST",
      body: JSON.stringify({ items, supplier, commerceId }),
    });
  }
}
