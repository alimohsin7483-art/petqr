import "server-only";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 25;
const MAX_QUERY_LENGTH = 100;

function sanitizeQuery(query: string): string {
  return query.trim().slice(0, MAX_QUERY_LENGTH);
}

// ── Overview ─────────────────────────────────────────────────────────
export async function getOverviewCounts() {
  const [users, pets, activeSubscriptions, lostPets, openTickets, unclaimedTags, pendingOrders] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.pet.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.pet.count({ where: { isLost: true, deletedAt: null } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.physicalTag.count({ where: { status: "UNCLAIMED", orderId: null } }),
    prisma.order.count({ where: { status: "PAID" } }),
  ]);
  return { users, pets, activeSubscriptions, lostPets, openTickets, unclaimedTags, pendingOrders };
}

// ── Users ────────────────────────────────────────────────────────────
export async function searchUsers(query: string, page = 1) {
  query = sanitizeQuery(query);
  const where = query
    ? {
        deletedAt: null,
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { fullName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { deletedAt: null };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { pets: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function getUserDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      pets: { where: { deletedAt: null } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      supportTickets: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function setUserRole(userId: string, role: "OWNER" | "ADMIN") {
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function suspendUser(userId: string) {
  // Soft-suspend: we don't hard-delete admin-side; deletedAt also removes
  // them from RLS-scoped queries everywhere else in the app.
  return prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
}

export async function reinstateUser(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { deletedAt: null } });
}

// ── Pets ─────────────────────────────────────────────────────────────
export async function searchPets(query: string, page = 1) {
  query = sanitizeQuery(query);
  const where = query
    ? {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { publicSlug: { contains: query, mode: "insensitive" as const } },
          { owner: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : { deletedAt: null };

  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { owner: { select: { email: true, fullName: true } } },
    }),
    prisma.pet.count({ where }),
  ]);
  return { pets, total, pages: Math.ceil(total / PAGE_SIZE) };
}

// ── Payments ─────────────────────────────────────────────────────────
export async function listRecentPayments(page = 1) {
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { invoice: { include: { subscription: { include: { user: true, plan: true } } } } },
    }),
    prisma.payment.count(),
  ]);
  return { payments, total, pages: Math.ceil(total / PAGE_SIZE) };
}

// ── Reports (lost + found) ─────────────────────────────────────────────
export async function listLostReports(page = 1) {
  const [reports, total] = await Promise.all([
    prisma.lostReport.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { pet: { include: { owner: { select: { email: true } } } } },
    }),
    prisma.lostReport.count(),
  ]);
  return { reports, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function listFoundReports(page = 1) {
  const [reports, total] = await Promise.all([
    prisma.foundReport.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { pet: { include: { owner: { select: { email: true } } } } },
    }),
    prisma.foundReport.count(),
  ]);
  return { reports, total, pages: Math.ceil(total / PAGE_SIZE) };
}

// ── Support tickets ──────────────────────────────────────────────────
export async function listSupportTickets(page = 1) {
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true, fullName: true } } },
    }),
    prisma.supportTicket.count(),
  ]);
  return { tickets, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function updateTicketStatus(
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
) {
  return prisma.supportTicket.update({ where: { id: ticketId }, data: { status } });
}

// ── Plans ────────────────────────────────────────────────────────────
export async function listAllPlans() {
  return prisma.plan.findMany({ orderBy: { priceMonthlyUsd: "asc" } });
}

export async function updatePlanProviderIds(
  planId: string,
  stripePriceId: string | null,
  razorpayPlanId: string | null
) {
  return prisma.plan.update({
    where: { id: planId },
    data: { stripePriceId: stripePriceId || null, razorpayPlanId: razorpayPlanId || null },
  });
}

// ── System settings ──────────────────────────────────────────────────
export async function listSystemSettings() {
  return prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
}

export async function upsertSystemSetting(key: string, value: unknown) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value: value as any },
    create: { key, value: value as any },
  });
}

// ── Audit logs ───────────────────────────────────────────────────────
export async function listAuditLogs(page = 1, entityType?: string) {
  const where = entityType ? { entityType } : {};
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total, pages: Math.ceil(total / PAGE_SIZE) };
}

// ── Exports ──────────────────────────────────────────────────────────
export async function exportUsersCsv(): Promise<string> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const header = "id,email,full_name,role,created_at\n";
  const rows = users
    .map((u) => [u.id, u.email, u.fullName ?? "", u.role, u.createdAt.toISOString()].join(","))
    .join("\n");
  return header + rows;
}
