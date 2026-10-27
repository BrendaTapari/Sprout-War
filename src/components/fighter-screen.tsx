"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { analyzePlantStats, type PlantStats } from "@/lib/analyze-plant";
import { CameraCapture } from "@/components/camera-capture";
import { PlantSprite } from "@/components/plant-sprite";
import { PhotoCountdown, usePhotoClock } from "@/components/photo-countdown";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenHeader } from "@/components/screen-header";
import { useHydrated, useRoster } from "@/hooks/use-sprout-store";
import { isPhotoExpired } from "@/lib/photo-cycle";
import { BLUE_FIGHTER, plantOf } from "@/lib/sprites";
import { addFighter, addNamedFighter, removeFighter, setActiveFighter, updatePhoto } from "@/lib/storage";
import type { SpriteId } from "@/lib/types";

const pageClass =
  "px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]";

const cardButtonClass =
  "h-11 w-full rounded-xl font-display text-lg leading-none";

type CameraTarget = SpriteId | "new";
type Digitizing = { photo: string; name: string };

const PROCESS_STEPS = [
  { delay: 450, progress: 8, line: "Conectando con el laboratorio" },
  { delay: 1100, progress: 23, line: "Foto recibida" },
  { delay: 1750, progress: 47, line: "Separando la hoja del fondo" },
  { delay: 2500, progress: 69, line: "Leyendo pigmento y textura" },
  { delay: 3300, progress: 88, line: "Calculando vida, ataque y defensa" },
  { delay: 4000, progress: 100, line: "Análisis listo" },
];

