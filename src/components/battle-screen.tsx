"use client";

import { useEffect, useRef, useState } from "react";
import { ActionDock } from "@/components/action-dock";
import { DamageFloater } from "@/components/damage-floater";
import { HpBar } from "@/components/hp-bar";
import { PlantSprite } from "@/components/plant-sprite";
import { AppLogo } from "@/components/app-logo";
import { PrimaryButton, ghostButtonClass } from "@/components/primary-button";
import { ResultModal } from "@/components/result-modal";
import { rollDamage } from "@/lib/damage";
import { clearBattle } from "@/lib/storage";
import type { SpriteAnim, SpritePlant } from "@/lib/types";

const ATTACK_MS = 500;
const BLOCK_MS = 480;
const HURT_MS = 380;
const DEATH_MS = 720;
const ENEMY_BLOCK_CHANCE = 0.34;

type Outcome = "victory" | "defeat";
type Turn = "player" | "enemy" | "busy";
type Floater = { id: number; amount: number; side: "player" | "enemy" };

export function LiveBattle({ player, enemy }: { player: SpritePlant; enemy: SpritePlant }) {
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerAnim, setPlayerAnim] = useState<SpriteAnim>("idle");
  const [enemyAnim, setEnemyAnim] = useState<SpriteAnim>("idle");
  const [turn, setTurn] = useState<Turn>("player");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [log, setLog] = useState("Tu turno. Atacá o bloqueá.");
  const [floaters, setFloaters] = useState<Floater[]>([]);

  const endedRef = useRef(false);
  const aliveRef = useRef(true);
  const turnRef = useRef(turn);
  const playerHpRef = useRef(player.hp);
  const enemyHpRef = useRef(enemy.hp);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    aliveRef.current = true;
    if (!endedRef.current && turnRef.current !== "player") {
      setTurn("player");
      setPlayerAnim("idle");
      setEnemyAnim("idle");
      setLog("Tu turno. Atacá o bloqueá.");
    }
    const bucket = timers.current;
    return () => {
      aliveRef.current = false;
      for (const timer of bucket) window.clearTimeout(timer);
      bucket.length = 0;
    };
  }, []);

  function later(ms: number, action: () => void) {
    const id = window.setTimeout(() => {
      if (aliveRef.current) action();
    }, ms);
    timers.current.push(id);
  }

  function splash(side: "player" | "enemy", amount: number) {
    const id = Date.now() + Math.random();
    setFloaters((current) => [...current, { id, amount, side }]);
    later(900, () => {
      setFloaters((current) => current.filter((item) => item.id !== id));
    });
  }

  function applyHit(side: "player" | "enemy", amount: number, line: string) {
    const hpRef = side === "player" ? playerHpRef : enemyHpRef;
    const next = Math.max(0, hpRef.current - amount);
    hpRef.current = next;
    if (side === "player") setPlayerHp(next);
    else setEnemyHp(next);
    splash(side, amount);
    setLog(line);
    return next <= 0;
  }

  function finish(result: Outcome, anim: "player" | "enemy") {
    endedRef.current = true;
    if (anim === "enemy") setEnemyAnim("death");
    else setPlayerAnim("death");
    later(DEATH_MS, () => setOutcome(result));
  }

  function enemyTurn() {
    if (endedRef.current) return;
    setTurn("enemy");
    setEnemyAnim("attack");
    setPlayerAnim("idle");
    const amount = rollDamage(enemy.attack, player.defense);
    later(ATTACK_MS, () => {
      if (endedRef.current) return;
      setEnemyAnim("idle");
      const killed = applyHit("player", amount, `${enemy.name} muerde · -${amount} HP`);
      if (killed) {
        finish("defeat", "player");
        return;
      }
      setPlayerAnim("hurt");
      later(HURT_MS, () => {
        if (endedRef.current) return;
        setPlayerAnim("idle");
        setTurn("player");
        setLog("Tu turno. Atacá o bloqueá.");
      });
    });
  }

  function onAttack() {
    if (turn !== "player" || endedRef.current) return;
    const blocked = Math.random() < ENEMY_BLOCK_CHANCE;
    setTurn("busy");
    setPlayerAnim("attack");
    if (blocked) setEnemyAnim("block");
    const amount = rollDamage(player.attack, enemy.defense, blocked);
    later(ATTACK_MS, () => {
      if (endedRef.current) return;
      setPlayerAnim("idle");
      const line = blocked
        ? `${enemy.name} bloquea · -${amount} HP`
        : `${player.name} muerde · -${amount} HP`;
      const killed = applyHit("enemy", amount, line);
      if (killed) {
        finish("victory", "enemy");
        return;
      }
      if (blocked) {
        later(BLOCK_MS, () => {
          if (endedRef.current) return;
          setEnemyAnim("idle");
          enemyTurn();
        });
        return;
      }
      setEnemyAnim("hurt");
      later(HURT_MS, () => {
        if (endedRef.current) return;
        enemyTurn();
      });
    });
  }

  function onBlock() {
    if (turn !== "player" || endedRef.current) return;
    setTurn("busy");
    setPlayerAnim("block");
    setEnemyAnim("idle");
    setLog("Te cubrís.");
    later(220, () => {
      if (endedRef.current) return;
      setEnemyAnim("attack");
      const amount = rollDamage(enemy.attack, player.defense, true);
      later(ATTACK_MS, () => {
        if (endedRef.current) return;
        setEnemyAnim("idle");
        const killed = applyHit("player", amount, `Bloqueás el mordisco · -${amount} HP`);
        if (killed) {
          finish("defeat", "player");
          return;
        }
        later(280, () => {
          if (endedRef.current) return;
          setPlayerAnim("idle");
          setTurn("player");
          setLog("Tu turno. Atacá o bloqueá.");
        });
      });
    });
  }

  function exit() {
    clearBattle();
  }

  const turnLabel =
    turn === "player"
      ? "Tu turno"
      : playerAnim === "block"
        ? "Bloqueando..."
        : turn === "enemy"
          ? "Turno del rival"
          : "Mordiendo...";

  return (
    <>
      <main
        className="flex h-full min-h-full flex-col px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
        inert={outcome ? true : undefined}
      >
        <header className="flex shrink-0 items-end justify-between gap-3 pb-2">
          <div>
            <div className="flex items-center gap-3">
              <AppLogo className="size-12" />
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
                  Ring
                </p>
                <h1 className="font-display text-4xl leading-none">Pelea</h1>
              </div>
            </div>
          </div>
          <p className="text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {turnLabel}
          </p>
        </header>
        <div className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 pt-1">
          <FighterHud plant={player} hp={playerHp} label="Tu planta" />
          <FighterHud plant={enemy} hp={enemyHp} label="Rival" mirror />
        </div>
        <div className="relative mt-4 flex min-h-64 flex-1 items-end justify-center overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(90%_80%_at_50%_100%,oklch(0.32_0.06_145/0.55),transparent_62%),oklch(0.18_0.03_155)] px-2 pb-3">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="pointer-events-none absolute inset-x-6 bottom-3 h-6 rounded-full bg-[oklch(0.32_0.06_120)]" />
          <RingFighter
            side="left"
            plant={player}
            anim={playerAnim}
            floaters={floaters.filter((item) => item.side === "player")}
          />
          <RingFighter
            side="right"
            plant={enemy}
            anim={enemyAnim}
            floaters={floaters.filter((item) => item.side === "enemy")}
          />
        </div>
        <p aria-live="polite" className="shrink-0 pt-2 text-center text-sm text-muted">
          {log}
        </p>
      </main>
      {outcome ? null : (
        <ActionDock aboveNav={false}>
          <div className="grid grid-cols-2 gap-2">
            <PrimaryButton onClick={onAttack} disabled={turn !== "player"}>
              ATACAR
            </PrimaryButton>
            <button
              type="button"
              onClick={onBlock}
              disabled={turn !== "player"}
              className={ghostButtonClass}
            >
              BLOQUEAR
            </button>
          </div>
        </ActionDock>
      )}
      {outcome ? (
        <ResultModal
          outcome={outcome}
          title={outcome === "victory" ? "Victoria" : "Derrota"}
          body={
            outcome === "victory"
              ? `${player.name} deja el ring en pie, con ${playerHp} HP.`
              : `${enemy.name} se queda con la maceta.`
          }
          onExit={exit}
        />
      ) : null}
    </>
  );
}

function FighterHud({
  plant,
  hp,
  label,
  mirror = false,
}: {
  plant: SpritePlant;
  hp: number;
  label: string;
  mirror?: boolean;
}) {
  return (
    <div className={mirror ? "text-right" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <h2 className="font-display text-xl leading-none">{plant.name}</h2>
      <div className="mt-2">
        <HpBar hp={hp} max={plant.hp} mirror={mirror} />
      </div>
    </div>
  );
}

function RingFighter({
  side,
  plant,
  anim,
  floaters,
}: {
  side: "left" | "right";
  plant: SpritePlant;
  anim: SpriteAnim;
  floaters: Floater[];
}) {
  return (
    <div className="ring-actor relative z-10" data-side={side} data-anim={anim}>
      {floaters.map((floater) => (
        <DamageFloater key={floater.id} amount={floater.amount} />
      ))}
      <div className="ring-bob">
        <div className={side === "right" ? "ring-face" : undefined}>
          <PlantSprite
            spriteId={plant.id}
            anim={anim}
            label={plant.name}
            hue={plant.hue}
            sheet={plant.sheet}
          />
        </div>
      </div>
    </div>
  );
}
