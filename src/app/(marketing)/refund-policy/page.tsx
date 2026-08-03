import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Refund & Shipping Policy", robots: { index: true } };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Shipping Policy" lastUpdated="[DATE — fill in before launch]">
      <p className="rounded-tag border border-brass/30 bg-brass/5 p-4 text-xs">
        <strong>Before you launch:</strong> fill in your real processing/shipping timelines and
        courier details, and confirm the return window and conditions with your actual
        manufacturing/fulfillment process. Payment gateways review this page during business
        verification, so keep it accurate and consistent with what you actually do.
      </p>

      <LegalSection title="1. Physical tags — order processing">
        <p>
          Physical tags are made to order. After payment is confirmed, your tag is queued for
          production and typically ships within [3–5 business days — update to your real
          timeline]. You'll be notified once your order status changes to "Shipped" — you can
          also check your order status any time from your dashboard's Orders page.
        </p>
      </LegalSection>

      <LegalSection title="2. Shipping">
        <p>
          We currently ship within [India / list countries you actually ship to]. Delivery
          typically takes [X–Y business days] after shipment, depending on your location and
          courier service. Shipping charges, if any, are shown at checkout before you pay.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancellations">
        <p>
          You may request a cancellation and full refund any time before your order status shows
          "Shipped." Once an order has shipped, it can no longer be cancelled, but our
          replacement guarantee (below) still applies if the tag is lost or damaged in transit.
        </p>
      </LegalSection>

      <LegalSection title="4. Free replacement guarantee">
        <p>
          If your physical tag is lost, stolen, or arrives damaged, we'll send a free
          replacement once, per original order — just contact us at [YOUR CONTACT EMAIL] with
          your order details. This guarantee covers one replacement per tag; normal wear over
          time is expected of any physical product and is not covered as "damaged."
        </p>
      </LegalSection>

      <LegalSection title="5. Refunds">
        <p>
          If a tag arrives defective, or significantly not as described, contact us within [7
          days] of delivery for a full refund or replacement, your choice. Refunds are issued to
          your original payment method via Stripe or Razorpay and typically appear within [5–10
          business days], depending on your bank/card issuer.
        </p>
        <p>
          Because tags are custom-produced with a unique QR code per order, we're unable to offer
          refunds for change-of-mind once an order has entered production, except as described in
          "Cancellations" above.
        </p>
      </LegalSection>

      <LegalSection title="6. Subscriptions">
        <p>
          Subscription plans (Free/Plus/Pro) are billing-cycle based, not physical goods. You can
          cancel any time from your billing dashboard; cancellation takes effect at the end of
          the current paid period. We do not provide partial refunds for unused time within a
          billing period, except where required by law.
        </p>
      </LegalSection>

      <LegalSection title="7. How to reach us">
        <p>
          For any order, shipping, or refund question, contact [YOUR CONTACT EMAIL]. Please
          include your order ID (visible on your dashboard's Orders page) so we can help quickly.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
