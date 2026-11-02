"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ScreenHeader } from "@/components/screen-header";
import { PLAYER_LEAGUES, TEAM_RANKING, championOfLeagues } from "@/lib/ranking";

type RankingTab = "players" | "teams";
type LeagueName = (typeof PLAYER_LEAGUES)[number]["name"];

function isLeagueName(value: string): value is LeagueName {
  return PLAYER_LEAGUES.some((item) => item.name === value);
}

export function RankingScreen() {
  const [tab, setTab] = useState<RankingTab>("players");
  const [leagueName, setLeagueName] = useState<LeagueName>(PLAYER_LEAGUES[0].name);
  const league = PLAYER_LEAGUES.find((item) => item.name === leagueName) ?? PLAYER_LEAGUES[0];
  const champion = championOfLeagues();
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
    <main className="min-w-0 max-w-full overflow-x-hidden px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <ScreenHeader
        eyebrow="Temporada"
        title="Ranking"
        subtitle="Cada liga tiene su podio. Los premios los ponen marcas que no existen."
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
        className="mt-5 w-full min-w-0 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`flex w-[200%] transition-transform duration-300 ${
            tab === "teams" ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          <div className={`w-1/2 min-w-0 shrink-0 ${tab === "teams" ? "h-0 overflow-hidden" : ""}`}>
            {champion ? (
              <section className="rounded-[1.5rem] border border-accent/50 bg-card p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
                  Ganador de todas las ligas
                </p>
                <h2 className="mt-2 font-display text-3xl leading-none">{champion.alias}</h2>
                <p className="mt-1.5 text-sm text-muted">
                  {champion.fighter} · {champion.league}
                </p>
                <p className="mt-3 font-display text-2xl leading-none text-accent">
                  {champion.wins} puntos
                </p>
              </section>
            ) : null}
            <label className="mt-5 block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
                Ligas
              </span>
              <span className="relative mt-2 block">
                <select
                  value={league.name}
                  onChange={(event) => {
                    if (isLeagueName(event.target.value)) setLeagueName(event.target.value);
                  }}
                  className="h-12 w-full appearance-none rounded-2xl border border-line bg-card px-4 pr-10 font-display text-xl text-foreground outline-none focus:border-accent"
                >
                  {PLAYER_LEAGUES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted">
                  ▾
                </span>
              </span>
            </label>
            <section className="mt-4" aria-label={league.name}>
              <h2 className="font-display text-3xl leading-none">{league.name}</h2>
              <ol className="mt-3 space-y-3">
                {league.rows.map((row) => (
                  <RankCard
                    key={`${league.name}-${row.place}`}
                    place={row.place}
                    title={row.alias}
                    detail={`${row.fighter} · ${row.wins} victorias`}
                    sponsor={row.sponsor}
                    prize={row.prize}
                  />
                ))}
              </ol>
            </section>
          </div>
          <ol className={`w-1/2 min-w-0 shrink-0 space-y-3 ${tab === "players" ? "h-0 overflow-hidden" : ""}`}>
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
          <p className="font-display text-[1.7rem] leading-none break-words">{title}</p>
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
