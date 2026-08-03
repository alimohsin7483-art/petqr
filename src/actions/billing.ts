"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createStripeCheckoutSession, createStripePortalSession } from "@/services/billing/stripe.service";
import { createRazorpaySubscription } from "@/services/billing/razorpay.service";

type ActionResult = { error: string } | never;

export async function startStripeCheckoutAction(planKey: string): Promise<ActionResult> {
  const { user } = await getCurrentUser();
  try {
    const url = await createStripeCheckoutSession(user.id, planKey);
    redirect(url);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Couldn't start checkout. Try again." };
  }
}

export async function startRazorpayCheckoutAction(planKey: string): Promise<ActionResult> {
  const { user } = await getCurrentUser();
  try {
    const url = await createRazorpaySubscription(user.id, planKey);
    redirect(url);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Couldn't start checkout. Try again." };
  }
}

export async function openStripePortalAction(): Promise<ActionResult> {
  const { user } = await getCurrentUser();
  try {
    const url = await createStripePortalSession(user.id);
    redirect(url);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Couldn't open billing portal. Try again." };
  }
}
