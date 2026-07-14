const STORAGE_KEY = "game-shelf-recent";
const MAX_RECENT = 8;

export function getRecentGameSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

export function trackRecentGame(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const prev = getRecentGameSlugs().filter((s) => s !== slug);
    const next = [slug, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}
