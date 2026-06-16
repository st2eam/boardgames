"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ScoreConfig } from "@/types/game";
import type { ScoreBreakdown } from "./engines/types";
import { createEngine } from "./engines";
import {
  type ScoreSession,
  type RoundRecord,
  saveScoreSession,
  loadScoreSession,
  resetScoreSession,
} from "./score-storage";

export function useScoreState(slug: string, config: ScoreConfig) {
  const [session, setSession] = useState<ScoreSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const engine = useMemo(() => createEngine(config), [config]);

  useEffect(() => {
    loadScoreSession(slug).then((s) => {
      if (s && s.currentSelections) {
        setSession(s);
      } else {
        setSession({
          slug,
          playerCount: config.players.min,
          rounds: [],
          currentSelections: {},
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

  const setPlayerCount = useCallback(
    (count: number) => {
      if (!session) return;
      persist({ ...session, playerCount: count });
    },
    [session, persist]
  );

  const updateSelection = useCallback(
    (cardId: string, delta: number) => {
      if (!session) return;
      const current = session.currentSelections[cardId] ?? 0;
      const next = Math.max(0, current + delta);
      let maxCount = Infinity;
      if (cardId.startsWith("color:")) {
        const colorId = cardId.slice(6);
        const colorDef = config.colorDist?.find((c) => c.id === colorId);
        maxCount = colorDef?.count ?? Infinity;
      } else {
        const card = config.cards?.find((c) => c.id === cardId)
          ?? config.cardGroups?.flatMap((g) => g.cards).find((c) => c.id === cardId);
        maxCount = card?.count ?? Infinity;
      }
      const clamped = Math.min(next, maxCount);
      const selections = { ...session.currentSelections, [cardId]: clamped };
      if (clamped === 0) delete selections[cardId];
      persist({ ...session, currentSelections: selections });
    },
    [session, config, persist]
  );

  const setSelection = useCallback(
    (cardId: string, value: number) => {
      if (!session) return;
      const card = config.cards?.find((c) => c.id === cardId)
        ?? config.cardGroups?.flatMap((g) => g.cards).find((c) => c.id === cardId);
      const maxCount = card?.count ?? Infinity;
      const clamped = Math.min(Math.max(0, value), maxCount);
      const selections = { ...session.currentSelections, [cardId]: clamped };
      if (clamped === 0) delete selections[cardId];
      persist({ ...session, currentSelections: selections });
    },
    [session, config, persist]
  );

  const currentBreakdown: ScoreBreakdown = useMemo(() => {
    if (!session) return { total: 0, details: [] };
    return engine.calculate(session.currentSelections, config);
  }, [session?.currentSelections, engine, config]);

  const totalScore = useMemo(() => {
    if (!session) return 0;
    const roundsTotal = session.rounds.reduce((sum, r) => sum + r.score, 0);
    return roundsTotal + (config.multiRound ? 0 : currentBreakdown.total);
  }, [session?.rounds, currentBreakdown, config.multiRound]);

  const cumulativeTotal = useMemo(() => {
    if (!session) return 0;
    return session.rounds.reduce((sum, r) => sum + r.score, 0);
  }, [session?.rounds]);

  const confirmRound = useCallback(() => {
    if (!session) return;
    if (currentBreakdown.total === 0) return;
    const round: RoundRecord = {
      selections: { ...session.currentSelections },
      score: currentBreakdown.total,
    };
    persist({
      ...session,
      rounds: [...session.rounds, round],
      currentSelections: {},
    });
  }, [session, currentBreakdown, persist]);

  const getTarget = useCallback((): number | null => {
    if (config.target) return config.target;
    if (config.targetByPlayers && session) {
      return config.targetByPlayers[String(session.playerCount)] ?? null;
    }
    return null;
  }, [config, session]);

  const reset = useCallback(async () => {
    await resetScoreSession(slug);
    setSession({
      slug,
      playerCount: config.players.min,
      rounds: [],
      currentSelections: {},
      updatedAt: Date.now(),
    });
  }, [slug, config.players.min]);

  return {
    session,
    loaded,
    setPlayerCount,
    updateSelection,
    setSelection,
    currentBreakdown,
    totalScore,
    cumulativeTotal,
    confirmRound,
    getTarget,
    reset,
  };
}
