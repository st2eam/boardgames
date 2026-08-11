import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import {
  buildDeck,
  heartTargetForPlayers,
  maxGuessRank,
  maxPlayersForEdition,
  minPlayersForEdition,
  mustPlayCountess,
  normalizeEdition,
  roleOf,
  type Card,
  type CardRole,
} from "./cards";
import type {
  LoveLetterAction,
  LoveLetterConfig,
  LoveLetterPlayer,
  LoveLetterState,
} from "./state";

function player(state: LoveLetterState, id: PlayerId): LoveLetterPlayer {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`unknown player ${id}`);
  return p;
}

function alive(state: LoveLetterState): LoveLetterPlayer[] {
  return state.players.filter((p) => !p.eliminated);
}

function currentId(state: LoveLetterState): PlayerId {
  return state.turnOrder[state.currentIndex]!;
}

function drawOne(state: LoveLetterState): Card | null {
  if (state.deck.length > 0) return state.deck.shift()!;
  if (state.burn) {
    const c = state.burn;
    state.burn = null;
    return c;
  }
  return null;
}

function cardRole(c: Card, edition: LoveLetterState["edition"]): CardRole {
  return c.role ?? roleOf(edition, c.rank) ?? "guard";
}

function discardSum(p: LoveLetterPlayer): number {
  return p.discarded.reduce((s, c) => s + c.rank, 0);
}

function countInDiscard(p: LoveLetterPlayer): number {
  return p.discarded.filter((c) => c.role === "count").length;
}

function effectiveHandRank(p: LoveLetterPlayer): number {
  const base = p.hand[0]?.rank ?? -1;
  return base + countInDiscard(p);
}

function grantHeart(
  state: LoveLetterState,
  id: PlayerId,
  events: Event[],
): void {
  const p = player(state, id);
  p.hearts += 1;
  events.push({
    type: "loveLetter/heartGained",
    payload: { playerId: id, hearts: p.hearts },
  });
}

function heartTarget(state: LoveLetterState): number {
  return heartTargetForPlayers(state.players.length);
}

function playersAtHeartTarget(state: LoveLetterState): PlayerId[] {
  const target = heartTarget(state);
  return state.players.filter((p) => p.hearts >= target).map((p) => p.id);
}

/** Mid-round ♥ (Bishop / Constable) can end the match immediately. */
function maybeFinishByHearts(state: LoveLetterState, events: Event[]): boolean {
  const heartWinners = playersAtHeartTarget(state);
  if (heartWinners.length === 0) return false;
  state.phase = "finished";
  state.matchOver = true;
  state.winners = heartWinners;
  state.spyBonus = [];
  events.push({
    type: "loveLetter/roundEnded",
    payload: {
      ...buildRoundEndPayload(state),
      winners: heartWinners.slice(),
      spyBonus: [],
      reason: "hearts" as const,
      matchOver: true,
      heartTarget: heartTarget(state),
    },
  });
  return true;
}

function consumeForcedTarget(state: LoveLetterState): void {
  state.forcedTargetId = null;
}

function forcedTargetSatisfied(
  state: LoveLetterState,
  targetIds: PlayerId[],
): boolean {
  if (!state.forcedTargetId) return true;
  // Sycophant only compels OTHER players — the forced target
  // themselves is not constrained on their own turn.
  if (state.forcedTargetId === currentId(state)) return true;
  // If the forced target can't be targeted (protected or eliminated),
  // the constraint is waived ("if possible").
  const ft = state.players.find((p) => p.id === state.forcedTargetId);
  if (ft && (ft.eliminated || ft.protected)) return true;
  return targetIds.includes(state.forcedTargetId);
}

