export type BuiltinSpriteId = "original" | "red" | "white";

export type SpriteId = BuiltinSpriteId | `sprout-${string}`;

export type SpriteAnim = "idle" | "attack" | "hurt" | "block" | "death";

export type SpritePlant = {
  id: SpriteId;
  name: string;
  epithet: string;
  bio: string;
  hp: number;
  attack: number;
  defense: number;
  sheet: BuiltinSpriteId;
  hue: number;
};

export type OwnedFighter = {
  spriteId: SpriteId;
  photo: string;
  addedAt: number;
  photoAt: number;
  tint?: number;
  name?: string;
  epithet?: string;
  hp?: number;
  attack?: number;
  defense?: number;
};

export type Roster = {
  fighters: OwnedFighter[];
  activeId: SpriteId | null;
};

export type BattleSession = {
  id: string;
  playerId: SpriteId;
  enemyId: SpriteId;
  createdAt: number;
};

export type Account = {
  name: string;
  email: string;
  photo: string | null;
};
