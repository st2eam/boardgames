import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import {
  buildDeck,
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

function eliminate(state: LoveLetterState, id: PlayerId, events: Event[]): void {
  const p = player(state, id);
  if (p.eliminated) return;
  p.eliminated = true;
  p.protected = false;
  for (const c of p.hand) {
    p.discarded.push(c);
    if (c.role === "spy") p.playedSpy = true;
  }
  p.hand = [];
  events.push({ type: "loveLetter/eliminated", payload: { playerId: id } });
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

/** End current turn: pass to next living player and draw so the view always has a full hand. */
function passTurnAndDraw(state: LoveLetterState, events: Event[]): void {
  if (state.phase !== "playing") return;
  advanceTurn(state);
  if (state.phase !== "playing") return;
  ensureDrawn(state, events);
}

export type RoundEndReason = "last_standing" | "hand_compare";

export type RoundStanding = {
  playerId: PlayerId;
  name: string;
  eliminated: boolean;
  /** Final hand rank when still in; null if eliminated */
  handRank: number | null;
  playedSpy: boolean;
  won: boolean;
  spyFavor: boolean;
};

export type RoundEndPayload = {
  winners: PlayerId[];
  spyBonus: PlayerId[];
  reason: RoundEndReason;
  standings: RoundStanding[];
};

/** Public payload for roundEnded + finished views (why someone won). */
export function buildRoundEndPayload(state: LoveLetterState): RoundEndPayload {
  const living = alive(state);
  const reason: RoundEndReason =
    living.length <= 1 ? "last_standing" : "hand_compare";
  const standings: RoundStanding[] = state.players.map((p) => ({
    playerId: p.id,
    name: p.name,
    eliminated: p.eliminated,
    handRank: p.eliminated ? null : (p.hand[0]?.rank ?? null),
    playedSpy: p.playedSpy,
    won: state.winners.includes(p.id),
    spyFavor: state.spyBonus.includes(p.id),
  }));
  standings.sort((a, b) => {
    if (a.won !== b.won) return a.won ? -1 : 1;
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    return (b.handRank ?? -1) - (a.handRank ?? -1);
  });
  return {
    winners: state.winners.slice(),
    spyBonus: state.spyBonus.slice(),
    reason,
    standings,
  };
}

function discardSum(p: LoveLetterPlayer): number {
  return p.discarded.reduce((s, c) => s + c.rank, 0);
}

export function finishRound(state: LoveLetterState, events: Event[]): void {
  state.phase = "finished";
  const living = alive(state);
  if (living.length === 1) {
    state.winners = [living[0]!.id];
  } else {
    let best = -1;
    for (const p of living) {
      const r = p.hand[0]?.rank ?? -1;
      if (r > best) best = r;
    }
    let tied = living.filter((p) => (p.hand[0]?.rank ?? -1) === best);
    // Premium: hand tie → highest discard-sum wins; still tied → all win
    if (state.edition === "premium" && tied.length > 1) {
      let bestSum = -1;
      for (const p of tied) bestSum = Math.max(bestSum, discardSum(p));
      tied = tied.filter((p) => discardSum(p) === bestSum);
    }
    state.winners = tied.map((p) => p.id);
  }
  // Spy favor only exists in Full Game
  if (state.edition === "full") {
    const spies = living.filter((p) => p.playedSpy);
    state.spyBonus = spies.length === 1 ? [spies[0]!.id] : [];
  } else {
    state.spyBonus = [];
  }
  events.push({
    type: "loveLetter/roundEnded",
    payload: buildRoundEndPayload(state),
  });
}

function maybeEnd(state: LoveLetterState, events: Event[]): void {
  if (alive(state).length <= 1) {
    finishRound(state, events);
    return;
  }
  if (state.deck.length === 0 && state.burn === null && state.hasDrawn) {
    // end after turn completes — caller checks after play when hand settled
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
    throw new Error(
      edition === "premium"
        ? "Love Letter Premium (classic) supports 2–4 players"
        : "Love Letter Full Game supports 2–6 players",
    );
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
  }));
  return {
    schemaVersion: 1,
    pluginId: "love-letter",
    seed,
    edition,
    phase: "playing",
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
  };
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

function otherUnprotected(state: LoveLetterState, actorId: PlayerId): LoveLetterPlayer[] {
  return alive(state).filter((p) => p.id !== actorId && !p.protected);
}

export function validateLoveLetterAction(
  state: LoveLetterState,
  action: LoveLetterAction,
): true | { error: string; code?: string } {
  if (state.phase !== "playing") return { error: "game finished", code: "finished" };

  if (action.type === "acknowledgePriest") {
    if (!state.pending || state.pending.type !== "priestReveal") {
      return { error: "no priest reveal pending" };
    }
    if (action.playerId !== state.pending.playerId) return { error: "not your reveal" };
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

  // After conceptual draw, hand size 2
  const handSize = state.hasDrawn ? me.hand.length : me.hand.length + 1;
  if (handSize < 2 && state.deck.length === 0 && !state.burn) {
    return { error: "cannot draw" };
  }

  // For countess check we need real cards — validate cardId against current+draw later in apply
  const card = me.hand.find((c) => c.id === action.payload.cardId);
  const playingBeforeDraw = !state.hasDrawn && !card;
  if (!card && state.hasDrawn) return { error: "card not in hand" };

  if (
    card &&
    mustPlayCountess(me.hand, state.edition) &&
    card.role !== "countess"
  ) {
    return { error: "must play Countess", code: "countess" };
  }

  const role =
    card?.role ?? (card ? roleOf(state.edition, card.rank) : null);
  const { targetId, guessRank } = action.payload;
  const maxG = maxGuessRank(state.edition);

  if (role === "guard") {
    if (otherUnprotected(state, me.id).length === 0) return true; // fizzles
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (
      guessRank === undefined ||
      guessRank === 1 ||
      guessRank < 0 ||
      guessRank > maxG
    ) {
      return { error: "invalid guess" };
    }
  }
  if (role === "priest" || role === "baron" || role === "king") {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
  }
  if (role === "prince") {
    const others = otherUnprotected(state, me.id);
    if (others.length === 0) {
      if (targetId && targetId !== me.id) return { error: "must target self" };
    } else {
      const t = targetOk(state, me.id, targetId, true);
      if (t !== true) return t;
    }
  }
  if (role === "chancellor" && state.edition !== "full") {
    return { error: "chancellor not in this edition" };
  }
  if (playingBeforeDraw) {
    // card might be the drawn one — allow; apply will verify
    return true;
  }
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
      if (!pending || pending.type !== "priestReveal") return;
      if (action.playerId !== pending.playerId) return;
      draft.pending = null;
      events.push({
        type: "loveLetter/priestAcknowledged",
        payload: { playerId: action.playerId, targetId: pending.targetId },
      });
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
      if (c && c.role !== "countess") return;
    }

    const idx = me.hand.findIndex((c) => c.id === action.payload.cardId);
    if (idx < 0) return;
    const [played] = me.hand.splice(idx, 1);
    if (!played) return;
    me.discarded.push(played);
    const role: CardRole =
      played.role ?? roleOf(draft.edition, played.rank) ?? "guard";
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

    const { targetId, guessRank } = action.payload;
    const fizzleOthers = () => otherUnprotected(draft, me.id).length === 0;

    switch (role) {
      case "princess":
        eliminate(draft, me.id, events);
        break;
      case "countess":
        break;
      case "king": {
        if (fizzleOthers()) break;
        const t = player(draft, targetId!);
        const tmp = me.hand;
        me.hand = t.hand;
        t.hand = tmp;
        events.push({
          type: "loveLetter/swapped",
          payload: { a: me.id, b: t.id },
        });
        break;
      }
      case "chancellor": {
        if (draft.edition !== "full") break;
        if (draft.deck.length === 0 && !draft.burn) break;
        const held = [...me.hand];
        const d1 = drawOne(draft);
        if (d1) held.push(d1);
        const d2 = draft.deck.length > 0 || draft.burn ? drawOne(draft) : null;
        if (d2) held.push(d2);
        me.hand = [];
        if (held.length <= 1) {
          me.hand = held;
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
        break;
      }
      case "handmaid":
        me.protected = true;
        events.push({ type: "loveLetter/protected", payload: { playerId: me.id } });
        break;
      case "baron": {
        if (fizzleOthers()) break;
        const t = player(draft, targetId!);
        const myRank = me.hand[0]!.rank;
        const theirRank = t.hand[0]!.rank;
        const loserId =
          myRank < theirRank ? me.id : theirRank < myRank ? t.id : null;
        events.push({
          type: "loveLetter/baronCompare",
          payload: { a: me.id, b: t.id, loserId },
        });
        if (loserId === me.id) eliminate(draft, me.id, events);
        else if (loserId === t.id) eliminate(draft, t.id, events);
        break;
      }
      case "priest": {
        if (fizzleOthers()) break;
        const t = player(draft, targetId!);
        const seen = t.hand[0]!.rank;
        me.seen[t.id] = seen;
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
      case "guard": {
        if (fizzleOthers()) break;
        const t = player(draft, targetId!);
        const hit = t.hand[0]?.rank === guessRank;
        events.push({
          type: "loveLetter/guardGuess",
          payload: { actorId: me.id, targetId: t.id, guessRank, hit },
        });
        if (hit) eliminate(draft, t.id, events);
        break;
      }
      case "spy":
        break;
      default:
        break;
    }

    if (alive(draft).length <= 1) {
      finishRound(draft, events);
      return;
    }
    // Next seat draws immediately so UI/AI always see a 2-card hand (or round ends).
    if (draft.phase === "playing") {
      passTurnAndDraw(draft, events);
    }
  });

  return { state: next, events };
}

export function checkLoveLetterVictory(state: LoveLetterState) {
  if (state.phase !== "finished") return null;
  return {
    kind: "winner" as const,
    winners: state.winners,
    reason: "round_over",
  };
}