function eliminate(state: LoveLetterState, id: PlayerId, events: Event[]): void {
  const p = player(state, id);
  if (p.eliminated) return;
  const hadConstable =
    state.edition === "expansion" &&
    p.discarded.some((c) => c.role === "constable");
  p.eliminated = true;
  p.protected = false;
  for (const c of p.hand) {
    p.discarded.push(c);
    if (c.role === "spy") p.playedSpy = true;
  }
  p.hand = [];
  events.push({ type: "loveLetter/eliminated", payload: { playerId: id } });
  if (hadConstable) {
    grantHeart(state, id, events);
    maybeFinishByHearts(state, events);
  }
}

function advanceTurn(state: LoveLetterState): void {
  const n = state.turnOrder.length;
  for (let i = 0; i < n; i++) {
    state.currentIndex = (state.currentIndex + 1) % n;
    const id = currentId(state);
    if (!player(state, id).eliminated) {
      player(state, id).protected = false;
      state.hasDrawn = false;
      return;
    }
  }
}

function passTurnAndDraw(state: LoveLetterState, events: Event[]): void {
  if (state.phase !== "playing") return;
  advanceTurn(state);
  if (state.phase !== "playing") return;
  ensureDrawn(state, events);
}

export type RoundEndReason =
  | "last_standing"
  | "hand_compare"
  | "hearts";

export type RoundStanding = {
  playerId: PlayerId;
  name: string;
  eliminated: boolean;
  handRank: number | null;
  playedSpy: boolean;
  won: boolean;
  spyFavor: boolean;
  hearts: number;
};

export type RoundEndPayload = {
  winners: PlayerId[];
  spyBonus: PlayerId[];
  reason: RoundEndReason;
  standings: RoundStanding[];
  matchOver: boolean;
  heartTarget: number;
  roundNumber: number;
};

export function buildRoundEndPayload(
  state: LoveLetterState,
  reasonOverride?: RoundEndReason,
): RoundEndPayload {
  const living = alive(state);
  const reason: RoundEndReason =
    reasonOverride ??
    (state.matchOver
      ? "hearts"
      : living.length <= 1
        ? "last_standing"
        : "hand_compare");
  const standings: RoundStanding[] = state.players.map((p) => ({
    playerId: p.id,
    name: p.name,
    eliminated: p.eliminated,
    handRank: p.eliminated ? null : (p.hand[0]?.rank ?? null),
    playedSpy: p.playedSpy,
    won: state.winners.includes(p.id),
    spyFavor: state.spyBonus.includes(p.id),
    hearts: p.hearts,
  }));
  standings.sort((a, b) => {
    if (a.hearts !== b.hearts) return b.hearts - a.hearts;
    if (a.won !== b.won) return a.won ? -1 : 1;
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    return (b.handRank ?? -1) - (a.handRank ?? -1);
  });
  return {
    winners: state.winners.slice(),
    spyBonus: state.spyBonus.slice(),
    reason,
    standings,
    matchOver: state.matchOver,
    heartTarget: heartTarget(state),
    roundNumber: state.roundNumber,
  };
}

function resolveHandCompareWinners(state: LoveLetterState): PlayerId[] {
  const living = alive(state);
  if (living.length === 0) return [];
  if (living.length === 1) return [living[0]!.id];

  const useEffective = state.edition === "expansion";
  const rankOf = (p: LoveLetterPlayer) =>
    useEffective ? effectiveHandRank(p) : (p.hand[0]?.rank ?? -1);

  let best = -1;
  for (const p of living) best = Math.max(best, rankOf(p));

  let tied = living.filter((p) => rankOf(p) === best);

  if (state.edition === "expansion" && tied.length > 1) {
    const princesses = tied.filter((p) => p.hand[0]?.role === "princess");
    const bishops = tied.filter((p) => p.hand[0]?.role === "bishop");
    if (princesses.length > 0 && bishops.length > 0) {
      const onlyPb = tied.every(
        (p) => p.hand[0]?.role === "princess" || p.hand[0]?.role === "bishop",
      );
      if (onlyPb) tied = princesses;
    }
  }

  if (
    (state.edition === "classic" || state.edition === "expansion") &&
    tied.length > 1
  ) {
    let bestSum = -1;
    for (const p of tied) bestSum = Math.max(bestSum, discardSum(p));
    tied = tied.filter((p) => discardSum(p) === bestSum);
  }

  return tied.map((p) => p.id);
}

