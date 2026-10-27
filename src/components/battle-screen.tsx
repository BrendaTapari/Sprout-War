"use client";

import { useEffect, useRef, useState } from "react";
import { DamageFloater } from "@/components/damage-floater";
import { HpBar } from "@/components/hp-bar";
import { PlantSprite } from "@/components/plant-sprite";
import { FightRing } from "@/components/fight-ring";
import { ResultModal } from "@/components/result-modal";
import { rollDamage } from "@/lib/damage";
import { clearBattle } from "@/lib/storage";
import type { SpriteAnim, SpritePlant } from "@/lib/types";

const ATTACK_MS = 420;
const HURT_MS = 280;
const DEATH_MS = 720;
const RANGE = 24;
const POWER_MAX = 100;

type Outcome = "victory" | "defeat";
type Floater = { id: number; amount: number; side: "player" | "enemy"; blocked?: boolean };

export function LiveBattle({ player, enemy }: { player: SpritePlant; enemy: SpritePlant }) {
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerAnim, setPlayerAnim] = useState<SpriteAnim>("idle");
  const [enemyAnim, setEnemyAnim] = useState<SpriteAnim>("idle");
  const [playerX, setPlayerX] = useState(28);
  const [enemyX, setEnemyX] = useState(52);
  const [power, setPower] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [log, setLog] = useState("Movete con la izquierda. Pegá con la derecha.");
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [landscape, setLandscape] = useState<boolean | null>(null);

  const endedRef = useRef(false);
  const aliveRef = useRef(true);
  const blockingRef = useRef(false);
  const busyRef = useRef(false);
  const playerHpRef = useRef(player.hp);
  const enemyHpRef = useRef(enemy.hp);
  const playerXRef = useRef(28);
  const enemyXRef = useRef(52);
  const powerRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(orientation: landscape)");
    const read = () => setLandscape(media.matches);
    read();
    media.addEventListener("change", read);
    window.addEventListener("resize", read);
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    orientation.lock?.("landscape").catch(() => undefined);
    return () => {
      media.removeEventListener("change", read);
      window.removeEventListener("resize", read);
      screen.orientation?.unlock?.();
    };
  }, []);

  useEffect(() => {
    aliveRef.current = true;
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

  function splash(side: "player" | "enemy", amount: number, blocked = false) {
    const id = Date.now() + Math.random();
    setFloaters((current) => [...current, { id, amount, side, blocked }]);
    later(900, () => {
      setFloaters((current) => current.filter((item) => item.id !== id));
    });
  }

  function charge(amount: number) {
    const next = Math.min(POWER_MAX, powerRef.current + amount);
    powerRef.current = next;
    setPower(next);
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
    busyRef.current = false;
    if (anim === "enemy") setEnemyAnim("death");
    else setPlayerAnim("death");
    later(DEATH_MS, () => setOutcome(result));
  }

  function place(kind: "player" | "enemy", value: number) {
    const next = Math.round(value * 10) / 10;
    if (kind === "player") {
      playerXRef.current = next;
      setPlayerX(next);
    } else {
      enemyXRef.current = next;
      setEnemyX(next);
    }
  }

  function inRange() {
    return enemyXRef.current - playerXRef.current <= RANGE;
  }

  const actRef = useRef({ enemy: () => undefined as void });
  actRef.current.enemy = () => {
    if (endedRef.current || busyRef.current || landscape !== true) return;
    const gap = enemyXRef.current - playerXRef.current;
    if (gap > RANGE) {
      place("enemy", Math.max(playerXRef.current + 18, enemyXRef.current - 6));
      setEnemyAnim("idle");
      return;
    }
    setEnemyAnim("attack");
    later(ATTACK_MS, () => {
      if (endedRef.current) return;
      setEnemyAnim("idle");
      if (blockingRef.current) {
        splash("player", 0, true);
        setPlayerAnim("block");
        setLog("La piña no entra.");
        return;
      }
      setPlayerAnim("hurt");
      const amount = rollDamage(enemy.attack, player.defense);
      const killed = applyHit("player", amount, `${enemy.name} muerde · -${amount} HP`);
      if (killed) {
        finish("defeat", "player");
        return;
      }
      charge(4);
      later(HURT_MS, () => {
        if (!endedRef.current && !blockingRef.current) setPlayerAnim("idle");
      });
    });
  };

  useEffect(() => {
    if (landscape !== true) return;
    const step = window.setInterval(() => actRef.current.enemy(), 2200);
    const meter = window.setInterval(() => {
      if (endedRef.current || powerRef.current >= POWER_MAX) return;
      charge(3);
    }, 250);
    return () => {
      window.clearInterval(step);
      window.clearInterval(meter);
    };
  }, [landscape]);

  function moveBy(delta: number) {
    if (endedRef.current || busyRef.current) return;
    const limit = enemyXRef.current - 16;
    place("player", Math.min(limit, Math.max(6, playerXRef.current + delta)));
  }

  function onAttack() {
    if (endedRef.current || busyRef.current || blockingRef.current) return;
    if (!inRange()) {
      moveBy(8);
      setLog("Acercate un poco más.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setPlayerAnim("attack");
    const blocked = Math.random() < 0.34;
    if (blocked) setEnemyAnim("block");
    const amount = rollDamage(player.attack, enemy.defense, blocked);
    later(ATTACK_MS, () => {
      if (endedRef.current) return;
      setPlayerAnim("idle");
      if (blocked || amount <= 0) {
        splash("enemy", 0, true);
        setLog(`${enemy.name} se cubre.`);
        later(280, () => {
          if (endedRef.current) return;
          setEnemyAnim("idle");
          busyRef.current = false;
          setBusy(false);
        });
        return;
      }
      const killed = applyHit("enemy", amount, `${player.name} muerde · -${amount} HP`);
      charge(18);
      if (killed) {
        finish("victory", "enemy");
        return;
      }
      setEnemyAnim("hurt");
      later(HURT_MS, () => {
        if (endedRef.current) return;
        setEnemyAnim("idle");
        busyRef.current = false;
        setBusy(false);
      });
    });
  }

  function onSuper() {
    if (endedRef.current || busyRef.current || powerRef.current < POWER_MAX) return;
    if (!inRange()) {
      moveBy(8);
      setLog("Acercate para el super.");
      return;
    }
    powerRef.current = 0;
    setPower(0);
    busyRef.current = true;
    setBusy(true);
    setLog("¡Super!");
    swing(2);
  }

  function swing(left: number) {
    setPlayerAnim("idle");
    later(70, () => {
      if (endedRef.current) return;
      setPlayerAnim("attack");
      const amount = rollDamage(player.attack, enemy.defense);
      later(ATTACK_MS, () => {
        if (endedRef.current) return;
        setPlayerAnim("idle");
        const killed = applyHit("enemy", amount, `Super · -${amount} HP`);
        if (killed) {
          finish("victory", "enemy");
          return;
        }
        setEnemyAnim("hurt");
        if (left > 1) {
          later(220, () => {
            if (endedRef.current) return;
            setEnemyAnim("idle");
            swing(left - 1);
          });
          return;
        }
        later(HURT_MS, () => {
          if (endedRef.current) return;
          setEnemyAnim("idle");
          busyRef.current = false;
          setBusy(false);
          setLog("La barra quedó vacía.");
        });
      });
    });
  }

  function holdBlock(next: boolean) {
    if (endedRef.current || busyRef.current) return;
    blockingRef.current = next;
    setBlocking(next);
    setPlayerAnim(next ? "block" : "idle");
    if (next) setLog("Te cubrís. La piña no entra.");
  }

  if (landscape === null) {
    return <div className="h-full bg-black" />;
  }

  if (!landscape) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="rotate-phone grid h-20 w-12 place-items-end rounded-2xl border-2 border-accent pb-2">
          <span className="mx-auto h-1.5 w-5 rounded-full bg-accent" />
        </div>
        <div>
          <h1 className="font-display text-4xl leading-none">Volteá el celular</h1>
          <p className="mt-3 text-sm text-muted">La pelea se juega a lo largo, como el ring.</p>
        </div>
      </div>
    );
  }

  const ready = power >= POWER_MAX;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FightRing stage>
        <RingFighter
          side="left"
          x={playerX}
          plant={player}
          anim={playerAnim}
          floaters={floaters.filter((item) => item.side === "player")}
        />
        <RingFighter
          side="right"
          x={enemyX}
          plant={enemy}
          anim={enemyAnim}
          floaters={floaters.filter((item) => item.side === "enemy")}
        />
      </FightRing>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-4 pt-[max(0.6rem,env(safe-area-inset-top))] pb-10">
        <div className="grid grid-cols-2 items-end gap-8">
          <FighterHud plant={player} hp={playerHp} label="Tu planta" />
          <FighterHud plant={enemy} hp={enemyHp} label="Rival" mirror />
        </div>
        <div className="mx-auto mt-2 w-full max-w-sm">
          <div className="mb-1 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent">
            <span>Poder</span>
            <span>{ready ? "Listo" : `${power}`}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/50">
            <div
              className={`h-full rounded-full bg-accent transition-[width] duration-200 ${ready ? "shadow-[0_0_12px_var(--accent)]" : ""}`}
              style={{ width: `${power}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/80">
            {log}
          </p>
        </div>
      </div>

      {outcome ? null : (
        <>
          <MovePad onStep={moveBy} />
          <div className="absolute right-[max(0.8rem,env(safe-area-inset-right))] bottom-[max(0.8rem,env(safe-area-inset-bottom))] z-20 flex items-end gap-2">
            <FightButton
              label="Bloqueo"
              held={blocking}
              onPointerDown={() => holdBlock(true)}
              onPointerUp={() => holdBlock(false)}
            />
            <FightButton label="Golpe" accent disabled={busy} onClick={onAttack} />
            <FightButton label="Especial" accent={ready} disabled={!ready || busy} onClick={onSuper} />
          </div>
        </>
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
          onExit={() => clearBattle()}
        />
      ) : null}
    </div>
  );
}

function MovePad({ onStep }: { onStep: (delta: number) => void }) {
  const last = useRef<number | null>(null);
  const moved = useRef(0);

  return (
    <div
      className="absolute bottom-[max(0.8rem,env(safe-area-inset-bottom))] left-[max(0.8rem,env(safe-area-inset-left))] z-20 grid h-28 w-40 touch-none grid-cols-2 overflow-hidden rounded-full border border-white/20 bg-black/45 text-[11px] font-extrabold uppercase tracking-wide text-white select-none"
      onPointerDown={(event) => {
        last.current = event.clientX;
        moved.current = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (last.current === null) return;
        const delta = event.clientX - last.current;
        moved.current += Math.abs(delta);
        last.current = event.clientX;
        if (Math.abs(delta) > 1) onStep(delta * 0.09);
      }}
      onPointerUp={(event) => {
        if (moved.current < 10) {
          const bounds = event.currentTarget.getBoundingClientRect();
          const forward = event.clientX > bounds.left + bounds.width / 2;
          onStep(forward ? 8 : -8);
        }
        last.current = null;
      }}
      onPointerCancel={() => {
        last.current = null;
      }}
    >
      <span className="grid place-items-center border-r border-white/15">Atrás</span>
      <span className="grid place-items-center">Adelante</span>
    </div>
  );
}

function FightButton({
  label,
  onClick,
  onPointerDown,
  onPointerUp,
  disabled = false,
  accent = false,
  held = false,
}: {
  label: string;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  disabled?: boolean;
  accent?: boolean;
  held?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onPointerDown={(event) => {
        if (disabled || !onPointerDown) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        onPointerDown();
      }}
      onPointerUp={() => onPointerUp?.()}
      onPointerCancel={() => onPointerUp?.()}
      className={`grid h-20 w-20 place-items-center rounded-full border-b-4 font-display text-sm leading-none touch-none select-none disabled:opacity-40 ${
        accent
          ? "border-[oklch(0.58_0.15_138)] bg-accent text-accent-ink"
          : "border-white/20 bg-black/55 text-white"
      } ${held ? "translate-y-1 border-b-0" : ""}`}
    >
      {label}
    </button>
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{label}</p>
      <h2 className="font-display text-lg leading-none text-white">{plant.name}</h2>
      <div className="mt-1">
        <HpBar hp={hp} max={plant.hp} mirror={mirror} />
      </div>
    </div>
  );
}

function RingFighter({
  side,
  x,
  plant,
  anim,
  floaters,
}: {
  side: "left" | "right";
  x: number;
  plant: SpritePlant;
  anim: SpriteAnim;
  floaters: Floater[];
}) {
  return (
    <div
      className="ring-actor absolute bottom-[14%] z-10"
      style={{ left: `${x}%` }}
      data-side={side}
      data-anim={anim}
    >
      {floaters.map((floater) => (
        <DamageFloater key={floater.id} amount={floater.amount} blocked={floater.blocked} />
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
