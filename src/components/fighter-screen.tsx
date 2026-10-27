"use client";

import { useState } from "react";
import { ActionDock } from "@/components/action-dock";
import { CameraCapture } from "@/components/camera-capture";
import { PlantSprite } from "@/components/plant-sprite";
import { PhotoCountdown, usePhotoClock } from "@/components/photo-countdown";
import { PrimaryButton, ghostButtonClass } from "@/components/primary-button";
import { ScreenHeader } from "@/components/screen-header";
import { useHydrated, useRoster } from "@/hooks/use-sprout-store";
import { isPhotoExpired } from "@/lib/photo-cycle";
import { getSprite, nextLocked, playerPlants } from "@/lib/sprites";
import { addFighter, setActiveFighter, updatePhoto } from "@/lib/storage";
import type { SpriteId } from "@/lib/types";

const pageClass =
  "px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(13rem+env(safe-area-inset-bottom))]";

export function FighterScreen() {
  const hydrated = useHydrated();
  const roster = useRoster();
  const now = usePhotoClock(hydrated);
  const [cameraFor, setCameraFor] = useState<SpriteId | null>(null);
  const upcoming = nextLocked(roster.fighters.map((fighter) => fighter.spriteId));
  const activeFighter = roster.fighters.find((fighter) => fighter.spriteId === roster.activeId);
  const activeDue = Boolean(activeFighter && now > 0 && isPhotoExpired(activeFighter.photoAt, now));

  function onCapture(photo: string) {
    if (!cameraFor) return;
    const owned = roster.fighters.some((fighter) => fighter.spriteId === cameraFor);
    if (owned) updatePhoto(cameraFor, photo);
    else addFighter(cameraFor, photo);
    setCameraFor(null);
  }

  return (
    <>
      <main className={pageClass}>
        <ScreenHeader
          eyebrow="Vestuario"
          title="Mis luchadores"
        />
        {!hydrated ? (
          <div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/10" />
        ) : (
          <ul className="mt-6 space-y-3">
            {playerPlants().map((sprite) => {
              const owned = roster.fighters.find((fighter) => fighter.spriteId === sprite.id);
              const active = roster.activeId === sprite.id;
              return (
                <li
                  key={sprite.id}
                  className={`rounded-[1.5rem] border bg-card p-3 ${
                    active ? "border-accent/60" : "border-line"
                  }`}
                >
                  {owned ? (
                    <>
                      <div className="flex gap-2">
                        <PlantSprite spriteId={sprite.id} anim="idle" label={sprite.name} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                            {active ? "En el ring" : sprite.epithet}
                          </p>
                          <h2 className="mt-1 font-display text-2xl leading-none">{sprite.name}</h2>
                          <p className="mt-2 text-xs text-muted">
                            Vida {sprite.hp} · Ataque {sprite.attack} · Defensa {sprite.defense}
                          </p>
                          {owned.photo.startsWith("data:") ? (
                            <PlantPhoto src={owned.photo} name={sprite.name} />
                          ) : null}
                        </div>
                      </div>
                      <PhotoCountdown photoAt={owned.photoAt} />
                      {now > 0 && isPhotoExpired(owned.photoAt, now) && !active ? (
                        <button
                          type="button"
                          onClick={() => setCameraFor(sprite.id)}
                          className="mt-3 h-10 w-full rounded-xl bg-danger text-sm font-semibold text-white"
                        >
                          Subir foto
                        </button>
                      ) : active ? null : (
                        <button
                          type="button"
                          onClick={() => setActiveFighter(sprite.id)}
                          className="mt-3 h-10 w-full rounded-xl bg-white/10 text-sm font-medium"
                        >
                          Elegir
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="px-1 py-2">
                      <div className="flex items-center gap-3">
                        <div className="grid size-16 place-items-center rounded-2xl bg-white/5 text-2xl text-muted">
                          +
                        </div>
                        <div>
                          <h2 className="font-display text-2xl leading-none text-muted">
                            {sprite.name}
                          </h2>
                          <p className="mt-1 text-sm text-muted">Todavía sin foto</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCameraFor(sprite.id)}
                        className={`${ghostButtonClass} mt-3`}
                      >
                        Agregar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {upcoming ? (
          <p className="mt-4 text-center text-sm text-muted">
            Podés sumar a {getSprite(upcoming.id).name} con la cámara.
          </p>
        ) : null}
        <ActionDock>
          <div className="grid gap-2">
            {activeDue ? (
              <PrimaryButton
                onClick={() => {
                  if (roster.activeId) setCameraFor(roster.activeId);
                }}
              >
                Subir foto
              </PrimaryButton>
            ) : roster.activeId ? (
              <button
                type="button"
                onClick={() => {
                  if (roster.activeId) setCameraFor(roster.activeId);
                }}
                className={ghostButtonClass}
              >
                Actualizar foto
              </button>
            ) : null}
            {upcoming ? (
              activeDue ? (
                <button
                  type="button"
                  onClick={() => setCameraFor(upcoming.id)}
                  className={ghostButtonClass}
                >
                  Agregar {getSprite(upcoming.id).name}
                </button>
              ) : (
                <PrimaryButton onClick={() => setCameraFor(upcoming.id)}>
                  Agregar {getSprite(upcoming.id).name}
                </PrimaryButton>
              )
            ) : null}
          </div>
        </ActionDock>
      </main>
      {cameraFor ? (
        <CameraCapture
          title={
            cameraFor && roster.fighters.some((fighter) => fighter.spriteId === cameraFor)
              ? "Actualizar foto"
              : "Agregar planta"
          }
          onCapture={onCapture}
          onClose={() => setCameraFor(null)}
        />
      ) : null}
    </>
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
