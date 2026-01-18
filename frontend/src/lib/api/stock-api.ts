import { Stock } from "@shared/types/entities";
import { ApiClient } from "./api-client";

export type CreateStockInput = {
  name: string;
  supplier: string;
  measure: string;
  quantity: number;
  price: number;
  commerceId: string;
};

export type UpdateStockInput = {
  id: string;
  name: string;
  supplier: string;
  measure: string;
  quantity: number;
  price: number;
};

export class StockApiClient {
  private static baseUrl = "/api/stock"

  static async getStockFromCommerce(commerceId: string)
  : Promise<Stock[]> {
    return ApiClient.fetcher(`${this.baseUrl}/commerce/${commerceId}`, {
      method: "GET",
    });
  }

  static async createStock(input: CreateStockInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async updateStock(input: UpdateStockInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  static async deleteStock(commerceId: string, stockId: string): Promise<void> {
    await ApiClient.fetcher(`${this.baseUrl}/${stockId}`, {
      method: "DELETE",
      body: JSON.stringify(commerceId)
    });
  }

  static async getAllSuppliers(commerceId: string): Promise<string[]> {
    return ApiClient.fetcher(`${this.baseUrl}/suppliers/${commerceId}`, {
      method: "GET",
    });
  }
}