export function finishRound(state: LoveLetterState, events: Event[]): void {
  if (state.phase === "finished") return;
  state.phase = "finished";
  const living = alive(state);
  const roundReason: RoundEndReason =
    living.length <= 1 ? "last_standing" : "hand_compare";
  if (living.length <= 1) {
    state.winners = living.length === 1 ? [living[0]!.id] : [];
  } else {
    state.winners = resolveHandCompareWinners(state);
  }

  if (
    state.edition === "expansion" &&
    state.jesterPlayerId &&
    state.jesterPick &&
    state.winners.includes(state.jesterPick)
  ) {
    grantHeart(state, state.jesterPlayerId, events);
  }

  if (state.edition === "full" || state.edition === "expansion") {
    const spies = living.filter((p) => p.playedSpy);
    state.spyBonus = spies.length === 1 ? [spies[0]!.id] : [];
  } else {
    state.spyBonus = [];
  }

  const roundWinners = state.winners.slice();

  // Affection tokens: round win + sole Spy among survivors (can stack)
  for (const id of roundWinners) {
    grantHeart(state, id, events);
  }
  for (const id of state.spyBonus) {
    grantHeart(state, id, events);
  }

  const heartWinners = playersAtHeartTarget(state);
  if (heartWinners.length > 0) {
    state.matchOver = true;
    // Standings still mark round winners; expose match winners on `winners`
    const payload = buildRoundEndPayload(state, "hearts");
    payload.standings = payload.standings.map((s) => ({
      ...s,
      won: roundWinners.includes(s.playerId),
    }));
    state.winners = heartWinners;
    events.push({
      type: "loveLetter/roundEnded",
      payload: { ...payload, winners: heartWinners.slice() },
    });
    return;
  }

  state.matchOver = false;
  events.push({
    type: "loveLetter/roundEnded",
    payload: buildRoundEndPayload(state, roundReason),
  });
}

function maybeEnd(state: LoveLetterState, events: Event[]): void {
  if (alive(state).length <= 1) {
    finishRound(state, events);
  }
}

export function createLoveLetterState(
  config: LoveLetterConfig,
  ctx: ApplyContext,
): LoveLetterState {
  const edition = normalizeEdition(config.edition);
  const ids = config.playerIds;
  const minP = minPlayersForEdition(edition);
  const maxP = maxPlayersForEdition(edition);
  if (ids.length < minP || ids.length > maxP) {
    const label =
      edition === "classic"
        ? "Love Letter classic supports 2–4 players"
        : edition === "expansion"
          ? "Love Letter expansion supports 2–8 players"
          : "Love Letter Full Game supports 2–6 players";
    throw new Error(label);
  }
  const seed = config.seed ?? "love-letter";
  const rng = ctx.rng;
  let deck = rng.shuffle(buildDeck(edition));
  const burn = deck.shift()!;
  const faceUp: Card[] = [];
  if (ids.length === 2) {
    faceUp.push(deck.shift()!, deck.shift()!, deck.shift()!);
  }
  const players: LoveLetterPlayer[] = ids.map((id) => ({
    id,
    name: config.playerNames[id] ?? id,
    hand: [deck.shift()!],
    discarded: [],
    eliminated: false,
    protected: false,
    playedSpy: false,
    seen: {},
    hearts: 0,
  }));
  return {
    schemaVersion: 1,
    pluginId: "love-letter",
    seed,
    edition,
    phase: "playing",
    roundNumber: 1,
    matchOver: false,
    players,
    turnOrder: ids.slice(),
    currentIndex: 0,
    deck,
    burn,
    faceUp,
    pending: null,
    hasDrawn: false,
    winners: [],
    spyBonus: [],
    forcedTargetId: null,
    jesterPlayerId: null,
    jesterPick: null,
  };
}

/**
 * Same seats → next round (keep ♥) or new match if someone already won.
 * First player rotates each round.
 */
