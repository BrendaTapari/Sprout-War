"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "@/hooks/use-sprout-store";
import { formatPhotoCountdown, isPhotoExpired, photoRemaining, PHOTO_CYCLE_MS } from "@/lib/photo-cycle";

export function usePhotoClock(enabled: boolean) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return now;
}

export function PhotoCountdown({ photoAt }: { photoAt: number }) {
  const hydrated = useHydrated();
  const now = usePhotoClock(hydrated);

  if (!hydrated || now === 0) {
    return <div className="mt-3 h-9 animate-pulse rounded-xl bg-white/10" />;
  }

  const remaining = photoRemaining(photoAt, now);
  const expired = isPhotoExpired(photoAt, now);
  const ratio = expired ? 0 : remaining / PHOTO_CYCLE_MS;

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${expired ? "text-danger" : "text-muted"}`}>
          {expired ? "Foto vencida" : "Próxima foto"}
        </p>
        <p className={`font-display text-xl leading-none whitespace-nowrap tabular-nums ${expired ? "text-danger" : "text-accent"}`}>
          {expired ? "Ahora" : formatPhotoCountdown(remaining)}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${expired ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
