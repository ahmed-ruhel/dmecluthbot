/**
 * Scenario persistence: localStorage save/load + base64 URL sharing.
 * Works in browser only (localStorage / URL access).
 */

export interface SavedScenario {
  id: string;
  label: string;
  module: "clutch" | "block_brake" | "band_brake";
  savedAt: string; // ISO timestamp
  inputs: Record<string, unknown>;
  summaryLine?: string; // e.g. "Do=179.9 mm, T=600 N·m"
}

const STORAGE_KEY = "griplab_scenarios";

// ---------- Save / Load ----------

export function saveScenario(scenario: Omit<SavedScenario, "id" | "savedAt">): SavedScenario {
  const all = loadAllScenarios();
  const full: SavedScenario = {
    ...scenario,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  };
  all.push(full);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return full;
}

export function loadAllScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

export function deleteScenario(id: string): void {
  if (typeof window === "undefined") return;
  const remaining = loadAllScenarios().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export function clearAllScenarios(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ---------- URL sharing ----------

export function encodeScenarioUrl(scenario: SavedScenario): string {
  if (typeof window === "undefined") return "";
  const json = JSON.stringify(scenario);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = new URL(window.location.href);
  url.searchParams.set("scenario", b64);
  return url.toString();
}

export function decodeScenarioUrl(param: string): SavedScenario | null {
  try {
    const json = decodeURIComponent(escape(atob(param)));
    return JSON.parse(json) as SavedScenario;
  } catch {
    return null;
  }
}

/** On page load, check if a ?scenario= param is present and return decoded scenario. */
export function extractScenarioFromUrl(): SavedScenario | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const param = params.get("scenario");
  return param ? decodeScenarioUrl(param) : null;
}
