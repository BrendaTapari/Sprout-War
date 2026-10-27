export const PHOTO_CYCLE_DAYS = 15;
export const PHOTO_CYCLE_MS = PHOTO_CYCLE_DAYS * 24 * 60 * 60 * 1000;

export function photoRemaining(photoAt: number, now: number) {
  return Math.max(0, photoAt + PHOTO_CYCLE_MS - now);
}

export function isPhotoExpired(photoAt: number, now: number) {
  return photoRemaining(photoAt, now) === 0;
}

export function formatPhotoCountdown(ms: number) {
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return days === 1 ? "1 día" : `${days} días`;
}
