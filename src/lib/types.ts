export type SpriteId = "original" | "red" | "white";

export type SpriteAnim = "idle" | "attack" | "hurt" | "block" | "death";

export type SpritePlant = {
  id: SpriteId;
  name: string;
  epithet: string;
  bio: string;
  hp: number;
  attack: number;
  defense: number;
};

export type OwnedFighter = {
  spriteId: SpriteId;
  photo: string;
  addedAt: number;
  photoAt: number;
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
