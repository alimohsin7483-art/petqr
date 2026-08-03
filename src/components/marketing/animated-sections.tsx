"use client";

import { motion } from "framer-motion";
import { RevealStagger, revealItemVariants } from "@/components/motion/reveal";
import { HoverLift } from "@/components/motion/hover-lift";

export function FeatureGrid({ features }: { features: { title: string; body: string }[] }) {
  return (
    <RevealStagger className="mt-24 grid gap-8 sm:grid-cols-3">
      {features.map((f) => (
        <motion.div key={f.title} variants={revealItemVariants}>
          <HoverLift>
            <div className="rounded-tag border border-line bg-white/50 p-6">
              <p className="mb-2 font-display text-lg text-ink">{f.title}</p>
              <p className="text-sm text-ink/60">{f.body}</p>
            </div>
          </HoverLift>
        </motion.div>
      ))}
    </RevealStagger>
  );
}

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <RevealStagger className="flex flex-col gap-4" staggerDelay={0.06}>
      {faqs.map((f) => (
        <motion.div key={f.q} variants={revealItemVariants}>
          <div className="rounded-tag border border-line bg-white/50 p-5 transition-colors hover:border-brass/40">
            <p className="mb-1 font-medium text-ink">{f.q}</p>
            <p className="text-sm text-ink/60">{f.a}</p>
          </div>
        </motion.div>
      ))}
    </RevealStagger>
  );
}
