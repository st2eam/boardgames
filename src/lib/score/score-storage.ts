import { get, set, del } from "idb-keyval";

export interface RoundRecord {
  selections: Record<string, number>;
  score: number;
}

export interface ScoreSession {
  slug: string;
  playerCount: number;
  rounds: RoundRecord[];
  currentSelections: Record<string, number>;
  updatedAt: number;
}

function storageKey(slug: string): string {
  return `score:${slug}`;
}

export async function saveScoreSession(session: ScoreSession): Promise<void> {
  session.updatedAt = Date.now();
  await set(storageKey(session.slug), session);
}

export async function loadScoreSession(
  slug: string
): Promise<ScoreSession | null> {
  const result = await get<ScoreSession>(storageKey(slug));
  return result ?? null;
}

export async function resetScoreSession(slug: string): Promise<void> {
  await del(storageKey(slug));
}
