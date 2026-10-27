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
      <div
        className={
          fighting
            ? "relative flex h-dvh w-full flex-col overflow-hidden bg-black"
            : "relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[radial-gradient(circle_at_8%_6%,oklch(0.42_0.11_145/0.55),transparent_26%),radial-gradient(circle_at_96%_14%,oklch(0.4_0.1_130/0.4),transparent_24%),radial-gradient(circle_at_70%_100%,oklch(0.32_0.08_145/0.45),transparent_36%),var(--background)] md:border-x md:border-line"
        }
      >
        <div
          ref={scrollerRef}
          className={
            fighting
              ? "relative min-h-0 flex-1 overflow-hidden"
              : "relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
          }
        >
          {children}
        </div>
        {fighting ? null : <BottomNav />}
      </div>
    </div>
  );
}
