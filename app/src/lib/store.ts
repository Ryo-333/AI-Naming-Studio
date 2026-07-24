"use client";

import { useCallback, useEffect, useState } from "react";
import type { Collection, GeneratedName, SavedName } from "./types";
import { getSupabase } from "./supabase";

const KEY = "ans.collections.v1";

function load(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Collection[];
  } catch {
    // corrupted storage — start fresh
  }
  return [{ id: "default", title: "My Favorites", names: [] }];
}

function persist(cols: Collection[]) {
  localStorage.setItem(KEY, JSON.stringify(cols));
  window.dispatchEvent(new Event("ans:collections"));
  schedulePush();
}

// ---------- cloud sync (Supabase, optional) ----------
// Local-first: localStorage is the source of truth for the running client.
// When signed in, changes are pushed (debounced) and sign-in triggers a
// pull-and-merge. Known MVP limitation: deletions can resurrect on merge
// from a device that still holds the old copy.

let pushTimer: ReturnType<typeof setTimeout> | undefined;
let autoSynced = false;

export type SyncState = "off" | "signed-out" | "syncing" | "synced" | "error";
let syncState: SyncState = "off";
let syncDetail = "";

function setSyncState(s: SyncState, detail = "") {
  syncState = s;
  syncDetail = detail;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ans:sync"));
}

export function getSyncState(): { state: SyncState; detail: string } {
  return { state: syncState, detail: syncDetail };
}

function schedulePush() {
  const sb = getSupabase();
  if (!sb) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushAll(), 1500);
}

async function pushAll(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  try {
    setSyncState("syncing");
    const cols = load();
    const rows = cols.map((c) => ({
      id: c.id,
      user_id: user.id,
      title: c.title,
      names: c.names,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from("user_collections").upsert(rows, { onConflict: "user_id,id" });
    if (error) throw error;

    const { data: remote, error: listErr } = await sb.from("user_collections").select("id").eq("user_id", user.id);
    if (listErr) throw listErr;
    const localIds = new Set(cols.map((c) => c.id));
    const stale = (remote ?? []).filter((r) => !localIds.has(r.id)).map((r) => r.id);
    if (stale.length) {
      const { error: delErr } = await sb.from("user_collections").delete().eq("user_id", user.id).in("id", stale);
      if (delErr) throw delErr;
    }
    setSyncState("synced", new Date().toLocaleTimeString());
  } catch (e) {
    setSyncState("error", e instanceof Error ? e.message : "sync failed");
  }
}

function mergeCollections(local: Collection[], remote: Collection[]): Collection[] {
  const map = new Map(local.map((c) => [c.id, { ...c, names: [...c.names] }]));
  for (const r of remote) {
    const l = map.get(r.id);
    if (!l) {
      map.set(r.id, r);
      continue;
    }
    const seen = new Set(l.names.map((n) => `${n.name}|${n.category}`));
    for (const n of r.names) {
      if (!seen.has(`${n.name}|${n.category}`)) l.names.push(n);
    }
  }
  return [...map.values()];
}

// Pull remote collections, merge into local, persist, then push the merge back.
export async function syncNow(): Promise<{ ok: boolean; message: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Supabase is not configured." };
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    setSyncState("signed-out");
    return { ok: false, message: "Sign in first." };
  }
  try {
    setSyncState("syncing");
    const { data: rows, error } = await sb
      .from("user_collections")
      .select("id,title,names")
      .eq("user_id", user.id);
    if (error) throw error;
    const remote: Collection[] = (rows ?? []).map((r) => ({
      id: r.id as string,
      title: (r.title as string) ?? "Untitled",
      names: (r.names as SavedName[]) ?? [],
    }));
    const merged = mergeCollections(load(), remote);
    localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("ans:collections"));
    await pushAll();
    return { ok: true, message: "Synced." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync failed";
    setSyncState("error", msg);
    return { ok: false, message: msg };
  }
}

async function maybeAutoSync() {
  if (autoSynced) return;
  const sb = getSupabase();
  if (!sb) return;
  autoSynced = true;
  const { data } = await sb.auth.getSession();
  if (data.session?.user) await syncNow();
  else setSyncState("signed-out");
}

// ---------- hooks ----------

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const sync = () => setCollections(load());
    sync();
    void maybeAutoSync();
    window.addEventListener("ans:collections", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ans:collections", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saveName = useCallback((name: GeneratedName, collectionId = "default") => {
    const cols = load();
    const col = cols.find((c) => c.id === collectionId) ?? cols[0];
    if (!col) return;
    if (col.names.some((n) => n.name === name.name && n.category === name.category)) return;
    const saved: SavedName = { ...name, savedAt: Date.now(), tags: [] };
    col.names.unshift(saved);
    persist(cols);
  }, []);

  const removeName = useCallback((collectionId: string, id: string) => {
    const cols = load();
    const col = cols.find((c) => c.id === collectionId);
    if (!col) return;
    col.names = col.names.filter((n) => n.id !== id);
    persist(cols);
  }, []);

  const updateName = useCallback((collectionId: string, id: string, patch: Partial<SavedName>) => {
    const cols = load();
    const col = cols.find((c) => c.id === collectionId);
    if (!col) return;
    col.names = col.names.map((n) => (n.id === id ? { ...n, ...patch } : n));
    persist(cols);
  }, []);

  const createCollection = useCallback((title: string) => {
    const cols = load();
    cols.push({ id: crypto.randomUUID(), title, names: [] });
    persist(cols);
  }, []);

  const deleteCollection = useCallback((id: string) => {
    if (id === "default") return;
    persist(load().filter((c) => c.id !== id));
  }, []);

  const isSaved = useCallback(
    (name: GeneratedName) => collections.some((c) => c.names.some((n) => n.name === name.name && n.category === name.category)),
    [collections],
  );

  return { collections, saveName, removeName, updateName, createCollection, deleteCollection, isSaved };
}

// ---------- provider settings (BYO key) ----------

const SETTINGS_KEY = "ans.settings.v1";

export interface ProviderSettings {
  provider: "auto" | "anthropic" | "openai" | "gemini" | "local";
  apiKey: string;
  baseUrl: string;
}

export function loadSettings(): ProviderSettings {
  if (typeof window === "undefined") return { provider: "auto", apiKey: "", baseUrl: "" };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { provider: "auto", apiKey: "", baseUrl: "", ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { provider: "auto", apiKey: "", baseUrl: "" };
}

export function saveSettings(s: ProviderSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
