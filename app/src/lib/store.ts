"use client";

import { useCallback, useEffect, useState } from "react";
import type { Collection, GeneratedName, SavedName } from "./types";

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
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const sync = () => setCollections(load());
    sync();
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
