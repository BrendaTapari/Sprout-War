import type { SpriteAnim, SpriteId, SpritePlant } from "@/lib/types";

export const SPRITES: SpritePlant[] = [
  {
    id: "original",
    name: "Carnívora Verde",
    epithet: "Hoja original",
    bio: "La del invernadero. Muerde parejo y se queda en el round.",
    hp: 110,
    attack: 26,
    defense: 16,
  },
  {
    id: "red",
    name: "Carnívora Roja",
    epithet: "Savía caliente",
    bio: "Abre la boca primero. Pega fuerte y aguanta poco.",
    hp: 88,
    attack: 34,
    defense: 8,
  },
  {
    id: "white",
    name: "Carnívora Blanca",
    epithet: "Pétalo duro",
    bio: "Lenta y pálida. Sacarla del tiesto cuesta varios mordiscos.",
    hp: 130,
    attack: 20,
    defense: 26,
  },
];

export function isSpriteId(value: unknown): value is SpriteId {
  return value === "original" || value === "red" || value === "white";
}

export function getSprite(id: SpriteId): SpritePlant {
  const sprite = SPRITES.find((plant) => plant.id === id);
  return sprite ?? SPRITES[0];
}

export function sheetUrl(id: SpriteId, anim: SpriteAnim) {
  return `/sprites/${id}-${anim}.png`;
}

export const ENEMY_ID: SpriteId = "red";

export function playerPlants() {
  return SPRITES.filter((plant) => plant.id !== ENEMY_ID);
}

export function nextLocked(owned: SpriteId[]): SpritePlant | null {
  return playerPlants().find((plant) => !owned.includes(plant.id)) ?? null;
}
