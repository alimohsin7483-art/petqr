import "server-only";
import { prisma } from "@/lib/db";

export async function getTagInventoryStats() {
  const [total, unclaimed, assignedNotClaimed, claimed] = await Promise.all([
    prisma.physicalTag.count(),
    prisma.physicalTag.count({ where: { status: "UNCLAIMED", orderId: null } }),
    prisma.physicalTag.count({ where: { status: "UNCLAIMED", orderId: { not: null } } }),
    prisma.physicalTag.count({ where: { status: "CLAIMED" } }),
  ]);
  return { total, unclaimed, assignedNotClaimed, claimed };
}

export async function listRecentTags(page = 1) {
  const PAGE_SIZE = 50;
  const [tags, total] = await Promise.all([
    prisma.physicalTag.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { order: { include: { user: { select: { email: true } } } }, pet: { select: { name: true } } },
    }),
    prisma.physicalTag.count(),
  ]);
  return { tags, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function listAllProductsAdmin() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createProduct(input: {
  name: string;
  description?: string;
  priceUsd: number;
  priceInr: number;
  visualVariant?: string;
}) {
  return prisma.product.create({ data: input });
}

export async function updateProductStripeId(productId: string, stripePriceId: string) {
  return prisma.product.update({ where: { id: productId }, data: { stripePriceId: stripePriceId || null } });
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  return prisma.product.update({ where: { id: productId }, data: { isActive } });
}