export function continueLoveLetterMatch(
  prev: LoveLetterState,
  ctx: ApplyContext,
): LoveLetterState {
  const edition = prev.edition;
  const ids = prev.turnOrder.slice();
  if (ids.length < minPlayersForEdition(edition)) {
    throw new Error("not enough players for another round");
  }
  const resetHearts = prev.matchOver || playersAtHeartTarget(prev).length > 0;
  const heartById = new Map(
    prev.players.map((p) => [p.id, resetHearts ? 0 : p.hearts] as const),
  );
  const nameById = new Map(prev.players.map((p) => [p.id, p.name] as const));

  let deck = ctx.rng.shuffle(buildDeck(edition));
  const burn = deck.shift()!;
  const faceUp: Card[] = [];
  if (ids.length === 2) {
    faceUp.push(deck.shift()!, deck.shift()!, deck.shift()!);
  }
  const players: LoveLetterPlayer[] = ids.map((id) => ({
    id,
    name: nameById.get(id) ?? id,
    hand: [deck.shift()!],
    discarded: [],
    eliminated: false,
    protected: false,
    playedSpy: false,
    seen: {},
    hearts: heartById.get(id) ?? 0,
  }));

  const startIndex = resetHearts
    ? 0
    : (prev.currentIndex + 1) % ids.length;

  const state: LoveLetterState = {
    schemaVersion: 1,
    pluginId: "love-letter",
    seed: prev.seed,
    edition,
    phase: "playing",
    roundNumber: resetHearts ? 1 : prev.roundNumber + 1,
    matchOver: false,
    players,
    turnOrder: ids,
    currentIndex: startIndex,
    deck,
    burn,
    faceUp,
    pending: null,
    hasDrawn: false,
    winners: [],
    spyBonus: [],
    forcedTargetId: null,
    jesterPlayerId: null,
    jesterPick: null,
  };

  // Draw for the starting player (same as createGame → prepareTurn)
  const events: Event[] = [];
  ensureDrawn(state, events);
  void events;
  return state;
}

function ensureDrawn(state: LoveLetterState, events: Event[]): true | { error: string } {
  if (state.hasDrawn) return true;
  const me = player(state, currentId(state));
  const card = drawOne(state);
  if (!card) {
    finishRound(state, events);
    return { error: "deck empty — round ended" };
  }
  me.hand.push(card);
  state.hasDrawn = true;
  events.push({
    type: "loveLetter/cardDrawn",
    payload: { playerId: me.id },
  });
  return true;
}

function targetOk(
  state: LoveLetterState,
  actorId: PlayerId,
  targetId: PlayerId | undefined,
  allowSelf: boolean,
): true | { error: string } {
  if (!targetId) return { error: "target required" };
  const t = state.players.find((p) => p.id === targetId);
  if (!t || t.eliminated) return { error: "invalid target" };
  if (!allowSelf && targetId === actorId) return { error: "cannot target self" };
  if (targetId !== actorId && t.protected) return { error: "target protected" };
  return true;
}

function targetsOk(
  state: LoveLetterState,
  actorId: PlayerId,
  targetIds: PlayerId[] | undefined,
  opts: { allowSelf?: boolean; exact?: number; min?: number; max?: number },
): true | { error: string } {
  if (!targetIds) return { error: "targets required" };
  const { allowSelf = false, exact, min = 1, max } = opts;
  if (exact !== undefined && targetIds.length !== exact) {
    return { error: `need ${exact} target(s)` };
  }
  if (targetIds.length < min) return { error: `need at least ${min} target(s)` };
  if (max !== undefined && targetIds.length > max) {
    return { error: `at most ${max} target(s)` };
  }
  if (new Set(targetIds).size !== targetIds.length) {
    return { error: "duplicate targets" };
  }
  for (const tid of targetIds) {
    const t = targetOk(state, actorId, tid, allowSelf);
    if (t !== true) return t;
  }
  if (!forcedTargetSatisfied(state, targetIds)) {
    return { error: "must include sycophant target" };
  }
  return true;
}

