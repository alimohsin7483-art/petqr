"use client";

import { useState } from "react";
import Script from "next/script";
import { startStripeTagCheckoutAction, createRazorpayTagOrderAction, verifyRazorpayTagPaymentAction } from "@/actions/shop";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function BuyButtons({ productId }: { productId: string }) {
  const [pending, setPending] = useState<"stripe" | "razorpay" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStripe() {
    setPending("stripe");
    setError(null);
    const result = await startStripeTagCheckoutAction(productId, 1);
    // Success redirects server-side; only errors return here.
    if (result && "error" in result) {
      setError(result.error);
      setPending(null);
    }
  }

  async function handleRazorpay() {
    setPending("razorpay");
    setError(null);
    const result = await createRazorpayTagOrderAction(productId, 1);
    if ("error" in result) {
      setError(result.error);
      setPending(null);
      return;
    }

    const rzp = new window.Razorpay({
      key: result.keyId,
      order_id: result.razorpayOrderId,
      amount: result.amount,
      currency: result.currency,
      name: "PetLink",
      description: "Physical pet tag",
      handler: async (response: any) => {
        const verifyResult = await verifyRazorpayTagPaymentAction(
          result.orderId,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
        if ("error" in verifyResult) {
          setError(verifyResult.error);
        } else {
          window.location.href = "/dashboard/orders?checkout=success";
        }
        setPending(null);
      },
      modal: { ondismiss: () => setPending(null) },
    });
    rzp.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {error && <p className="mb-3 text-sm text-alert">{error}</p>}
      <div className="flex gap-2">
        <Button variant="ghost" disabled={!!pending} onClick={handleStripe} className="w-auto">
          {pending === "stripe" ? "Redirecting…" : "Pay with card"}
        </Button>
        <Button disabled={!!pending} onClick={handleRazorpay} className="w-auto">
          {pending === "razorpay" ? "Opening…" : "Pay with Razorpay"}
        </Button>
      </div>
    </>
  );
}
