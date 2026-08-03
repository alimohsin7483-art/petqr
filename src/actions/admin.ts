"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import * as adminService from "@/services/admin/admin.service";

type ActionResult = { error: string } | { success: true };

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await adminService.suspendUser(userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Couldn't suspend user." };
  }
}

export async function reinstateUserAction(userId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await adminService.reinstateUser(userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Couldn't reinstate user." };
  }
}

export async function setUserRoleAction(userId: string, role: "OWNER" | "ADMIN"): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await adminService.setUserRole(userId, role);
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch {
    return { error: "Couldn't update role." };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await adminService.updateTicketStatus(ticketId, status);
    revalidatePath("/admin/support");
    return { success: true };
  } catch {
    return { error: "Couldn't update ticket." };
  }
}

export async function updatePlanProviderIdsAction(
  planId: string,
  stripePriceId: string,
  razorpayPlanId: string
): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await adminService.updatePlanProviderIds(planId, stripePriceId, razorpayPlanId);
    revalidatePath("/admin/plans");
    return { success: true };
  } catch {
    return { error: "Couldn't update plan." };
  }
}

export async function upsertSystemSettingAction(key: string, value: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    let parsed: unknown = value;
    try {
      parsed = JSON.parse(value);
    } catch {
      // Not valid JSON — store as a plain string, still valid inside a Json column.
    }
    await adminService.upsertSystemSetting(key, parsed);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { error: "Couldn't save setting." };
  }
}
