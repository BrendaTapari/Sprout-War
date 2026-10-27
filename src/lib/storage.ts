import { isPhotoExpired, PHOTO_CYCLE_MS } from "@/lib/photo-cycle";
import type { PlantStats } from "@/lib/analyze-plant";
import { BLUE_FIGHTER, ENEMY_ID, isSpriteId } from "@/lib/sprites";
import type { Account, BattleSession, OwnedFighter, Roster, SpriteId } from "@/lib/types";

const ROSTER_KEY = "sprout-wars:roster";
const BATTLE_KEY = "sprout-wars:battle";
const ACCOUNT_KEY = "sprout-wars:account";

export const EMPTY_ACCOUNT: Account = { name: "", email: "", photo: null };

export const MOCK_ACCOUNT = {
  name: "Juan Plantín",
  email: "juan.plantin@sproutwars.com",
};

export const STORE_EVENT = "sprout-wars";

export const EMPTY_ROSTER: Roster = { fighters: [], activeId: null };

function emit() {
  window.dispatchEvent(new Event(STORE_EVENT));
}

let rosterRaw: string | null | undefined;
let rosterCache: Roster = EMPTY_ROSTER;

let battleRaw: string | null | undefined;
let battleCache: BattleSession | null = null;

function isPhoto(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("data:image/") || value.startsWith("/sprites/"))
  );
}

function parseRoster(raw: string | null): Roster {
  if (!raw) return EMPTY_ROSTER;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY_ROSTER;
    const record = value as Roster;
    if (!Array.isArray(record.fighters)) return EMPTY_ROSTER;
    const fighters: OwnedFighter[] = [];
    for (const item of record.fighters) {
      if (!item || typeof item !== "object") continue;
      const fighter = item as OwnedFighter;
      if (!isSpriteId(fighter.spriteId) || !isPhoto(fighter.photo)) continue;
      if (fighters.some((owned) => owned.spriteId === fighter.spriteId)) continue;
      const addedAt = typeof fighter.addedAt === "number" ? fighter.addedAt : Date.now();
      const stamped = fighter as OwnedFighter & { photoAt?: unknown };
      const tint = finite(fighter.tint, 0, 360);
      const hp = finite(fighter.hp, 80, 160);
      const attack = finite(fighter.attack, 10, 40);
      const defense = finite(fighter.defense, 4, 40);
      fighters.push({
        spriteId: fighter.spriteId,
        photo: fighter.photo,
        addedAt,
        photoAt: typeof stamped.photoAt === "number" ? stamped.photoAt : addedAt,
        ...(typeof fighter.name === "string" ? { name: fighter.name.slice(0, 40) } : {}),
        ...(typeof fighter.epithet === "string" ? { epithet: fighter.epithet.slice(0, 40) } : {}),
        ...(tint === undefined ? {} : { tint }),
        ...(hp === undefined ? {} : { hp }),
        ...(attack === undefined ? {} : { attack }),
        ...(defense === undefined ? {} : { defense }),
      });
    }
    const activeId =
      isSpriteId(record.activeId) &&
      fighters.some((fighter) => fighter.spriteId === record.activeId)
        ? record.activeId
        : (fighters[0]?.spriteId ?? null);
    return { fighters, activeId };
  } catch {
    return EMPTY_ROSTER;
  }
}

export function loadRoster(): Roster {
  if (typeof window === "undefined") return EMPTY_ROSTER;
  const raw = localStorage.getItem(ROSTER_KEY);
  if (raw === rosterRaw) return rosterCache;
  rosterRaw = raw;
  rosterCache = parseRoster(raw);
  return rosterCache;
}

function writeRoster(roster: Roster) {
  const raw = JSON.stringify(roster);
  localStorage.setItem(ROSTER_KEY, raw);
  rosterRaw = raw;
  rosterCache = roster;
  emit();
}

function finite(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, value));
}

export function addNamedFighter(photo: string, name: string, stats: PlantStats) {
  const current = loadRoster();
  const now = Date.now();
  const spriteId = `sprout-${now.toString(36)}` as SpriteId;
  const trimmed = name.trim().slice(0, 24);
  if (!trimmed) return;
  writeRoster({
    fighters: [
      ...current.fighters,
      {
        spriteId,
        photo,
        addedAt: now,
        photoAt: now,
        tint: BLUE_FIGHTER.tint,
        name: trimmed,
        epithet: BLUE_FIGHTER.epithet,
        hp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
      },
    ],
    activeId: current.activeId ?? spriteId,
  });
}

export function removeFighter(spriteId: SpriteId) {
  const current = loadRoster();
  const fighters = current.fighters.filter((fighter) => fighter.spriteId !== spriteId);
  const now = Date.now();
  const keptActive = fighters.some((fighter) => fighter.spriteId === current.activeId);
  const ready = fighters.find((fighter) => !isPhotoExpired(fighter.photoAt, now));
  writeRoster({
    fighters,
    activeId: keptActive ? current.activeId : (ready?.spriteId ?? fighters[0]?.spriteId ?? null),
  });
}

