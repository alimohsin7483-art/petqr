import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service", robots: { index: true } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="[DATE — fill in before launch]">
      <p>
        These terms govern your use of PetLink, including the free pet-profile service and the
        physical tag store. By creating an account or placing an order, you agree to these terms.
      </p>
      <p className="rounded-tag border border-brass/30 bg-brass/5 p-4 text-xs">
        <strong>Before you launch:</strong> replace the bracketed placeholders with your real
        business details and have this reviewed by a lawyer before relying on it commercially.
      </p>

      <LegalSection title="1. The service">
        <p>
          PetLink lets you create a public profile for your pet, linked to a QR code, so that
          anyone who finds your pet can view basic information and contact you. The free plan
          includes one pet profile and a digital QR code you can print yourself. Paid plans
          unlock additional pets and features. We also sell pre-manufactured physical tags,
          purchased separately as one-time orders.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>
          You must provide accurate information when creating an account and are responsible for
          keeping your login credentials secure. You must be at least 18 years old, or have a
          parent/guardian's consent, to create an account.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5">
          <li>Create a profile for a pet you don't own or aren't authorized to represent;</li>
          <li>Upload content that is false, defamatory, obscene, or infringes someone else's rights;</li>
          <li>Use the public scan page, contact forms, or found-report feature to harass, spam, or send unsolicited messages to any person;</li>
          <li>Attempt to access another user's account or data, or interfere with the service's security or normal operation.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Subscriptions">
        <p>
          Paid subscription plans renew automatically each billing period until cancelled. You
          can cancel at any time from your billing dashboard; cancellation takes effect at the
          end of the current billing period, and no partial refunds are given for the remainder
          of a period unless required by law.
        </p>
      </LegalSection>

      <LegalSection title="5. Physical tag orders">
        <p>
          Physical tags are sold as one-time purchases, separate from any subscription. Pricing,
          shipping timelines, and our replacement policy are set out in our{" "}
          <a href="/refund-policy" className="text-brass-dark underline underline-offset-4">
            Refund &amp; Shipping Policy
          </a>
          , which forms part of these terms. Once you scan and "claim" a physical tag by linking
          it to a pet, that tag functions the same as a digitally-generated tag for that pet.
        </p>
      </LegalSection>

      <LegalSection title="6. Public information and finder contact">
        <p>
          Content you choose to make visible on your pet's public page (name, photo, bio,
          last-seen note, and — if enabled — a masked phone number) is accessible to anyone with
          the link or who scans the tag, without requiring them to sign in. You control what's
          visible from your pet's settings and can change it at any time. Messages left by
          finders through the contact form are visible to you in your dashboard; we are not
          responsible for the accuracy of information a finder chooses to submit.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimers">
        <p>
          PetLink is a communication tool, not a guarantee that a lost pet will be found or
          returned. We are not responsible for the actions of any finder, nor for the accuracy of
          information displayed on a public pet page. The service is provided "as is" without
          warranties of any kind, to the fullest extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, PetLink and its operators are not liable for
          any indirect, incidental, or consequential damages arising from your use of the
          service, including but not limited to a pet not being recovered, missed notifications,
          or third-party (Stripe, Razorpay, Resend, WhatsApp) service interruptions.
        </p>
      </LegalSection>

      <LegalSection title="9. Termination">
        <p>
          You may stop using PetLink and delete your account at any time. We may suspend or
          terminate accounts that violate these terms, including the acceptable-use rules above.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <p>These terms are governed by the laws of [YOUR STATE/COUNTRY — e.g., India], without regard to conflict-of-law principles. Disputes will be subject to the exclusive jurisdiction of the courts of [YOUR CITY].</p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>We may update these terms from time to time. Continued use of PetLink after a change means you accept the updated terms.</p>
      </LegalSection>

      <LegalSection title="12. Contact us">
        <p>[YOUR BUSINESS NAME], [YOUR ADDRESS] — [YOUR CONTACT EMAIL]</p>
      </LegalSection>
    </LegalPage>
  );
}
