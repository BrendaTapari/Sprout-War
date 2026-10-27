"use client";

import { motion } from "framer-motion";

const TONES = {
  hp: "bg-hp",
  attack: "bg-atk",
  defense: "bg-def",
} as const;

export function StatBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: keyof typeof TONES;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="font-medium uppercase tracking-[0.16em] text-muted">
          {label}
        </span>
        <span className="font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${TONES[tone]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
