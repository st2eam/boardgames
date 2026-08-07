import type { Action, PlayerId } from "@bbge/core";
import type { AiSeat } from "./ai-seat";

type HandCard = { id: string; rank: number; role?: string };
type DiscardCard = { id?: string; rank: number; role?: string };

type View = {
  edition?: string;
  currentPlayerId?: string;
  deckCount?: number;
  faceUp?: DiscardCard[];
  pending?: {
    type: string;
    playerId: string;
    held?: { id: string; rank?: number }[];
    targets?: { targetId: string; rank: number }[];
  } | null;
  you?: {
    id: string;
    hand: HandCard[];
    seen?: Record<string, number>;
    protected?: boolean;
  } | null;
  others?: {
    id: string;
    eliminated: boolean;
    protected: boolean;
    discarded?: DiscardCard[];
    hearts?: number;
  }[];
  selfDiscarded?: DiscardCard[];
};

const NO_TARGET = new Set([
  "spy",
  "handmaid",
  "chancellor",
  "countess",
  "princess",
  "constable",
  "count",
  "assassin",
]);

function roleOf(c: HandCard): string {
  return c.role ?? String(c.rank);
}

function mixUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Rank priority for keeping (higher = keep longer). */
function keepScore(role: string, rank: number): number {
  if (role === "princess") return 100;
  if (role === "countess") return 90;
  if (role === "king") return 80;
  if (role === "prince") return 70;
  if (role === "chancellor") return 65;
  if (role === "bishop") return 60;
  if (role === "baron" || role === "baroness") return 45;
  if (role === "handmaid") return 50;
  if (role === "priest") return 35;
  if (role === "guard") return 20;
  if (role === "spy") return 15;
  return rank;
}

function discardedRanks(view: View): number[] {
  const out: number[] = [];
  for (const c of view.faceUp ?? []) out.push(c.rank);
  for (const c of view.selfDiscarded ?? []) out.push(c.rank);
  for (const o of view.others ?? []) {
    for (const c of o.discarded ?? []) out.push(c.rank);
  }
  return out;
}

function pickGuardGuess(
  maxGuess: number,
  discarded: number[],
  seen: Record<string, number> | undefined,
  targetId: string | undefined,
  mix: number,
): number {
  if (targetId && seen?.[targetId] != null && seen[targetId] !== 1) {
    return seen[targetId]!;
  }
  const dead = new Set(discarded);
  // Prefer threatening ranks still in play
  const prefs = [8, 9, 7, 6, 5, 4, 3, 2].filter(
    (r) => r <= maxGuess && r !== 1 && !dead.has(r),
  );
  if (prefs.length === 0) {
    for (let r = maxGuess; r >= 2; r--) {
      if (!dead.has(r)) return r;
    }
    return Math.min(maxGuess, 8);
  }
  const idx = Math.min(prefs.length - 1, Math.floor(mix * prefs.length));
  return prefs[idx]!;
}

