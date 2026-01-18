"use server"

import { revalidatePath } from "next/cache"
import { CommerceApiClient } from "@/lib/api/commerce-api"

export async function getAllUserCommerces() {
  try {
    return await CommerceApiClient.getAllUserCommerces();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCommerce(commerceId: string) {
  try {
    return await CommerceApiClient.getCommerce(commerceId);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createCommerce({ name, location }: {
  name: string
  location: string
}) {
  try {
    await CommerceApiClient.createCommerce({ name, location });
    revalidatePath("/");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateCommerce(data: {
  id: string
  name: string
  location: string
}) {
  try {
    await CommerceApiClient.updateCommerce(data);
    revalidatePath(`/${data.id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteCommerce(commerceId: string) {
  try {
    await CommerceApiClient.deleteCommerce(commerceId);
    revalidatePath(`/${commerceId}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
