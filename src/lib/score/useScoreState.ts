"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ScoreConfig } from "@/types/game";
import {
  type ScoreSession,
  type PlayerScore,
  saveScoreSession,
  loadScoreSession,
  resetScoreSession,
} from "@/lib/score/score-storage";

const PLAYER_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
  "#14b8a6", "#6366f1",
];

function createDefaultPlayer(index: number): PlayerScore {
  return {
    name: `P${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    scores: {},
    roundScores: [],
  };
}

export function useScoreState(slug: string, config: ScoreConfig) {
  const [session, setSession] = useState<ScoreSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadScoreSession(slug).then((s) => {
      if (s) {
        setSession(s);
      } else {
        const players = Array.from({ length: config.players.min }, (_, i) =>
          createDefaultPlayer(i)
        );
        setSession({
          slug,
          players,
          currentRound: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      setLoaded(true);
    });
  }, [slug, config.players.min]);

  const persist = useCallback((updated: ScoreSession) => {
    setSession(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveScoreSession(updated);
    }, 300);
  }, []);

  const addPlayer = useCallback(() => {
    if (!session) return;
    if (session.players.length >= config.players.max) return;
    const updated = {
      ...session,
      players: [...session.players, createDefaultPlayer(session.players.length)],
    };
    persist(updated);
  }, [session, config.players.max, persist]);

  const removePlayer = useCallback(
    (index: number) => {
      if (!session) return;
      if (session.players.length <= config.players.min) return;
      const updated = {
        ...session,
        players: session.players.filter((_, i) => i !== index),
      };
      persist(updated);
    },
    [session, config.players.min, persist]
  );

  const renamePlayer = useCallback(
    (index: number, name: string) => {
      if (!session) return;
      const players = [...session.players];
      players[index] = { ...players[index], name };
      persist({ ...session, players });
    },
    [session, persist]
  );

  const updateCategoryScore = useCallback(
    (playerIndex: number, categoryId: string, delta: number) => {
      if (!session) return;
      const players = [...session.players];
      const p = { ...players[playerIndex], scores: { ...players[playerIndex].scores } };
      const current = p.scores[categoryId] ?? 0;
      const next = current + delta;
      if (next < 0) return;
      const cat = config.categories?.find((c) => c.id === categoryId);
      if (cat?.max && next > cat.max) return;
      p.scores[categoryId] = next;
      players[playerIndex] = p;
      persist({ ...session, players });
    },
    [session, config.categories, persist]
  );

  const addRoundScore = useCallback(
    (playerIndex: number, score: number) => {
      if (!session) return;
      const players = [...session.players];
      const p = { ...players[playerIndex] };
      p.roundScores = [...(p.roundScores ?? [])];
      if (p.roundScores.length < session.currentRound) {
        p.roundScores.push(score);
      } else {
        p.roundScores[session.currentRound - 1] = score;
      }
      players[playerIndex] = p;
      persist({ ...session, players });
    },
    [session, persist]
  );

  const nextRound = useCallback(() => {
    if (!session) return;
    const maxRounds = config.rounds ?? Infinity;
    if (session.currentRound >= maxRounds) return;
    persist({ ...session, currentRound: session.currentRound + 1 });
  }, [session, config.rounds, persist]);

  const reset = useCallback(async () => {
    await resetScoreSession(slug);
    const players = Array.from({ length: config.players.min }, (_, i) =>
      createDefaultPlayer(i)
    );
    const fresh: ScoreSession = {
      slug,
      players,
      currentRound: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSession(fresh);
    await saveScoreSession(fresh);
  }, [slug, config.players.min]);

  const getPlayerTotal = useCallback(
    (playerIndex: number): number => {
      if (!session) return 0;
      const p = session.players[playerIndex];
      if (config.type === "victory-points" || config.type === "cumulative") {
        if (config.categories?.length) {
          return Object.entries(p.scores).reduce((sum, [catId, count]) => {
            const cat = config.categories!.find((c) => c.id === catId);
            return sum + count * (cat?.value ?? 1);
          }, 0);
        }
        return (p.roundScores ?? []).reduce((a, b) => a + b, 0);
      }
      if (config.type === "rounds") {
        return (p.roundScores ?? []).reduce(
          (a, b) => a + b,
          config.startingScore ?? 0
        );
      }
      return 0;
    },
    [session, config]
  );

  const getTarget = useCallback(
    (playerCount?: number): number | null => {
      if (config.target) return config.target;
      if (config.targetByPlayers && playerCount) {
        return config.targetByPlayers[String(playerCount)] ?? null;
      }
      return null;
    },
    [config]
  );

  return {
    session,
    loaded,
    addPlayer,
    removePlayer,
    renamePlayer,
    updateCategoryScore,
    addRoundScore,
    nextRound,
    reset,
    getPlayerTotal,
    getTarget,
  };
}
