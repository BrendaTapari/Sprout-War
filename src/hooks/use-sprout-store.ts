"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_ACCOUNT, EMPTY_ROSTER, STORE_EVENT, loadAccount, loadBattle, loadRoster } from "@/lib/storage";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function emptyBattle() {
  return null;
}

function subscribeHydration() {
  return () => {};
}

function hydratedSnapshot() {
  return true;
}

function serverHydrationSnapshot() {
  return false;
}

function serverRoster() {
  return EMPTY_ROSTER;
}

function serverAccount() {
  return EMPTY_ACCOUNT;
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    hydratedSnapshot,
    serverHydrationSnapshot,
  );
}

export function useRoster() {
  return useSyncExternalStore(subscribe, loadRoster, serverRoster);
}

export function useBattleSession() {
  return useSyncExternalStore(subscribe, loadBattle, emptyBattle);
}

export function useAccount() {
  return useSyncExternalStore(subscribe, loadAccount, serverAccount);
}
