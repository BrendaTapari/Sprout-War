"use client";

import { useEffect, useRef, useState } from "react";

export function CameraCapture({
  title,
  onCapture,
  onClose,
}: {
  title: string;
  onCapture: (photo: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function openCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este navegador no puede abrir la cámara.");
        return;
      }
      const attempts: MediaStreamConstraints[] = [
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        { audio: false, video: true },
      ];
      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (cancelled) {
            stopStream(stream);
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = stream;
          await video.play();
          setReady(true);
          return;
        } catch {
          if (cancelled) return;
        }
      }
      if (!cancelled) {
        setError("No se pudo abrir la cámara. Habilité el permiso y reintentá.");
      }
    }

    void openCamera();
    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const width = 480;
    const height = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, width, height);
    onCapture(canvas.toDataURL("image/jpeg", 0.72));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[430px] flex-col">
        <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <p className="font-display text-2xl text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-lg text-white"
            aria-label="Cerrar cámara"
          >
            ×
          </button>
        </div>
        <div className="relative mx-5 mt-4 min-h-0 flex-1 overflow-hidden rounded-[1.75rem] bg-zinc-900">
          <video
            ref={videoRef}
            className="size-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {error ? (
            <p className="absolute inset-0 flex items-center px-6 text-center text-sm leading-relaxed text-white">
              {error}
            </p>
          ) : null}
        </div>
        <div className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={shoot}
            disabled={!ready}
            className="mx-auto grid size-20 place-items-center rounded-full border-4 border-white disabled:opacity-40"
            aria-label="Sacar foto"
          >
            <span className="size-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
