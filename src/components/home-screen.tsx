"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ActionDock } from "@/components/action-dock";
import { LiveBattle } from "@/components/battle-screen";
import { PlantSprite } from "@/components/plant-sprite";
import { PhotoCountdown, usePhotoClock } from "@/components/photo-countdown";
import { PrimaryButton, primaryButtonClass } from "@/components/primary-button";
import { useBattleSession, useHydrated, useRoster } from "@/hooks/use-sprout-store";
import { isPhotoExpired } from "@/lib/photo-cycle";
import { ENEMY_ID, getSprite } from "@/lib/sprites";
import { saveBattle } from "@/lib/storage";

const SEEK_MS = 3000;

export function HomeScreen() {
  const hydrated = useHydrated();
  const session = useBattleSession();

  if (!hydrated) {
    return (
      <main className="px-4 pt-8">
        <div className="h-16 animate-pulse rounded-3xl bg-white/10" />
        <div className="mt-4 h-72 animate-pulse rounded-[1.75rem] bg-white/10" />
      </main>
    );
  }

  if (session) {
    return (
      <LiveBattle
        key={session.id}
        player={getSprite(session.playerId)}
        enemy={getSprite(session.enemyId)}
      />
    );
  }

  return <RingLobby />;
}

function RingLobby() {
  const hydrated = useHydrated();
  const roster = useRoster();
  const now = usePhotoClock(hydrated);
  const [seeking, setSeeking] = useState(false);

  const active = roster.fighters.find((fighter) => fighter.spriteId === roster.activeId);
  const activeSprite = active ? getSprite(active.spriteId) : null;
  const photoDue = Boolean(active && now > 0 && isPhotoExpired(active.photoAt, now));

  useEffect(() => {
    if (!seeking || !active) return;
    const timer = window.setTimeout(() => {
      saveBattle({
        id: crypto.randomUUID(),
        playerId: active.spriteId,
        enemyId: ENEMY_ID,
        createdAt: Date.now(),
      });
      setSeeking(false);
    }, SEEK_MS);
    return () => window.clearTimeout(timer);
  }, [seeking, active]);

  function buscarPelea() {
    if (!active || now === 0 || isPhotoExpired(active.photoAt, now)) return;
    setSeeking(true);
  }

  return (
    <main className="flex h-full min-h-full flex-col px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-[calc(8.75rem+env(safe-area-inset-bottom))]">
      <header className="flex shrink-0 items-end justify-between gap-3 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Sprout Wars
          </p>
          <h1 className="font-display text-4xl leading-none">Ring</h1>
        </div>
        <p className="text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {seeking ? "Buscando..." : "En espera"}
        </p>
      </header>

      {!activeSprite ? (
        <section className="mt-8 rounded-[1.75rem] border border-line bg-card px-5 py-8 text-center">
          <p className="font-display text-3xl">El ring está vacío</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Sumá una carnívora desde Luchador. Con esa planta se busca pelea.
          </p>
        </section>
      ) : (
        <>
          <div className="grid shrink-0 grid-cols-2 gap-x-6 pt-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Tu planta
              </p>
              <h2 className="font-display text-xl leading-none">{activeSprite.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Rival
              </p>
              <h2 className="font-display text-xl leading-none text-muted">
                {seeking ? "Buscando" : "Nadie"}
              </h2>
            </div>
          </div>
          <div className="relative mt-4 flex min-h-64 flex-1 items-end justify-center overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(90%_80%_at_50%_100%,oklch(0.32_0.06_145/0.55),transparent_62%),oklch(0.18_0.03_155)] px-2 pb-3">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-6 bottom-3 h-6 rounded-full bg-[oklch(0.24_0.04_145)]" />
            <div className="ring-actor relative z-10" data-side="left" data-anim="idle">
              <div className="ring-bob">
                <PlantSprite spriteId={activeSprite.id} anim="idle" label={activeSprite.name} />
              </div>
            </div>
            <div className="relative z-10 grid size-32 place-items-center">
              <p
                className={`font-display text-5xl ${seeking ? "animate-pulse text-accent" : "text-white/25"}`}
              >
                ?
              </p>
            </div>
          </div>
          {active ? <PhotoCountdown photoAt={active.photoAt} /> : null}
          {seeking ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SEEK_MS / 1000, ease: "linear" }}
              />
            </div>
          ) : (
            <p className="mt-3 text-center text-sm text-muted">
              Cada 15 días hay que subir otra foto.
            </p>
          )}
        </>
      )}

      <ActionDock>
        {!activeSprite ? (
          <Link href="/fighter" className={primaryButtonClass}>
            Ir a luchadores
          </Link>
        ) : photoDue ? (
          <Link href="/fighter" className={primaryButtonClass}>
            Subir foto
          </Link>
        ) : (
          <PrimaryButton onClick={buscarPelea} disabled={seeking}>
            {seeking ? "Buscando..." : "Buscar pelea"}
          </PrimaryButton>
        )}
      </ActionDock>
    </main>
  );
}
