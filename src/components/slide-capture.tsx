"use client";

import { toSvg } from "html-to-image";

export async function capturePhoneSlide() {
  if (!window.matchMedia("(min-width: 840px)").matches) return;
  const phone = document.querySelector(".phone");
  if (!(phone instanceof HTMLElement)) return;
  const restore = freezeVideos(phone);
  try {
    const blob = await toSvg(phone, {
      skipFonts: true,
      onImageErrorHandler: () => undefined,
    }).then((svg) => svgToPng(svg, phone.offsetWidth, phone.offsetHeight));
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {
      // La descarga igual deja la imagen para la diapositiva.
    }
    downloadPng(blob);
  } finally {
    restore();
  }
}

function freezeVideos(root: HTMLElement) {
  const restores: Array<() => void> = [];
  for (const video of root.querySelectorAll("video")) {
    if (video.dataset.slideSkip != null || !video.videoWidth || !video.videoHeight) continue;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    let frame = "";
    try {
      frame = canvas.toDataURL("image/jpeg", 0.8);
    } catch {
      continue;
    }
    const parent = video.parentElement;
    if (!parent) continue;
    const img = document.createElement("img");
    img.src = frame;
    img.alt = "";
    img.className = "pointer-events-none absolute inset-0 z-10 size-full object-cover";
    const next = video.nextSibling;
    parent.removeChild(video);
    parent.appendChild(img);
    restores.push(() => {
      img.remove();
      if (next) parent.insertBefore(video, next);
      else parent.appendChild(video);
    });
  }
  for (const canvas of root.querySelectorAll("canvas")) {
    if (!canvas.width || !canvas.height) continue;
    let frame = "";
    try {
      frame = canvas.toDataURL("image/jpeg", 0.8);
    } catch {
      continue;
    }
    const parent = canvas.parentElement;
    if (!parent) continue;
    const img = document.createElement("img");
    img.src = frame;
    img.alt = "";
    img.className = "pointer-events-none absolute inset-0 z-10 size-full object-cover";
    parent.appendChild(img);
    const previous = canvas.style.visibility;
    canvas.style.visibility = "hidden";
    restores.push(() => {
      img.remove();
      canvas.style.visibility = previous;
    });
  }
  return () => {
    for (const restore of restores) restore();
  };
}

function svgToPng(svg: string, width: number, height: number) {
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error("tiempo")), 8000);
    image.onload = () => {
      const ratio = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const context = canvas.getContext("2d");
      if (!context) {
        window.clearTimeout(timer);
        reject(new Error("canvas"));
        return;
      }
      context.scale(ratio, ratio);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        window.clearTimeout(timer);
        if (blob) resolve(blob);
        else reject(new Error("blob"));
      }, "image/png");
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("imagen"));
    };
    image.src = svg;
  });
}

function downloadPng(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sprout-wars-captura.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
