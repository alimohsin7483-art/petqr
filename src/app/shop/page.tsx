import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { listActiveProducts } from "@/services/shop/products.service";
import { TagIllustration } from "@/components/shop/tag-illustration";
import { FloatingIllustration } from "@/components/motion/floating-illustration";
import { Reveal } from "@/components/motion/reveal";
import { HowItWorks } from "@/components/shop/how-it-works";
import { TrustBadges } from "@/components/shop/trust-badges";
import { ProductGrid, TestimonialGrid } from "@/components/shop/animated-shop-sections";
import { FaqList } from "@/components/marketing/animated-sections";

export const metadata: Metadata = {
  title: "Shop physical tags",
  description: "Durable, laser-etched steel tags for your pet's collar. Pay once, ships across India.",
};

const TESTIMONIALS = [
  {
    quote: "My dog slipped his collar at the park. Someone scanned the tag and called me in under 10 minutes.",
    name: "Priya S.",
    location: "Bengaluru",
  },
  {
    quote: "Been through three paper tags that faded in a season. This one's been on for months, still perfectly readable.",
    name: "Arjun M.",
    location: "Pune",
  },
];

const FAQS = [
  {
    q: "Does the tag need charging or an app?",
    a: "No — it's a passive QR code, nothing to charge and nothing to install. Anyone's phone camera can scan it.",
  },
  {
    q: "What if I lose the tag?",
    a: "Every tag includes a free one-time replacement if it's lost or damaged — just contact us with your order details.",
  },
  {
    q: "Do I have to pay every month?",
    a: "No. The tag is a one-time purchase. Your pet's PetLink profile is free to maintain.",
  },
];

export default async function ShopPage() {
  const products = await listActiveProducts();
  const productsForClient = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceInr: p.priceInr.toString(),
    priceUsd: p.priceUsd.toString(),
    visualVariant: p.visualVariant,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brass/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-medium text-ink">
          <PawPrint className="h-5 w-5 text-brass-dark" strokeWidth={1.75} />
          PetLink
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/sign-in" className="text-ink/70 transition-colors hover:text-ink">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-5xl items-center gap-10 px-6 py-10 sm:grid-cols-2 sm:py-16">
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
            The tag that talks back
          </p>
          <h1 className="mb-5 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
            A tag built to outlast the collar it's on
          </h1>
          <p className="mb-8 max-w-md text-base text-ink/70">
            One-time purchase, no subscription. Laser-etched steel, waterproof, and linked to a
            free PetLink profile — scan it and reach the owner in seconds. Ships across India.
          </p>
          <TrustBadges />
        </Reveal>
        <Reveal delay={0.15}>
          <FloatingIllustration className="mx-auto w-full max-w-[280px]">
            <TagIllustration className="w-full" />
          </FloatingIllustration>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <Reveal>
          <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
            How it works
          </p>
          <HowItWorks />
        </Reveal>
      </section>

      {/* Products */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <h2 className="mb-2 text-center font-display text-2xl font-medium text-ink">
            Choose your tag
          </h2>
          <p className="mb-8 text-center text-sm text-ink/60">
            All prices in Indian Rupees. Free replacement guarantee on every tag.
          </p>
        </Reveal>
        {productsForClient.length > 0 ? (
          <ProductGrid products={productsForClient} />
        ) : (
          <p className="rounded-tag border border-dashed border-line p-8 text-center text-sm text-ink/50">
            No physical tags available yet — check back soon.
          </p>
        )}
      </section>

      {/* Testimonials */}
      <section className="relative z-10 bg-white/40 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
              From pet owners
            </p>
          </Reveal>
          <TestimonialGrid testimonials={TESTIMONIALS} />
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <Reveal>
          <h2 className="mb-8 text-center font-display text-2xl font-medium text-ink">
            Questions before you order
          </h2>
        </Reveal>
        <FaqList faqs={FAQS} />
      </section>

      <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-16 text-center">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-sm text-ink/50">
          <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-ink">Refund &amp; Shipping</Link>
        </div>
        <p className="font-mono text-[11px] text-ink/30">Protected by PetLink · petlink.app</p>
      </footer>
    </div>
  );
}
