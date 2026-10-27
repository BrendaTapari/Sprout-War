"use client";

import { motion } from "framer-motion";

export function HpBar({ hp, max, mirror = false }: { hp: number; max: number; mirror?: boolean }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (hp / max) * 100));
  const tone = pct > 50 ? "bg-hp" : pct > 25 ? "bg-warn" : "bg-danger";

  return (
    <div
      role="meter"
      aria-label="Vida"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={hp}
    >
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Vida
        </span>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {hp}
          <span className="font-medium text-muted">/{max}</span>
        </span>
      </div>
      <div className={`flex h-3 overflow-hidden rounded-full bg-white/10 ${mirror ? "justify-end" : ""}`}>
        <motion.div
          className={`h-full rounded-full ${tone} ${pct <= 25 ? "animate-pulse" : ""}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        />
      </div>
    </div>
  );
}
