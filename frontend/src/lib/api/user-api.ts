import { ApiClient } from "./api-client";
import { Plan, Role, User } from "@shared/types/entities";

export type CreateUserInput = {
  name: string;
  email: string;
  role: Role;
  plan: Plan;
  newPassword: string;
  occupation?: string;
  commerceIds: string[];
};

export type UpdateUserInput = {
  id: string;
  name: string;
  occupation?: string;
  oldPassword?: string;
  newPassword?: string;
  commerceIds: string[];
};

export class UserApiClient {
  private static baseUrl = "/api/users"

  static async getUsers(): Promise<(User & { commerces: { id: string; name: string }[] })[]> {
    return ApiClient.fetcher(`${this.baseUrl}`);
  }

  static async createUser(input: CreateUserInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async updateUser(input: UpdateUserInput): Promise<void> {
    return ApiClient.fetcher(`${this.baseUrl}/${input.id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  static async deleteUser(userId: string, userCommerces: string[]): Promise<void> {
    await ApiClient.fetcher(`${this.baseUrl}/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({ userCommerces }),
    });
  }
}
