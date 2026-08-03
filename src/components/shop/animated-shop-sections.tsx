"use client";

import { motion } from "framer-motion";
import { RevealStagger, revealItemVariants } from "@/components/motion/reveal";
import { HoverLift } from "@/components/motion/hover-lift";
import { TagIllustration } from "@/components/shop/tag-illustration";
import { BuyButtons } from "@/components/shop/buy-buttons";
import { Quote } from "lucide-react";

interface ProductLike {
  id: string;
  name: string;
  description: string | null;
  priceInr: string;
  priceUsd: string;
  visualVariant: string;
}

export function ProductGrid({ products }: { products: ProductLike[] }) {
  return (
    <RevealStagger className="flex flex-col gap-5" staggerDelay={0.1}>
      {products.map((product) => (
        <motion.div key={product.id} variants={revealItemVariants}>
          <HoverLift>
            <div className="grid gap-6 rounded-tag border border-line bg-white/50 p-6 sm:grid-cols-[140px_1fr] sm:items-center">
              <TagIllustration
                variant={(product.visualVariant as "steel" | "brass" | "black") ?? "steel"}
                className="mx-auto w-full max-w-[120px]"
              />
              <div>
                <p className="font-display text-xl text-ink">{product.name}</p>
                {product.description && (
                  <p className="mt-1 text-sm text-ink/60">{product.description}</p>
                )}
                <p className="mt-3 mb-4 text-2xl font-medium text-ink">
                  ₹{product.priceInr}
                  <span className="ml-2 text-sm font-normal text-ink/40">
                    (${product.priceUsd} intl.)
                  </span>
                </p>
                <BuyButtons productId={product.id} />
              </div>
            </div>
          </HoverLift>
        </motion.div>
      ))}
    </RevealStagger>
  );
}

export function TestimonialGrid({
  testimonials,
}: {
  testimonials: { quote: string; name: string; location: string }[];
}) {
  return (
    <RevealStagger className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
      {testimonials.map((t) => (
        <motion.div key={t.name} variants={revealItemVariants}>
          <div className="rounded-tag border border-line bg-paper p-6">
            <Quote className="mb-3 h-5 w-5 text-brass-dark/60" strokeWidth={1.5} />
            <p className="mb-4 text-sm leading-relaxed text-ink/80">"{t.quote}"</p>
            <p className="font-mono text-xs text-ink/50">
              {t.name} · {t.location}
            </p>
          </div>
        </motion.div>
      ))}
    </RevealStagger>
  );
}
