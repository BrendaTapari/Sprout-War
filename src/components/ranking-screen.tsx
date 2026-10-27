"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { useHydrated, useRoster } from "@/hooks/use-sprout-store";
import { RANKING, TEAM_RANKING } from "@/lib/ranking";
import { plantOf } from "@/lib/sprites";

type RankingTab = "players" | "teams";

export function RankingScreen() {
  const hydrated = useHydrated();
  const roster = useRoster();
  const active = roster.fighters.find((fighter) => fighter.spriteId === roster.activeId);
  const activeName = active ? plantOf(active).name : null;
  const [tab, setTab] = useState<RankingTab>("players");
  const touchX = useRef<number | null>(null);

  function onTouchStart(event: TouchEvent) {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent) {
    if (touchX.current == null) return;
    const nextX = event.changedTouches[0]?.clientX ?? touchX.current;
    const delta = nextX - touchX.current;
    touchX.current = null;
    if (delta <= -48) setTab("teams");
    if (delta >= 48) setTab("players");
  }

  return (
    <main className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <ScreenHeader
        eyebrow="Temporada"
        title="Ranking"
        subtitle="Tres nombres arriba del invernadero. Los premios los ponen marcas que no existen."
      />
      <div
        role="tablist"
        aria-label="Ranking"
        className="relative mt-6 grid grid-cols-2 rounded-full bg-white/10 p-1"
      >
        <span
          aria-hidden
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-accent transition-transform duration-300 ${
            tab === "teams" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <TabButton
          selected={tab === "players"}
          onClick={() => setTab("players")}
        >
          Jugadores
        </TabButton>
        <TabButton selected={tab === "teams"} onClick={() => setTab("teams")}>
          Equipos
        </TabButton>
      </div>
      <div
        className="mt-5 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`flex w-[200%] transition-transform duration-300 ${
            tab === "teams" ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          <ol className="w-1/2 shrink-0 space-y-3">
            {RANKING.map((row) => (
              <RankCard
                key={row.place}
                place={row.place}
                title={row.alias}
                detail={`${row.fighter} · ${row.wins} victorias`}
                sponsor={row.sponsor}
                prize={row.prize}
              />
            ))}
          </ol>
          <ol className="w-1/2 shrink-0 space-y-3">
            {TEAM_RANKING.map((row) => (
              <RankCard
                key={row.place}
                place={row.place}
                title={row.name}
                detail={`${row.members} · ${row.wins} victorias`}
                sponsor={row.sponsor}
                prize={row.prize}
              />
            ))}
          </ol>
        </div>
      </div>
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

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`relative z-10 h-11 rounded-full font-display text-lg leading-none transition-colors ${
        selected ? "text-accent-ink" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function RankCard({
  place,
  title,
  detail,
  sponsor,
  prize,
}: {
  place: number;
  title: string;
  detail: string;
  sponsor: string;
  prize: string;
}) {
  return (
    <li
      className={`rounded-[1.5rem] border bg-card p-4 ${
        place === 1 ? "border-accent/50" : "border-line"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`font-display text-4xl leading-none ${
            place === 1 ? "text-accent" : "text-muted"
          }`}
        >
          {String(place).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.7rem] leading-none">{title}</p>
          <p className="mt-1.5 text-sm text-muted">{detail}</p>
          <p className="mt-3 inline-flex rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            {sponsor}
          </p>
          <p className="mt-2 text-sm text-foreground">{prize}</p>
        </div>
      </div>
    </li>
  );
}