export function FighterScreen() {
  const hydrated = useHydrated();
  const roster = useRoster();
  const now = usePhotoClock(hydrated);
  const [cameraFor, setCameraFor] = useState<CameraTarget | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [digitizing, setDigitizing] = useState<Digitizing | null>(null);
  const fighters = roster.fighters.filter((fighter) => fighter.spriteId !== "red");

  function finishDigitizing(stats: PlantStats) {
    if (!digitizing) return;
    addNamedFighter(digitizing.photo, digitizing.name, stats);
    setDigitizing(null);
  }

  function onCapture(photo: string) {
    if (!cameraFor) return;
    if (cameraFor === "new") {
      setCameraFor(null);
      setName("");
      setPendingPhoto(photo);
      return;
    }
    const owned = roster.fighters.some((fighter) => fighter.spriteId === cameraFor);
    if (owned) updatePhoto(cameraFor, photo);
    else addFighter(cameraFor, photo);
    setCameraFor(null);
  }

  function startDigitizing() {
    const trimmed = name.trim();
    if (!pendingPhoto || !trimmed) return;
    setDigitizing({ photo: pendingPhoto, name: trimmed.slice(0, 24) });
    setPendingPhoto(null);
    setName("");
  }

  return (
    <>
      <main className={pageClass}>
        <ScreenHeader eyebrow="Vestuario" title="Mis luchadores" />
        {!hydrated ? (
          <div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/10" />
        ) : (
          <ul className="mt-6 space-y-3">
            {fighters.map((owned) => {
              const plant = plantOf(owned);
              const active = roster.activeId === owned.spriteId;
              const expired = now > 0 && isPhotoExpired(owned.photoAt, now);
              return (
                <li
                  key={owned.spriteId}
                  className={`rounded-[1.5rem] border bg-card p-3 ${
                    active ? "border-accent/60" : "border-line"
                  }`}
                >
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      <PlantSprite
                        spriteId={plant.id}
                        anim="idle"
                        label={plant.name}
                        hue={plant.hue}
                        sheet={plant.sheet}
                      />
                      <div className="pointer-events-none absolute inset-x-5 bottom-3 h-3 rounded-full bg-[oklch(0.34_0.06_90)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                        {active ? "En el ring" : plant.epithet}
                      </p>
                      <h2 className="mt-1 font-display text-2xl leading-none">{plant.name}</h2>
                      <p className="mt-2 text-xs text-muted">
                        Vida {plant.hp} · Ataque {plant.attack} · Defensa {plant.defense}
                      </p>
                      {owned.photo.startsWith("data:") ? (
                        <PlantPhoto src={owned.photo} name={plant.name} />
                      ) : null}
                    </div>
                  </div>
                  <PhotoCountdown photoAt={owned.photoAt} />
                  <div className="mt-3 grid gap-2">
                    {active || expired ? null : (
                      <button
                        type="button"
                        onClick={() => setActiveFighter(owned.spriteId)}
                        className={`${cardButtonClass} bg-white/10 text-foreground`}
                      >
                        Elegir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCameraFor(owned.spriteId)}
                      className={
                        expired
                          ? `${cardButtonClass} bg-danger text-white`
                          : `${cardButtonClass} border-2 border-line bg-card text-foreground`
                      }
                    >
                      {expired ? "Subir foto" : "Actualizar foto"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFighter(owned.spriteId)}
                      className="h-10 w-full rounded-xl text-sm font-semibold text-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setCameraFor("new")}
                className="flex min-h-28 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dotted border-muted px-4 py-8 font-display text-2xl leading-none text-foreground"
              >
                Agregar luchador
              </button>
            </li>
          </ul>
        )}
      </main>
      {cameraFor ? (
        <ScreenCover>
          <CameraCapture
            title={cameraFor === "new" ? "Agregar luchador" : "Actualizar foto"}
            onCapture={onCapture}
            onClose={() => setCameraFor(null)}
          />
        </ScreenCover>
      ) : null}
      {pendingPhoto ? (
        <ScreenCover>
          <NameModal
            photo={pendingPhoto}
            name={name}
            onName={setName}
            onClose={() => setPendingPhoto(null)}
            onConfirm={startDigitizing}
          />
        </ScreenCover>
      ) : null}
      {digitizing ? (
        <ScreenCover>
          <DigitizingScreen
            photo={digitizing.photo}
            name={digitizing.name}
            onDone={finishDigitizing}
          />
        </ScreenCover>
      ) : null}
    </>
  );
}

function NameModal({
  photo,
  name,
  onName,
  onClose,
  onConfirm,
}: {
  photo: string;
  name: string;
  onName: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center">
      <form
        className="w-full max-w-[390px] rounded-[1.75rem] border border-line bg-card p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
          Nuevo luchador
        </p>
        <h2 className="mt-1 font-display text-3xl leading-none">Nombre del luchador</h2>
        {/* La foto sale de la cámara como data URL. next/image no la admite. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt="Foto del luchador nuevo"
          className="mt-4 h-28 w-full rounded-2xl object-cover"
        />
        <label className="mt-4 block text-sm text-muted" htmlFor="fighter-name">
          Cómo va a figurar en el vestuario
        </label>
        <input
          id="fighter-name"
          value={name}
          onChange={(event) => onName(event.target.value)}
          maxLength={24}
          autoFocus
          placeholder="Ej: Hoja Brava"
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-black/25 px-4 font-display text-xl outline-none focus:border-accent"
        />
        <div className="mt-4 grid gap-2">
          <PrimaryButton type="submit" disabled={!name.trim()}>
            Digitalizar
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl text-sm font-semibold text-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function ScreenCover({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function DigitizingScreen({
  photo,
  name,
  onDone,
}: {
  photo: string;
  name: string;
  onDone: (stats: PlantStats) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<PlantStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    void analyzePlantStats(photo).then((result) => {
      if (!cancelled) setStats(result);
    });
    for (const step of PROCESS_STEPS) {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setProgress(step.progress);
          setLogs((current) => [...current, step.line]);
          if (step.progress === 100) setReady(true);
        }, step.delay),
      );
    }
    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [photo]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black">
      <div className="flex h-full w-full max-w-[430px] flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
          Laboratorio
        </p>
        <h2 className="mt-1 font-display text-3xl leading-none text-white">
          {ready ? "Análisis listo" : "Digitalizando luchador"}
        </h2>
        <p className="mt-2 text-sm text-white/70">{name}</p>
        {ready && stats ? (
          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <div className="grid place-items-center">
              <PlantSprite
                spriteId="original"
                anim="idle"
                label={name}
                hue={BLUE_FIGHTER.tint}
                sheet="original"
              />
            </div>
            <p className="text-center text-sm text-white/70">Salió de la foto.</p>
            <div className="mt-5 grid gap-4">
              <StatRow label="Vida" value={stats.hp} max={138} />
              <StatRow label="Ataque" value={stats.attack} max={34} />
              <StatRow label="Defensa" value={stats.defense} max={28} />
            </div>
            <div className="mt-auto pt-6">
              <PrimaryButton onClick={() => onDone(stats)}>Sumar al vestuario</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              <span>Procesando</span>
              <span className="tabular-nums text-accent">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-5 flex gap-3">
              {/* La foto sale de la cámara como data URL. next/image no la admite. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <ol className="min-w-0 flex-1 space-y-2 font-mono text-[13px] leading-snug text-white/80">
                {logs.map((line) => (
                  <li key={line}>✓ {line}</li>
                ))}
                {progress < 100 ? <li className="text-accent">…</li> : null}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          {label}
        </span>
        <span className="font-display text-4xl leading-none text-white">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.round((value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function PlantPhoto({ src, name }: { src: string; name: string }) {
  return (
    // La foto sale de la cámara como data URL. next/image no la admite.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Foto de ${name}`}
      className="mt-3 h-14 w-full rounded-xl object-cover"
    />
  );
}
