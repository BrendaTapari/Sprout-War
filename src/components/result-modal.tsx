"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/primary-button";

export function ResultModal({
  outcome,
  title,
  body,
  onExit,
}: {
  outcome: "victory" | "defeat";
  title: string;
  body: string;
  onExit: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const won = outcome === "victory";

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="battle-result-title"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-[430px] rounded-t-[2rem] border border-line bg-card px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Fin del combate
        </p>
        <h2
          id="battle-result-title"
          className={`mt-2 font-display text-6xl leading-none ${won ? "text-accent" : "text-danger"}`}
        >
          {title}
        </h2>
        <p className="mt-4 max-w-[20rem] text-base leading-relaxed text-muted">
          {body}
        </p>
        <div className="mt-8">
          <PrimaryButton ref={closeRef} onClick={onExit}>
            Volver al inicio
          </PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
