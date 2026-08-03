import { prisma } from "@/lib/db";

export async function getPlanByKey(key: string) {
  const plan = await prisma.plan.findUnique({ where: { key, isActive: true } });
  if (!plan) throw new Error(`Unknown or inactive plan: ${key}`);
  return plan;
}

export async function getActivePlans() {
  return prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthlyUsd: "asc" } });
}
