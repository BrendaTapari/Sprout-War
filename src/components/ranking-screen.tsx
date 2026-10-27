"use client";

import { ScreenHeader } from "@/components/screen-header";
import { useHydrated, useRoster } from "@/hooks/use-sprout-store";
import { getSprite } from "@/lib/sprites";
import { RANKING } from "@/lib/ranking";

export function RankingScreen() {
  const hydrated = useHydrated();
  const roster = useRoster();
  const active = roster.fighters.find((fighter) => fighter.spriteId === roster.activeId);
  const activeName = active ? getSprite(active.spriteId).name : null;

  return (
    <main className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <ScreenHeader
        eyebrow="Temporada"
        title="Ranking"
        subtitle="Tres nombres arriba del invernadero. Los premios los ponen marcas que no existen."
      />
      <ol className="mt-8 space-y-3">
        {RANKING.map((row) => (
          <li
            key={row.place}
            className={`rounded-[1.5rem] border bg-card p-4 ${
              row.place === 1 ? "border-accent/50" : "border-line"
            }`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`font-display text-4xl leading-none ${
                  row.place === 1 ? "text-accent" : "text-muted"
                }`}
              >
                {String(row.place).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.7rem] leading-none">
                  {row.alias}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {row.fighter} · {row.wins} victorias
                </p>
                <p className="mt-3 inline-flex rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
                  {row.sponsor}
                </p>
                <p className="mt-2 text-sm text-foreground">{row.prize}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {hydrated && activeName ? (
        <p className="mt-6 text-center text-sm text-muted">
          Tu representante:{" "}
          <span className="font-medium text-foreground">{activeName}</span>
        </p>
      ) : null}
      <p className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        Demo universitaria · premios ficticios
      </p>
    </main>
  );
}
