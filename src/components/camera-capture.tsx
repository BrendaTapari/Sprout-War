"use client";

import { useEffect, useRef, useState } from "react";
import { capturePhoneSlide } from "@/components/slide-capture";

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
  const previewRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function openCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este navegador no puede abrir la cámara.");
        return;
      }
      setReady(false);
      const attempts: MediaStreamConstraints[] = deviceId
        ? [{ audio: false, video: { deviceId: { exact: deviceId } } }]
        : [
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
          stopStream(streamRef.current);
          streamRef.current = stream;
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = stream;
          await video.play();
          const listed = await navigator.mediaDevices.enumerateDevices();
          if (!cancelled) {
            setDevices(listed.filter((item) => item.kind === "videoinput" && item.deviceId));
            setReady(true);
            setError(null);
          }
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
  }, [deviceId]);

  useEffect(() => {
    if (!ready) return;
    let frameId = 0;
    const draw = () => {
      const video = videoRef.current;
      const preview = previewRef.current;
      if (video && preview && video.videoWidth) {
        const box = preview.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.round(box.width * ratio));
        const height = Math.max(1, Math.round(box.height * ratio));
        if (preview.width !== width || preview.height !== height) {
          preview.width = width;
          preview.height = height;
        }
        const context = preview.getContext("2d");
        const frame = frameForBox(video, width / height);
        if (context && frame) {
          context.drawImage(video, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, width, height);
        }
      }
      frameId = window.requestAnimationFrame(draw);
    };
    frameId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frameId);
  }, [ready, deviceId]);

  async function shoot() {
    const video = videoRef.current;
    const preview = previewRef.current;
    if (!video || !video.videoWidth || shooting) return;
    const box = preview?.getBoundingClientRect();
    const boxRatio = box && box.height > 0 ? box.width / box.height : 3 / 4;
    const frame = frameForBox(video, boxRatio);
    if (!frame) return;
    const width = 480;
    const height = Math.max(1, Math.round(width / boxRatio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, width, height);
    const photo = canvas.toDataURL("image/jpeg", 0.72);
    setShooting(true);
    try {
      await capturePhoneSlide();
    } catch {
      // La foto de la planta sigue aunque falle la captura de la diapositiva.
    }
    onCapture(photo);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[430px] flex-col">
        <div className="flex items-center justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <p className="font-display text-2xl text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-white"
            aria-label="Cerrar cámara"
          >
            ×
          </button>
        </div>
        {devices.length > 1 ? (
          <label className="mx-5 mt-3 block text-xs font-semibold text-white/70">
            Cámara
            <select
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-black px-3 text-sm text-white"
            >
              <option value="">La que está usando ahora</option>
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Cámara ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="relative mx-3 mt-3 min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-black">
          <video
            ref={videoRef}
            className="pointer-events-none absolute inset-0 size-full opacity-0"
            data-slide-skip=""
            playsInline
            muted
            autoPlay
          />
          <canvas ref={previewRef} className="absolute inset-0 size-full" />
          {error ? (
            <p className="absolute inset-0 flex items-center px-6 text-center text-sm leading-relaxed text-white">
              {error}
            </p>
          ) : null}
        </div>
        <p className="px-5 pt-2 text-center text-xs text-white/60">
          Encuadrá una planta. El botón blanco guarda la pantalla.
        </p>
        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void shoot()}
            disabled={!ready || shooting}
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

function frameForBox(video: HTMLVideoElement, boxRatio: number) {
  const bounds = contentBounds(video) ?? {
    sx: 0,
    sy: 0,
    sw: video.videoWidth,
    sh: video.videoHeight,
  };
  const ratio = bounds.sw / bounds.sh;
  if (ratio > boxRatio) {
    const sw = bounds.sh * boxRatio;
    return { sx: bounds.sx + (bounds.sw - sw) / 2, sy: bounds.sy, sw, sh: bounds.sh };
  }
  const sh = bounds.sw / boxRatio;
  return { sx: bounds.sx, sy: bounds.sy + (bounds.sh - sh) / 2, sw: bounds.sw, sh };
}

function contentBounds(video: HTMLVideoElement) {
  const width = 80;
  const height = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * width));
  const sample = document.createElement("canvas");
  sample.width = width;
  sample.height = height;
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const dark = (index: number) =>
    pixels[index] < 22 && pixels[index + 1] < 22 && pixels[index + 2] < 22;
  const rowDark = (y: number) => {
    for (let x = 0; x < width; x += 1) if (!dark((y * width + x) * 4)) return false;
    return true;
  };
  const columnDark = (x: number) => {
    for (let y = 0; y < height; y += 1) if (!dark((y * width + x) * 4)) return false;
    return true;
  };
  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;
  while (top < bottom && rowDark(top)) top += 1;
  while (bottom > top && rowDark(bottom)) bottom -= 1;
  while (left < right && columnDark(left)) left += 1;
  while (right > left && columnDark(right)) right -= 1;
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  if (cropWidth < width * 0.12 || cropHeight < height * 0.12) return null;
  if (cropWidth > width * 0.94 && cropHeight > height * 0.94) return null;
  return {
    sx: (left / width) * video.videoWidth,
    sy: (top / height) * video.videoHeight,
    sw: (cropWidth / width) * video.videoWidth,
    sh: (cropHeight / height) * video.videoHeight,
  };
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