function otherUnprotected(state: LoveLetterState, actorId: PlayerId): LoveLetterPlayer[] {
  return alive(state).filter((p) => p.id !== actorId && !p.protected);
}


export function validateLoveLetterAction(
  state: LoveLetterState,
  action: LoveLetterAction,
): true | { error: string; code?: string } {
  if (state.phase !== "playing") return { error: "game finished", code: "finished" };

  if (action.type === "acknowledgePriest") {
    const pending = state.pending;
    if (
      !pending ||
      (pending.type !== "priestReveal" &&
        pending.type !== "baronessReveal" &&
        pending.type !== "bishopRedraw")
    ) {
      return { error: "no reveal pending" };
    }
    if (action.playerId !== pending.playerId) return { error: "not your reveal" };
    return true;
  }

  if (action.type === "resolveChancellor") {
    if (!state.pending || state.pending.type !== "chancellor") {
      return { error: "no chancellor pending" };
    }
    if (action.playerId !== state.pending.playerId) return { error: "not your choice" };
    const held = state.pending.held;
    const ids = new Set(held.map((c) => c.id));
    if (!ids.has(action.payload.keepCardId)) return { error: "keep card not held" };
    const rest = held.filter((c) => c.id !== action.payload.keepCardId).map((c) => c.id);
    const bottom = action.payload.bottomOrderIds;
    if (bottom.length !== rest.length) {
      return { error: `need ${rest.length} bottom card(s)` };
    }
    if (new Set(bottom).size !== bottom.length) return { error: "duplicate bottom ids" };
    for (const id of bottom) {
      if (!ids.has(id) || id === action.payload.keepCardId) {
        return { error: "invalid bottom order" };
      }
    }
    return true;
  }

  if (state.pending) return { error: "resolve pending choice first" };
  if (action.playerId !== currentId(state)) return { error: "not your turn" };
  const me = player(state, action.playerId);
  if (me.eliminated) return { error: "eliminated" };

  const handSize = state.hasDrawn ? me.hand.length : me.hand.length + 1;
  if (handSize < 2 && state.deck.length === 0 && !state.burn) {
    return { error: "cannot draw" };
  }

  const card = me.hand.find((c) => c.id === action.payload.cardId);
  const playingBeforeDraw = !state.hasDrawn && !card;
  if (!card && state.hasDrawn) return { error: "card not in hand" };

  if (
    card &&
    mustPlayCountess(me.hand, state.edition) &&
    cardRole(card, state.edition) !== "countess"
  ) {
    return { error: "must play Countess", code: "countess" };
  }

  const role = card ? cardRole(card, state.edition) : null;
  const { targetId, targetIds, guessRank, peekTargetId } = action.payload;
  const maxG = maxGuessRank(state.edition);
  if (role === "guard") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
      return { error: "must include sycophant target" };
    }
    if (
      guessRank === undefined ||
      guessRank === 1 ||
      guessRank < 0 ||
      guessRank > maxG
    ) {
      return { error: "invalid guess" };
    }
  }
  if (role === "priest" || role === "baron" || role === "king" || role === "dowagerQueen") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
      return { error: "must include sycophant target" };
    }
  }
  if (role === "bishop") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
      return { error: "must include sycophant target" };
    }
    if (guessRank === undefined || guessRank < 0 || guessRank > maxG) {
      return { error: "invalid guess" };
    }
  }
  if (role === "prince") {
    const others = otherUnprotected(state, me.id);
    if (others.length === 0) {
      if (targetId && targetId !== me.id) return { error: "must target self" };
      if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
        return { error: "must include sycophant target" };
      }
    } else {
      const t = targetOk(state, me.id, targetId, true);
      if (t !== true) return t;
      if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
        return { error: "must include sycophant target" };
      }
    }
  }
  if (role === "sycophant") {
    const t = targetOk(state, me.id, targetId, true);
    if (t !== true) return t;
  }
  if (role === "baroness") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetsOk(state, me.id, targetIds, {
      allowSelf: false,
      min: 1,
      max: 2,
    });
    if (t !== true) return t;
  }
  if (role === "cardinal") {
    const legal = alive(state).filter((p) => !p.protected || p.id === me.id);
    if (legal.length < 2) return true;
    const t = targetsOk(state, me.id, targetIds, {
      allowSelf: true,
      exact: 2,
    });
    if (t !== true) return t;
    if (peekTargetId && !targetIds?.includes(peekTargetId)) {
      return { error: "peek target must be one of swapped players" };
    }
  }
  if (role === "jester") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (!forcedTargetSatisfied(state, targetId ? [targetId] : [])) {
      return { error: "must include sycophant target" };
    }
  }
  if (role === "chancellor" && state.edition === "classic") {
    return { error: "chancellor not in this edition" };
  }
  if (playingBeforeDraw) return true;
  return true;
}

