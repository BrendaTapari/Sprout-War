"use client";

import { motion } from "framer-motion";

export function DamageFloater({ amount }: { amount: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 0], y: [8, -6, -36] }}
      transition={{ duration: 0.85, times: [0, 0.18, 1], ease: "easeOut" }}
      className="pointer-events-none absolute top-2 right-3 z-10 text-lg font-bold tracking-tight text-danger"
    >
      -{amount} HP
    </motion.span>
  );
}
