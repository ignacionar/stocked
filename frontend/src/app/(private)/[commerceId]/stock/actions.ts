"use server"

import { revalidatePath } from "next/cache"
import { StockApiClient, CreateStockInput, UpdateStockInput } from "@/lib/api/stock-api"

export async function getStockFromCommerce(commerceId: string) {
  try {
    return await StockApiClient.getStockFromCommerce(commerceId);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createStock(input: CreateStockInput) {
  try {
    await StockApiClient.createStock(input);
    revalidatePath(`/${input.commerceId}/stock`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateStock(input: UpdateStockInput & { commerceId: string }) {
  try {
    await StockApiClient.updateStock(input);
    revalidatePath(`/${input.commerceId}/stock`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteStock(commerceId: string, stockId: string) {
  try {
    await StockApiClient.deleteStock(commerceId, stockId);
    revalidatePath(`/${commerceId}/stock`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllSuppliers(commerceId: string) {
  try {
    return await StockApiClient.getAllSuppliers(commerceId);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
