"use server"

import { revalidatePath } from "next/cache"
import { UserApiClient, CreateUserInput, UpdateUserInput } from "@/lib/api/user-api"

export async function getUsers() {
  try {
    return await UserApiClient.getUsers();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(data: CreateUserInput) {
  try {
    await UserApiClient.createUser(data);
    revalidatePath("/users");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUser(userId: string, userCommerces: string[]) {
  try {
    await UserApiClient.deleteUser(userId, userCommerces);
    revalidatePath("/users");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateUser(data: UpdateUserInput) {
  try {
    await UserApiClient.updateUser(data);
    revalidatePath("/users");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export type { CreateUserInput, UpdateUserInput }
