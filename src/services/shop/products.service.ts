import "server-only";
import { prisma } from "@/lib/db";

export async function listActiveProducts() {
  return prisma.product.findMany({ where: { isActive: true }, orderBy: { priceUsd: "asc" } });
}

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  return product;
}
