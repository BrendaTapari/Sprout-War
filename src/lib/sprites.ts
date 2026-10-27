import type { BuiltinSpriteId, OwnedFighter, SpriteAnim, SpriteId, SpritePlant } from "@/lib/types";

export const SPRITES: SpritePlant[] = [
  {
    id: "original",
    name: "Carnívora Verde",
    epithet: "Hoja original",
    bio: "La del invernadero. Muerde parejo y se queda en el round.",
    hp: 110,
    attack: 26,
    defense: 16,
    sheet: "original",
    hue: 0,
  },
  {
    id: "red",
    name: "Carnívora Roja",
    epithet: "Savía caliente",
    bio: "Abre la boca primero. Pega fuerte y aguanta poco.",
    hp: 88,
    attack: 34,
    defense: 8,
    sheet: "red",
    hue: 0,
  },
  {
    id: "white",
    name: "Carnívora Blanca",
    epithet: "Pétalo duro",
    bio: "Lenta y pálida. Sacarla del tiesto cuesta varios mordiscos.",
    hp: 130,
    attack: 20,
    defense: 26,
    sheet: "white",
    hue: 0,
  },
];

export function isBuiltinSpriteId(value: unknown): value is BuiltinSpriteId {
  return value === "original" || value === "red" || value === "white";
}

export function isSpriteId(value: unknown): value is SpriteId {
  return isBuiltinSpriteId(value) || (typeof value === "string" && /^sprout-[a-z0-9]+$/.test(value));
}

export function getSprite(id: SpriteId): SpritePlant {
  const sprite = SPRITES.find((plant) => plant.id === id);
  if (sprite) return sprite;
  return {
    id,
    name: "Carnívora Nueva",
    epithet: "Hoja nueva",
    bio: "Salió de una foto.",
    hp: 100,
    attack: 22,
    defense: 14,
    sheet: "original",
    hue: 0,
  };
}

export function plantOf(fighter: OwnedFighter): SpritePlant {
  if (isBuiltinSpriteId(fighter.spriteId)) return getSprite(fighter.spriteId);
  return {
    id: fighter.spriteId,
    name: fighter.name || "Carnívora Nueva",
    epithet: fighter.epithet || "Hoja nueva",
    bio: "Salió de una foto.",
    hp: fighter.hp ?? 100,
    attack: fighter.attack ?? 22,
    defense: fighter.defense ?? 14,
    sheet: "original",
    hue: fighter.tint ?? 0,
  };
}

export function sheetUrl(id: BuiltinSpriteId, anim: SpriteAnim) {
  return `/sprites/${id}-${anim}.png`;
}

export const ENEMY_ID: SpriteId = "red";

export const BLUE_FIGHTER = {
  tint: 102,
  epithet: "Carnívora azul",
  hp: 108,
  attack: 24,
  defense: 18,
};

export function playerPlants() {
  return SPRITES.filter((plant) => plant.id !== ENEMY_ID);
}

export function nextLocked(owned: SpriteId[]): SpritePlant | null {
  return playerPlants().find((plant) => !owned.includes(plant.id)) ?? null;
}
