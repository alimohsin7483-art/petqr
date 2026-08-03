"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, AuthError } from "@/lib/auth";
import { getProductById } from "@/services/shop/products.service";
import { createPendingOrder, attachProviderOrderId } from "@/services/shop/orders.service";
import { createStripeTagCheckoutSession } from "@/services/billing/stripe.service";
import { createRazorpayTagOrder, verifyRazorpayPaymentSignature } from "@/services/billing/razorpay.service";
import { markOrderPaid } from "@/services/shop/orders.service";
import { claimPhysicalTag, TagNotFoundError, TagAlreadyClaimedError } from "@/services/shop/tags.service";
import { createPetSchema, type CreatePetInput } from "@/validations/pets";
import * as petsService from "@/services/pets/pets.service";

type ActionResult = { error: string } | { success: true };

export async function startStripeTagCheckoutAction(productId: string, quantity: number): Promise<never | ActionResult> {
  let user;
  try {
    ({ user } = await getCurrentUser());
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in?next=/shop");
    throw err;
  }
  const product = await getProductById(productId);
  if (!product.stripePriceId) return { error: "This product isn't set up for card payments yet." };

  const order = await createPendingOrder({
    userId: user.id,
    productId,
    quantity,
    provider: "STRIPE",
    amount: Number(product.priceUsd) * quantity,
    currency: "USD",
  });

  try {
    const { url, sessionId } = await createStripeTagCheckoutSession(
      user.id,
      order.id,
      product.stripePriceId,
      quantity
    );
    await attachProviderOrderId(order.id, sessionId);
    redirect(url);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Couldn't start checkout. Try again." };
  }
}

export async function createRazorpayTagOrderAction(
  productId: string,
  quantity: number
): Promise<{ orderId: string; razorpayOrderId: string; amount: number; currency: string; keyId: string } | { error: string }> {
  let user;
  try {
    ({ user } = await getCurrentUser());
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in?next=/shop");
    throw err;
  }
  const product = await getProductById(productId);

  const amountInPaise = Math.round(Number(product.priceInr) * quantity * 100);

  const order = await createPendingOrder({
    userId: user.id,
    productId,
    quantity,
    provider: "RAZORPAY",
    amount: Number(product.priceInr) * quantity,
    currency: "INR",
  });

  try {
    const rp = await createRazorpayTagOrder(order.id, amountInPaise, "INR");
    await attachProviderOrderId(order.id, rp.razorpayOrderId);
    return {
      orderId: order.id,
      razorpayOrderId: rp.razorpayOrderId,
      amount: rp.amount,
      currency: rp.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  } catch {
    return { error: "Couldn't start checkout. Try again." };
  }
}

/**
 * Called by the client-side Razorpay checkout widget's success handler.
 * This is the fast path; the Razorpay webhook (payment.captured) is the
 * durable fallback if the browser closes before this call completes.
 */
export async function verifyRazorpayTagPaymentAction(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<ActionResult> {
  const valid = verifyRazorpayPaymentSignature(razorpayOrderId, razorpayPaymentId, signature);
  if (!valid) return { error: "Payment verification failed." };

  try {
    await markOrderPaid({ orderId, providerPaymentId: razorpayPaymentId });
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch {
    return { error: "Payment succeeded but we couldn't finalize your order — contact support." };
  }
}

export async function claimPhysicalTagAction(
  slug: string,
  petId: string
): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    await claimPhysicalTag(slug, user.id, petId);
    revalidatePath(`/p/${slug}`);
    return { success: true };
  } catch (err) {
    if (err instanceof TagNotFoundError || err instanceof TagAlreadyClaimedError) {
      return { error: err.message };
    }
    return { error: "Couldn't claim this tag. Try again." };
  }
}

export async function createPetAndClaimTagAction(
  slug: string,
  input: CreatePetInput
): Promise<ActionResult> {
  const parsed = createPetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  try {
    const { authUser, user } = await getCurrentUser();
    const pet = await petsService.createPet(authUser.id, user.id, parsed.data);
    await claimPhysicalTag(slug, user.id, pet.id);
    revalidatePath(`/p/${slug}`);
    return { success: true };
  } catch (err) {
    if (err instanceof petsService.PlanLimitError) return { error: err.message };
    if (err instanceof TagNotFoundError || err instanceof TagAlreadyClaimedError) {
      return { error: err.message };
    }
    return { error: "Couldn't register this pet and claim the tag. Try again." };
  }
}