function pickCard(
  hand: HandCard[],
  others: NonNullable<View["others"]>,
  deckCount: number,
  mix: number,
): HandCard {
  const roles = hand.map(roleOf);
  const forced =
    roles.includes("countess") &&
    (roles.includes("king") || roles.includes("prince"))
      ? hand.find((c) => roleOf(c) === "countess")!
      : null;
  if (forced) return forced;

  const nonPrincess = hand.filter((c) => roleOf(c) !== "princess");
  const pool = nonPrincess.length > 0 ? nonPrincess : hand;
  if (others.length === 0) {
    return (
      pool.find((c) => NO_TARGET.has(roleOf(c))) ??
      [...pool].sort((a, b) => keepScore(roleOf(a), a.rank) - keepScore(roleOf(b), b.rank))[0]!
    );
  }

  // Late game: dump risky mid cards; early: gather info / protect
  const late = deckCount <= 8;
  let best = pool[0]!;
  let bestScore = -Infinity;
  for (const c of pool) {
    const role = roleOf(c);
    let score = -keepScore(role, c.rank); // prefer playing low keep-value
    if (role === "handmaid" && keepScore(roleOf(pool.find((x) => x.id !== c.id) ?? c), c.rank) >= 70) {
      score += 40; // protect a power card
    }
    if (role === "priest" && !late) score += 25;
    if (role === "guard") score += 18;
    if (role === "baron" || role === "baroness") {
      const other = pool.find((x) => x.id !== c.id);
      score += other && other.rank >= 5 ? 22 : -10;
    }
    if (role === "prince" && late) score += 15;
    if (role === "king" && late) score += 12;
    if (role === "spy") score += late ? -5 : 8;
    score += mix * 3;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function pickTarget(
  others: NonNullable<View["others"]>,
  role: string,
  seen: Record<string, number> | undefined,
  mix: number,
): string | undefined {
  if (others.length === 0) return undefined;
  // Prefer unprotected; bias toward known high / unknown
  const ranked = [...others].sort((a, b) => {
    const sa = seen?.[a.id] ?? 0;
    const sb = seen?.[b.id] ?? 0;
    if (role === "baron" || role === "baroness" || role === "dowagerQueen") {
      return sa - sb; // challenge lower known
    }
    if (role === "guard" || role === "bishop") {
      return sb - sa; // shoot known threats first
    }
    if (role === "prince") {
      return sb - sa; // force high cards out
    }
    return (b.hearts ?? 0) - (a.hearts ?? 0);
  });
  const idx = Math.min(ranked.length - 1, mix < 0.2 ? 1 : 0);
  return ranked[Math.min(idx, ranked.length - 1)]!.id;
}

/** Strategic Love Letter seat: keep power cards, smart Guard guesses, protect. */
export function createMockLoveLetterSeat(id: PlayerId): AiSeat {
  return {
    id,
    async think(viewUnknown, opts) {
      const view = viewUnknown as View;
      const progress = (note: string) => opts?.onProgress?.({ note });
      const edition =
        view.edition === "classic" || view.edition === "premium"
          ? "classic"
          : view.edition === "expansion"
            ? "expansion"
            : "full";
      const maxGuess = edition === "classic" ? 8 : 9;
      const mix = mixUnit(
        `${id}|${(view.you?.hand ?? []).map((c) => c.id).join(",")}|${view.deckCount ?? 0}`,
      );

      if (
        (view.pending?.type === "priestReveal" ||
          view.pending?.type === "baronessReveal") &&
        view.pending.playerId === id
      ) {
        progress("策略：记下偷看信息");
        return {
          action: { type: "acknowledgePriest", playerId: id, payload: {} },
        };
      }
      if (view.pending?.type === "bishopRedraw" && view.pending.playerId === id) {
        // Keep strong known hands; redraw junk
        const hand = view.you?.hand ?? [];
        const rank = hand[0]?.rank ?? 0;
        const redraw = rank > 0 && rank <= 3 && mix < 0.55;
        progress(redraw ? "策略：主教命中后重抽" : "策略：主教命中后留牌");
        return {
          action: {
            type: "acknowledgePriest",
            playerId: id,
            payload: { redraw },
          },
        };
      }
      if (view.pending?.type === "chancellor" && view.pending.playerId === id) {
        const held = [...(view.pending.held ?? [])];
        held.sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));
        const keep = held[0]!;
        const rest = held.filter((c) => c.id !== keep.id);
        progress("策略：大臣留最高牌");
        return {
          action: {
            type: "resolveChancellor",
            playerId: id,
            payload: {
              keepCardId: keep.id,
              bottomOrderIds: rest.map((c) => c.id),
            },
          },
        };
      }

      const hand = view.you?.hand ?? [];
      if (hand.length === 0) throw new Error("AI has no card");
      const others = (view.others ?? []).filter(
        (p) => !p.eliminated && !p.protected,
      );
      const card = pickCard(hand, others, view.deckCount ?? 99, mix);
      const role = roleOf(card);
      const dead = discardedRanks(view);
      const seen = view.you?.seen;

      const singleTarget = [
        "guard",
        "priest",
        "baron",
        "prince",
        "king",
        "bishop",
        "dowagerQueen",
        "jester",
        "sycophant",
      ].includes(role);
      const baroness = role === "baroness";
      const cardinal = role === "cardinal";
      const targetId = singleTarget
        ? role === "prince" || role === "sycophant"
          ? pickTarget(others, role, seen, mix) ?? id
          : pickTarget(others, role, seen, mix)
        : undefined;

      progress(
        role === "princess"
          ? "策略：只剩公主，被迫打出"
          : `策略：打出 ${role}${targetId ? ` → ${targetId}` : ""}`,
      );

      if (cardinal && others.length >= 1) {
        const a = pickTarget(others, "priest", seen, mix) ?? others[0]!.id;
        const b =
          others.find((o) => o.id !== a)?.id ?? id;
        return {
          action: {
            type: "playCard",
            playerId: id,
            payload: {
              cardId: card.id,
              targetIds: [a, b],
              peekTargetId: a,
            },
          } as Action,
        };
      }
      if (baroness && others.length >= 1) {
        const ordered = [...others].sort((a, b) => {
          const sa = seen?.[a.id] ?? 5;
          const sb = seen?.[b.id] ?? 5;
          return sa - sb;
        });
        return {
          action: {
            type: "playCard",
            playerId: id,
            payload: {
              cardId: card.id,
              targetIds: ordered
                .slice(0, Math.min(2, ordered.length))
                .map((p) => p.id),
            },
          } as Action,
        };
      }

      return {
        action: {
          type: "playCard",
          playerId: id,
          payload: {
            cardId: card.id,
            targetId,
            guessRank:
              role === "guard" || role === "bishop"
                ? pickGuardGuess(maxGuess, dead, seen, targetId, mix)
                : undefined,
          },
        } as Action,
      };
    },
  };
}
