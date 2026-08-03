"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { generateTagBatch } from "@/services/shop/tags.service";
import { markOrderShipped } from "@/services/shop/orders.service";
import * as shopAdmin from "@/services/admin/shop-admin.service";

type ActionResult = { error: string } | { success: true };

export async function generateTagBatchAction(count: number): Promise<ActionResult> {
  await requireRole("ADMIN");
  if (count < 1 || count > 1000) return { error: "Choose a batch size between 1 and 1000." };

  try {
    await generateTagBatch(count);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch {
    return { error: "Couldn't generate the batch. Try again." };
  }
}

export async function markOrderShippedAction(orderId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await markOrderShipped(orderId);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch {
    return { error: "Couldn't update the order." };
  }
}

export async function createProductAction(input: {
  name: string;
  description: string;
  priceUsd: number;
  priceInr: number;
  visualVariant: string;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await shopAdmin.createProduct(input);
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { error: "Couldn't create product." };
  }
}

export async function updateProductStripeIdAction(productId: string, stripePriceId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await shopAdmin.updateProductStripeId(productId, stripePriceId);
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { error: "Couldn't update product." };
  }
}

export async function toggleProductActiveAction(productId: string, isActive: boolean): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await shopAdmin.toggleProductActive(productId, isActive);
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { error: "Couldn't update product." };
  }
}
