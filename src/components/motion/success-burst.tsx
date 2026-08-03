"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#C98A3B", "#132A3E", "#3E7A5C", "#DED7C7"];

export function SuccessBurst({ trigger }: { trigger: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        angle: (360 / 18) * i + Math.random() * 12,
        distance: 70 + Math.random() * 50,
        size: 5 + Math.random() * 5,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.08,
      })),
    []
  );

  if (!trigger) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x, y, opacity: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
