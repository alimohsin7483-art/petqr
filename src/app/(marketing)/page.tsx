import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { TagIllustration } from "@/components/shop/tag-illustration";
import { FloatingIllustration } from "@/components/motion/floating-illustration";
import { Reveal } from "@/components/motion/reveal";
import { FeatureGrid, FaqList } from "@/components/marketing/animated-sections";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export const metadata: Metadata = {
  title: "PetLink — A tag that talks back",
  description:
    "Give every pet a secure digital ID. Scan the QR tag and reach the owner instantly — no app required for the finder.",
  alternates: { canonical: APP_URL },
  openGraph: {
    title: "PetLink — A tag that talks back",
    description: "Secure digital ID tags for pets. Scan to reach the owner instantly.",
    url: APP_URL,
    siteName: "PetLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetLink — A tag that talks back",
    description: "Secure digital ID tags for pets. Scan to reach the owner instantly.",
  },
};

const FAQS = [
  {
    q: "What happens when someone scans my pet's tag?",
    a: "They land on a page showing your pet's name, photo, and a way to reach you — a masked contact option and a message form. No app install, no account needed on their end.",
  },
  {
    q: "Is my phone number visible to whoever scans the tag?",
    a: "No. We show a masked version, and the actual call/WhatsApp buttons route through a secure redirect — your real number is never exposed in the page itself.",
  },
  {
    q: "What if my pet's tag is lost or damaged?",
    a: "You can regenerate a new QR code any time from your dashboard — it points to the same profile, so nothing about your pet's identity changes.",
  },
  {
    q: "Do I need a subscription?",
    a: "The free plan covers one pet with a working tag and scan page. Paid plans unlock more pets, medical records, and custom tag designs.",
  },
];

const FEATURES = [
  { title: "Scan to connect", body: "A QR code on the collar links straight to a live profile — no login required for the finder." },
  { title: "Lost mode", body: "Flip one switch and the public page shows a lost banner, prompting anyone who scans it to help." },
  { title: "Instant alerts", body: "In-app messages plus email notify you the moment someone finds your pet." },
];

export default function MarketingHomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* Ambient background blobs — subtle, premium feel without noise */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brass/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-40 h-96 w-96 rounded-full bg-found/10 blur-3xl" />

      <JsonLd
        data={{ "@context": "https://schema.org", "@type": "Organization", name: "PetLink", url: APP_URL }}
      />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "PetLink", url: APP_URL }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="font-display text-xl font-medium text-ink">PetLink</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/shop" className="text-ink/70 transition-colors hover:text-ink">
            Shop
          </Link>
          <Link href="/sign-in" className="text-ink/70 transition-colors hover:text-ink">
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button className="w-auto">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-8">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
              A tag that talks back
            </p>
            <h1 className="mb-6 font-display text-5xl font-medium leading-tight text-ink">
              Every pet deserves a way home
            </h1>
            <p className="mb-10 max-w-xl text-lg text-ink/70">
              PetLink gives your pet a secure, scannable ID. Anyone who finds them can reach you in
              seconds — no app, no account, just a scan.
            </p>
            <Link href="/sign-up">
              <Button className="w-auto px-8 py-4 text-base">Register your pet — free</Button>
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <FloatingIllustration className="mx-auto w-full max-w-[240px]">
              <TagIllustration className="w-full" />
            </FloatingIllustration>
          </Reveal>
        </div>

        <FeatureGrid features={FEATURES} />

        <Reveal className="mt-24">
          <h2 className="mb-6 text-center font-display text-2xl font-medium text-ink">
            Common questions
          </h2>
          <FaqList faqs={FAQS} />
        </Reveal>
      </main>

      <footer className="relative z-10 mx-auto max-w-5xl px-6 py-10 text-center">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-sm text-ink/50">
          <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-ink">Refund &amp; Shipping</Link>
        </div>
        <p className="font-mono text-[11px] text-ink/30">PetLink · petlink.app</p>
      </footer>
    </div>
  );
}
