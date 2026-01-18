import { Commerce } from "@shared/types/entities";
import { ApiClient } from "./api-client";

export type CreateCommerceInput = {
  name: string;
  location: string;
};

export type UpdateCommerceInput = {
  id: string;
  name: string;
  location: string;
};

export class CommerceApiClient {
  private static baseUrl = "/api/commerces"

  static async getAllUserCommerces(): Promise<Commerce[]> {
    return ApiClient.fetcher(`${this.baseUrl}`, {
      method: "GET",
    });
  }

  static async getCommerce(commerceId: string): Promise<Commerce> {
    return ApiClient.fetcher(`${this.baseUrl}/${commerceId}`, {
      method: "GET",
    });
  }

  static async createCommerce(input: CreateCommerceInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async updateCommerce(input: UpdateCommerceInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  static async deleteCommerce(commerceId: string): Promise<void> {
    await ApiClient.fetcher(`${this.baseUrl}/${commerceId}`, {
      method: "DELETE",
    });
  }
}
