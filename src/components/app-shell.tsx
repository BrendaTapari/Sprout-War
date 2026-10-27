"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { useBattleSession } from "@/hooks/use-sprout-store";
import { ensureAccountDefaults, ensureRosterDefaults } from "@/lib/storage";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const battle = useBattleSession();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fighting = pathname === "/" && battle !== null;

  useEffect(() => {
    ensureRosterDefaults();
    ensureAccountDefaults();
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[radial-gradient(120%_70%_at_50%_-8%,oklch(0.34_0.07_150/0.55),transparent_52%),var(--background)] md:border-x md:border-line">
        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
        >
          {children}
        </div>
        {fighting ? null : <BottomNav />}
      </div>
    </div>
  );
}
