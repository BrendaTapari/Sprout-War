"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionDock } from "@/components/action-dock";
import { CameraCapture } from "@/components/camera-capture";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenHeader } from "@/components/screen-header";
import { useAccount } from "@/hooks/use-sprout-store";
import { MOCK_ACCOUNT, saveAccount } from "@/lib/storage";
import type { Account } from "@/lib/types";

const MOCK_PROFILE = "/avatar/foto%20galo.jpeg";

const INITIAL_DRAFT: Account = {
  name: MOCK_ACCOUNT.name,
  email: MOCK_ACCOUNT.email,
  photo: null,
};

function shownPhoto(photo: string | null) {
  return photo || MOCK_PROFILE;
}

export function AccountNavLink() {
  const pathname = usePathname();
  const account = useAccount();
  const active = pathname.startsWith("/cuenta");

  return (
    <Link
      href="/cuenta"
      aria-current={active ? "page" : undefined}
      className={`mx-1 flex h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-extrabold tracking-wide ${
        active ? "bg-accent/20 text-accent" : "text-muted"
      }`}
    >
      <span className="size-5 overflow-hidden rounded-full bg-white/10">
        <ProfilePhoto src={shownPhoto(account.photo)} alt="" />
      </span>
      Cuenta
    </Link>
  );
}

export function AccountScreen() {
  const account = useAccount();
  const [draft, setDraft] = useState<Account>(INITIAL_DRAFT);
  const [camera, setCamera] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    setDraft({
      name: account.name.trim() || MOCK_ACCOUNT.name,
      email: account.email.trim() || MOCK_ACCOUNT.email,
      photo: account.photo,
    });
  }, [account, touched]);

  function save() {
    const email = draft.email.trim();
    if (email && !email.includes("@")) {
      setSaved(false);
      setError("El mail tiene que incluir @.");
      return;
    }
    saveAccount({ name: draft.name.trim(), email, photo: draft.photo });
    setError("");
    setSaved(true);
  }

  return (
    <>
      <main className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(8.75rem+env(safe-area-inset-bottom))]">
        <ScreenHeader
          eyebrow="Perfil"
          title="Cuenta"
          subtitle="Los datos del jugador de la demo."
        />
        <section className="mt-8 flex flex-col items-center rounded-[1.75rem] border border-line bg-card px-5 py-8">
          <div className="size-32 overflow-hidden rounded-full border border-accent/40">
            <ProfilePhoto src={shownPhoto(draft.photo)} alt="Foto de perfil" priority />
          </div>
          <button
            type="button"
            onClick={() => setCamera(true)}
            className="mt-4 text-sm font-medium text-accent"
          >
            Cambiar foto de perfil
          </button>
          <h2 className="mt-6 font-display text-4xl leading-none">
            {draft.name || MOCK_ACCOUNT.name}
          </h2>
          <p className="mt-2 text-sm text-muted">{draft.email || MOCK_ACCOUNT.email}</p>
        </section>
        <div className="mt-6 grid gap-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Nombre
            <input
              value={draft.name}
              onChange={(event) => {
                setTouched(true);
                setSaved(false);
                setDraft((current) => ({ ...current, name: event.target.value }));
              }}
              maxLength={40}
              autoComplete="name"
              className="mt-2 h-12 w-full rounded-xl border border-line bg-card px-3 text-base font-normal normal-case tracking-normal text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Mail
            <input
              value={draft.email}
              onChange={(event) => {
                setTouched(true);
                setSaved(false);
                setDraft((current) => ({ ...current, email: event.target.value }));
              }}
              maxLength={80}
              type="email"
              autoComplete="email"
              inputMode="email"
              className="mt-2 h-12 w-full rounded-xl border border-line bg-card px-3 text-base font-normal normal-case tracking-normal text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        {saved ? <p className="mt-3 text-sm text-accent">Datos guardados.</p> : null}
        <ActionDock>
          <PrimaryButton onClick={save}>Guardar</PrimaryButton>
        </ActionDock>
      </main>
      {camera ? (
        <CameraCapture
          title="Foto de perfil"
          onCapture={(photo) => {
            setSaved(false);
            setDraft((current) => ({ ...current, photo }));
            setCamera(false);
          }}
          onClose={() => setCamera(false)}
        />
      ) : null}
    </>
  );
}

function ProfilePhoto({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={512}
        height={512}
        priority={priority}
        className="size-full object-cover object-[center_28%]"
      />
    );
  }
  return (
    // La foto de la cámara llega como data URL. next/image no la admite.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="size-full object-cover" />
  );
}