export function applyLoveLetterAction(
  state: LoveLetterState,
  action: LoveLetterAction,
  _ctx: ApplyContext,
): { state: LoveLetterState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    if (action.type === "acknowledgePriest") {
      const pending = draft.pending;
      if (
        !pending ||
        (pending.type !== "priestReveal" &&
          pending.type !== "baronessReveal" &&
          pending.type !== "bishopRedraw")
      ) {
        return;
      }
      if (action.playerId !== pending.playerId) return;

      if (pending.type === "bishopRedraw" && action.payload.redraw) {
        const me = player(draft, pending.playerId);
        const discarded = me.hand.splice(0, me.hand.length);
        for (const c of discarded) {
          me.discarded.push(c);
          if (c.role === "spy") me.playedSpy = true;
          events.push({
            type: "loveLetter/forcedDiscard",
            payload: { playerId: me.id, rank: c.rank, role: c.role },
          });
          if (c.role === "princess") {
            eliminate(draft, me.id, events);
            break;
          }
        }
        if (!me.eliminated) {
          const redraw = drawOne(draft);
          if (redraw) me.hand.push(redraw);
        }
      }

      draft.pending = null;
      events.push({
        type: "loveLetter/priestAcknowledged",
        payload: {
          playerId: action.playerId,
          kind: pending.type,
        },
      });
      if (draft.phase === "finished") return;
      if (alive(draft).length <= 1) {
        finishRound(draft, events);
      } else if (draft.phase === "playing") {
        passTurnAndDraw(draft, events);
      }
      return;
    }

    if (action.type === "resolveChancellor") {
      const pending = draft.pending;
      if (!pending || pending.type !== "chancellor") return;
      const keep = pending.held.find((c) => c.id === action.payload.keepCardId)!;
      const bottom = action.payload.bottomOrderIds.map(
        (id) => pending.held.find((c) => c.id === id)!,
      );
      const me = player(draft, action.playerId);
      me.hand = [keep];
      draft.deck.push(...bottom);
      draft.pending = null;
      consumeForcedTarget(draft);
      events.push({
        type: "loveLetter/chancellorResolved",
        payload: { playerId: me.id },
      });
      if (alive(draft).length <= 1) {
        finishRound(draft, events);
      } else {
        passTurnAndDraw(draft, events);
      }
      return;
    }

    const drawn = ensureDrawn(draft, events);
    if (drawn !== true) return;
    if (draft.phase === "finished") return;

    const me = player(draft, action.playerId);
    if (mustPlayCountess(me.hand, draft.edition) && action.payload.cardId) {
      const c = me.hand.find((x) => x.id === action.payload.cardId);
      if (c && cardRole(c, draft.edition) !== "countess") return;
    }

    const idx = me.hand.findIndex((c) => c.id === action.payload.cardId);
    if (idx < 0) return;
    const [played] = me.hand.splice(idx, 1);
    if (!played) return;
    me.discarded.push(played);
    const role = cardRole(played, draft.edition);
    if (role === "spy") me.playedSpy = true;

    events.push({
      type: "loveLetter/cardPlayed",
      payload: {
        playerId: me.id,
        rank: played.rank,
        role,
        cardId: played.id,
      },
    });

    const { targetId, targetIds, guessRank, peekTargetId } = action.payload;
    const fizzleOthers = () => otherUnprotected(draft, me.id).length === 0;
    const needsForcedConsume = [
      "guard",
      "priest",
      "baron",
      "king",
      "prince",
      "bishop",
      "dowagerQueen",
      "baroness",
      "cardinal",
      "jester",
    ].includes(role);

    switch (role) {
      case "princess":
        eliminate(draft, me.id, events);
        break;
      case "countess":
      case "count":
      case "constable":
      case "spy":
        break;
      case "sycophant": {
        if (targetId) {
          draft.forcedTargetId = targetId;
          events.push({
            type: "loveLetter/sycophantSet",
            payload: { playerId: me.id, forcedTargetId: targetId },
          });
        }
        break;
      }
      case "jester": {
        if (targetId) {
          draft.jesterPlayerId = me.id;
          draft.jesterPick = targetId;
          consumeForcedTarget(draft);
          events.push({
            type: "loveLetter/jesterPick",
            payload: { playerId: me.id, pickId: targetId },
          });
        }
        break;
      }
      case "king": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const tmp = me.hand;
        me.hand = t.hand;
        t.hand = tmp;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/swapped",
          payload: { a: me.id, b: t.id },
        });
        break;
      }
      case "chancellor": {
        if (draft.edition === "classic") break;
        if (draft.deck.length === 0 && !draft.burn) break;
        const held = [...me.hand];
        const d1 = drawOne(draft);
        if (d1) held.push(d1);
        const d2 = draft.deck.length > 0 || draft.burn ? drawOne(draft) : null;
        if (d2) held.push(d2);
        me.hand = [];
        if (held.length <= 1) {
          me.hand = held;
          consumeForcedTarget(draft);
          events.push({
            type: "loveLetter/chancellorResolved",
            payload: { playerId: me.id, auto: true },
          });
          break;
        }
        draft.pending = { type: "chancellor", playerId: me.id, held };
        events.push({
          type: "loveLetter/chancellorPending",
          payload: { playerId: me.id, count: held.length },
        });
        return;
      }
      case "prince": {
        let tid = targetId ?? me.id;
        if (fizzleOthers()) tid = me.id;
        const t = player(draft, tid);
        const discarded = t.hand.splice(0, t.hand.length);
        for (const c of discarded) {
          t.discarded.push(c);
          if (c.role === "spy") t.playedSpy = true;
          events.push({
            type: "loveLetter/forcedDiscard",
            payload: { playerId: t.id, rank: c.rank, role: c.role },
          });
          if (c.role === "princess") {
            eliminate(draft, t.id, events);
            break;
          }
        }
        if (!t.eliminated) {
          const redraw = drawOne(draft);
          if (redraw) t.hand.push(redraw);
        }
        consumeForcedTarget(draft);
        break;
      }
      case "handmaid":
        me.protected = true;
        events.push({ type: "loveLetter/protected", payload: { playerId: me.id } });
        break;
      case "baron": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const myRank = me.hand[0]!.rank;
        const theirRank = t.hand[0]!.rank;
        const loserId =
          myRank < theirRank ? me.id : theirRank < myRank ? t.id : null;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/baronCompare",
          payload: { a: me.id, b: t.id, loserId },
        });
        if (loserId === me.id) eliminate(draft, me.id, events);
        else if (loserId === t.id) eliminate(draft, t.id, events);
        break;
      }
      case "dowagerQueen": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const myRank = me.hand[0]!.rank;
        const theirRank = t.hand[0]!.rank;
        const loserId =
          myRank > theirRank ? me.id : theirRank > myRank ? t.id : null;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/dowagerCompare",
          payload: { a: me.id, b: t.id, loserId },
        });
        if (loserId === me.id) eliminate(draft, me.id, events);
        else if (loserId === t.id) eliminate(draft, t.id, events);
        break;
      }
      case "priest": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const seen = t.hand[0]!.rank;
        me.seen[t.id] = seen;
        consumeForcedTarget(draft);
        draft.pending = {
          type: "priestReveal",
          playerId: me.id,
          targetId: t.id,
          rank: seen,
        };
        events.push({
          type: "loveLetter/priestPeek",
          payload: { viewerId: me.id, targetId: t.id },
        });
        return;
      }
      case "baroness": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const ids = targetIds ?? [];
        const targets = ids.map((id) => {
          const t = player(draft, id);
          const rank = t.hand[0]!.rank;
          me.seen[id] = rank;
          return { targetId: id, rank };
        });
        consumeForcedTarget(draft);
        draft.pending = {
          type: "baronessReveal",
          playerId: me.id,
          targets,
        };
        events.push({
          type: "loveLetter/baronessPeek",
          payload: { viewerId: me.id, targetIds: ids },
        });
        return;
      }
      case "cardinal": {
        const legal = alive(draft).filter((p) => !p.protected || p.id === me.id);
        if (legal.length < 2 || !targetIds || targetIds.length !== 2) break;
        const [aId, bId] = targetIds;
        const a = player(draft, aId!);
        const b = player(draft, bId!);
        const tmp = a.hand;
        a.hand = b.hand;
        b.hand = tmp;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/swapped",
          payload: { a: aId, b: bId },
        });
        const peekId = peekTargetId ?? aId;
        if (peekId) {
          const peeked = player(draft, peekId);
          const seen = peeked.hand[0]?.rank;
          if (seen != null) {
            me.seen[peekId] = seen;
            events.push({
              type: "loveLetter/cardinalPeek",
              payload: { viewerId: me.id, targetId: peekId, rank: seen },
            });
          }
        }
        break;
      }
      case "guard": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const held = t.hand[0];
        if (held?.role === "assassin") {
          consumeForcedTarget(draft);
          events.push({
            type: "loveLetter/assassinTriggered",
            payload: { guardId: me.id, targetId: t.id },
          });
          eliminate(draft, me.id, events);
          t.hand = [];
          t.discarded.push(held);
          const redraw = drawOne(draft);
          if (redraw) t.hand.push(redraw);
          break;
        }
        const hit = held?.rank === guessRank;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/guardGuess",
          payload: { actorId: me.id, targetId: t.id, guessRank, hit },
        });
        if (hit) eliminate(draft, t.id, events);
        break;
      }
      case "bishop": {
        if (fizzleOthers()) { consumeForcedTarget(draft); break; }
        const t = player(draft, targetId!);
        const hit = t.hand[0]?.rank === guessRank;
        consumeForcedTarget(draft);
        events.push({
          type: "loveLetter/bishopGuess",
          payload: { actorId: me.id, targetId: t.id, guessRank, hit },
        });
        if (hit) {
          grantHeart(draft, me.id, events);
          if (maybeFinishByHearts(draft, events)) return;
          draft.pending = {
            type: "bishopRedraw",
            playerId: t.id,
            actorId: me.id,
          };
          return;
        }
        break;
      }
      default:
        break;
    }

    if (needsForcedConsume && role !== "sycophant") {
      // forced target consumed in each branch above when effect ran
    }

    // eliminate() may finish via Constable hearts (TS can't narrow draft.phase)
    if ((draft.phase as LoveLetterState["phase"]) !== "playing") return;

    if (alive(draft).length <= 1) {
      finishRound(draft, events);
      return;
    }
    passTurnAndDraw(draft, events);
  });

  return { state: next, events };
}

export function checkLoveLetterVictory(state: LoveLetterState) {
  if (state.phase !== "finished") return null;
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: state.matchOver ? "hearts" : "round_over",
    matchOver: state.matchOver,
    heartTarget: heartTarget(state),
    roundNumber: state.roundNumber,
  };
}