export function addFighter(spriteId: SpriteId, photo: string) {
  if (spriteId === ENEMY_ID) return;
  const current = loadRoster();
  if (current.fighters.some((fighter) => fighter.spriteId === spriteId)) return;
  const now = Date.now();
  const fighters = [
    ...current.fighters,
    { spriteId, photo, addedAt: now, photoAt: now },
  ];
  writeRoster({
    fighters,
    activeId: current.activeId ?? spriteId,
  });
}

export function updatePhoto(spriteId: SpriteId, photo: string) {
  const current = loadRoster();
  const fighters = current.fighters.map((fighter) =>
    fighter.spriteId === spriteId ? { ...fighter, photo, photoAt: Date.now() } : fighter,
  );
  writeRoster({ ...current, fighters });
}

function seedRoster() {
  const now = Date.now();
  const expiredAt = now - PHOTO_CYCLE_MS - 24 * 60 * 60 * 1000;
  writeRoster({
    activeId: "original",
    fighters: [
      {
        spriteId: "original",
        photo: "/sprites/original-idle.png",
        addedAt: now,
        photoAt: now,
      },
      {
        spriteId: "white",
        photo: "/sprites/white-idle.png",
        addedAt: expiredAt,
        photoAt: expiredAt,
      },
    ],
  });
}

export function ensureRosterDefaults() {
  if (localStorage.getItem(ROSTER_KEY) === null) {
    seedRoster();
    return;
  }
  const current = loadRoster();
  const fighters = current.fighters.filter((fighter) => fighter.spriteId !== ENEMY_ID);
  const removedEnemy = fighters.length !== current.fighters.length;
  let changed = removedEnemy;
  const now = Date.now();
  for (const fighter of fighters) {
    if (fighter.spriteId === "original" && fighter.photoAt < fighter.addedAt) {
      fighter.photoAt = fighter.addedAt;
      changed = true;
    }
  }
  const currentActive = fighters.find((fighter) => fighter.spriteId === current.activeId);
  const ready = fighters.find((fighter) => !isPhotoExpired(fighter.photoAt, now));
  const activeId =
    currentActive && !isPhotoExpired(currentActive.photoAt, now)
      ? currentActive.spriteId
      : (ready?.spriteId ?? currentActive?.spriteId ?? fighters[0]?.spriteId ?? null);
  if (!changed && activeId === current.activeId) return;
  writeRoster({ fighters, activeId });
}

export function setActiveFighter(spriteId: SpriteId) {
  const current = loadRoster();
  if (!current.fighters.some((fighter) => fighter.spriteId === spriteId)) return;
  writeRoster({ ...current, activeId: spriteId });
}

function parseBattle(raw: string | null): BattleSession | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const session = value as BattleSession;
    if (!isSpriteId(session.playerId) || !isSpriteId(session.enemyId)) return null;
    if (session.playerId === session.enemyId) return null;
    if (typeof session.id !== "string") return null;
    return {
      id: session.id,
      playerId: session.playerId,
      enemyId: session.enemyId,
      createdAt: typeof session.createdAt === "number" ? session.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function loadBattle(): BattleSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BATTLE_KEY);
  if (raw === battleRaw) return battleCache;
  battleRaw = raw;
  battleCache = parseBattle(raw);
  return battleCache;
}

export function saveBattle(session: BattleSession) {
  const raw = JSON.stringify(session);
  sessionStorage.setItem(BATTLE_KEY, raw);
  battleRaw = raw;
  battleCache = session;
  emit();
}

export function clearBattle() {
  sessionStorage.removeItem(BATTLE_KEY);
  battleRaw = null;
  battleCache = null;
  emit();
}

let accountRaw: string | null | undefined;
let accountCache: Account = EMPTY_ACCOUNT;

function parseAccount(raw: string | null): Account {
  if (!raw) return EMPTY_ACCOUNT;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY_ACCOUNT;
    const account = value as Account;
    const photo =
      typeof account.photo === "string" && account.photo.startsWith("data:image/")
        ? account.photo
        : null;
    return {
      name: typeof account.name === "string" ? account.name.slice(0, 40) : "",
      email: typeof account.email === "string" ? account.email.slice(0, 80) : "",
      photo,
    };
  } catch {
    return EMPTY_ACCOUNT;
  }
}

export function loadAccount(): Account {
  if (typeof window === "undefined") return EMPTY_ACCOUNT;
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (raw === accountRaw) return accountCache;
  accountRaw = raw;
  accountCache = parseAccount(raw);
  return accountCache;
}

export function ensureAccountDefaults() {
  const current = loadAccount();
  const empty = !current.name.trim() && !current.email.trim();
  const leftoverTest = current.email === "jugadora@sproutwars.test";
  if (!empty && !leftoverTest) return;
  saveAccount({
    name: MOCK_ACCOUNT.name,
    email: MOCK_ACCOUNT.email,
    photo: current.photo,
  });
}

export function saveAccount(account: Account) {
  const next = parseAccount(JSON.stringify(account));
  const raw = JSON.stringify(next);
  localStorage.setItem(ACCOUNT_KEY, raw);
  accountRaw = raw;
  accountCache = next;
  emit();
}
