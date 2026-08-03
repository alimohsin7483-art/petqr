import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: true } };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="[DATE — fill in before launch]">
      <p>
        This policy explains what personal information PetLink ("we," "us") collects, why, and
        who we share it with. It applies to petlink.app and the PetLink dashboard, shop, and
        public pet-scan pages.
      </p>
      <p className="rounded-tag border border-brass/30 bg-brass/5 p-4 text-xs">
        <strong>Before you launch:</strong> replace the bracketed placeholders below (business
        name, address, contact email, jurisdiction) with your real details, and have this
        reviewed by a lawyer familiar with India's Digital Personal Data Protection Act, 2023
        before relying on it for real customers.
      </p>

      <LegalSection title="1. Who we are">
        <p>
          PetLink is operated by [YOUR BUSINESS NAME / LEGAL ENTITY], [YOUR REGISTERED ADDRESS].
          For any privacy questions or requests, contact us at [YOUR CONTACT EMAIL].
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p><strong>Account information:</strong> full name, email address, and (optionally) a phone number you add so finders can reach you by call or WhatsApp.</p>
        <p><strong>Pet information:</strong> your pet's name, species, breed, color, photos, bio, and medical/vaccination records you choose to add.</p>
        <p><strong>Location information:</strong> an optional free-text "last seen" note you enter when activating lost mode. We do not collect precise GPS coordinates unless you type them into that note yourself.</p>
        <p><strong>Finder-submitted information:</strong> if someone scans your pet's tag and leaves a message, we collect whatever name, phone, email, and message they choose to provide.</p>
        <p><strong>Order and shipping information:</strong> if you buy a physical tag, we collect your shipping address and phone number to fulfill the order.</p>
        <p><strong>Payment information:</strong> we never see or store your card number or full payment details. Payments are processed directly by Stripe and/or Razorpay, who provide us only a payment status and transaction ID.</p>
        <p><strong>Usage data:</strong> pages visited, buttons clicked, and device/browser information, collected via Google Analytics, Google Tag Manager, Meta Pixel, and Microsoft Clarity — see "Analytics and cookies" below.</p>
      </LegalSection>

      <LegalSection title="3. How we use this information">
        <p>To create and secure your account; to generate and display your pet's public scan page; to send transactional notifications (welcome emails, lost-mode alerts, found-report messages, payment receipts) by email and, where configured, WhatsApp; to process and ship physical tag orders; to provide customer support; to improve the product using aggregated usage analytics; and to meet legal and tax obligations.</p>
      </LegalSection>

      <LegalSection title="4. Who we share it with">
        <p>We share personal data only with the service providers needed to run PetLink, and only to the extent needed:</p>
        <ul className="list-disc pl-5">
          <li><strong>Supabase</strong> — hosts our database and handles authentication.</li>
          <li><strong>Vercel</strong> — hosts the application itself.</li>
          <li><strong>Stripe and Razorpay</strong> — process payments for subscriptions and physical tag orders.</li>
          <li><strong>Resend</strong> — sends transactional emails on our behalf.</li>
          <li><strong>Meta (WhatsApp Cloud API)</strong> — sends WhatsApp notifications, where enabled.</li>
          <li><strong>Google Analytics, Google Tag Manager, Meta Pixel, Microsoft Clarity</strong> — analytics and advertising measurement.</li>
        </ul>
        <p>
          We do not sell your personal information. We only disclose it beyond the above if
          required by law, to protect PetLink's or others' rights and safety, or with your
          consent.
        </p>
      </LegalSection>

      <LegalSection title="5. What a finder sees">
        <p>
          Your pet's public scan page shows your pet's name, photo, species/breed, and — only if
          you enable it in your dashboard settings — a masked phone number with Call/WhatsApp
          buttons, and any "last seen" note you've written. You control each of these individually
          and can turn them off at any time. Your full phone number is never displayed in the
          page itself; contact buttons route through a server-side redirect.
        </p>
      </LegalSection>

      <LegalSection title="6. Analytics and cookies">
        <p>
          We use cookies and similar technologies for authentication (to keep you signed in) and,
          where configured, for analytics (Google Analytics/Tag Manager, Meta Pixel, Microsoft
          Clarity). These tools may set their own cookies and collect data under their own privacy
          policies. [If you serve visitors in the EU/UK, add a cookie-consent banner before
          enabling non-essential analytics cookies — this policy alone is not sufficient for
          GDPR/UK-GDPR compliance.]
        </p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>
          We retain account and pet data for as long as your account is active. If you delete a
          pet or close your account, records are marked for deletion and removed from active use;
          some records (such as payment/order history) may be retained longer where required for
          tax, accounting, or legal purposes.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          You can access, correct, or delete most of your information directly from your
          dashboard settings. To request a full export or deletion of your account data, or to
          ask any question about how your data is used, contact us at [YOUR CONTACT EMAIL]. If
          you're in a jurisdiction with statutory data-protection rights (such as India's DPDP
          Act, the EU/UK GDPR, or similar), you may have additional rights to access, correct,
          port, or erase your data, and to object to certain processing.
        </p>
      </LegalSection>

      <LegalSection title="9. Children's privacy">
        <p>PetLink is not directed at children under 18, and we do not knowingly collect personal information from children.</p>
      </LegalSection>

      <LegalSection title="10. Changes to this policy">
        <p>We may update this policy from time to time. Material changes will be reflected by updating the "Last updated" date above.</p>
      </LegalSection>

      <LegalSection title="11. Contact us">
        <p>[YOUR BUSINESS NAME], [YOUR ADDRESS] — [YOUR CONTACT EMAIL]</p>
      </LegalSection>
    </LegalPage>
  );
}
