import { produce } from "immer";
import type { ApplyContext, Event, PlayerId } from "@bbge/core";
import { buildFullDeck, mustPlayCountess, type Card, type CardRank } from "./cards";
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
    if (c.rank === 0) p.playedSpy = true;
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

function finishRound(state: LoveLetterState, events: Event[]): void {
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
    state.winners = living.filter((p) => (p.hand[0]?.rank ?? -1) === best).map((p) => p.id);
  }
  const spies = living.filter((p) => p.playedSpy);
  state.spyBonus = spies.length === 1 ? [spies[0]!.id] : [];
  events.push({
    type: "loveLetter/roundEnded",
    payload: { winners: state.winners, spyBonus: state.spyBonus },
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
  const ids = config.playerIds;
  if (ids.length < 2 || ids.length > 6) {
    throw new Error("Love Letter Full Game supports 2–6 players");
  }
  const seed = config.seed ?? "love-letter";
  const rng = ctx.rng;
  let deck = rng.shuffle(buildFullDeck());
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

  const handPreview = state.hasDrawn
    ? me.hand
    : [...me.hand, { id: "__pending__", rank: 0 as CardRank }];
  // For countess check we need real cards — validate cardId against current+draw later in apply
  const card = me.hand.find((c) => c.id === action.payload.cardId);
  const playingBeforeDraw = !state.hasDrawn && !card;
  if (!card && state.hasDrawn) return { error: "card not in hand" };

  if (card && mustPlayCountess(me.hand) && card.rank !== 8) {
    return { error: "must play Countess", code: "countess" };
  }

  const rank = card?.rank;
  const { targetId, guessRank } = action.payload;

  if (rank === 1) {
    if (otherUnprotected(state, me.id).length === 0) return true; // fizzles
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
    if (guessRank === undefined || guessRank === 1 || guessRank < 0 || guessRank > 9) {
      return { error: "invalid guess" };
    }
  }
  if (rank === 2 || rank === 3 || rank === 7) {
    if (otherUnprotected(state, me.id).length === 0) return true;
    const t = targetOk(state, me.id, targetId, false);
    if (t !== true) return t;
  }
  if (rank === 5) {
    const others = otherUnprotected(state, me.id);
    if (others.length === 0) {
      // must self
      if (targetId && targetId !== me.id) return { error: "must target self" };
    } else {
      const t = targetOk(state, me.id, targetId, true);
      if (t !== true) return t;
    }
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
    if (mustPlayCountess(me.hand) && action.payload.cardId) {
      const c = me.hand.find((x) => x.id === action.payload.cardId);
      if (c && c.rank !== 8) return;
    }

    const idx = me.hand.findIndex((c) => c.id === action.payload.cardId);
    if (idx < 0) return;
    const [played] = me.hand.splice(idx, 1);
    if (!played) return;
    me.discarded.push(played);
    if (played.rank === 0) me.playedSpy = true;

    events.push({
      type: "loveLetter/cardPlayed",
      payload: { playerId: me.id, rank: played.rank, cardId: played.id },
    });

    const { targetId, guessRank } = action.payload;

    const fizzleOthers = () => otherUnprotected(draft, me.id).length === 0;

    switch (played.rank) {
      case 9:
        eliminate(draft, me.id, events);
        break;
      case 8:
        break;
      case 7: {
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
      case 6: {
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
      case 5: {
        let tid = targetId ?? me.id;
        if (fizzleOthers()) tid = me.id;
        const t = player(draft, tid);
        const discarded = t.hand.splice(0, t.hand.length);
        for (const c of discarded) {
          t.discarded.push(c);
          if (c.rank === 0) t.playedSpy = true;
          events.push({
            type: "loveLetter/forcedDiscard",
            payload: { playerId: t.id, rank: c.rank },
          });
          if (c.rank === 9) {
            eliminate(draft, t.id, events);
            break;
          }
        }
        if (!t.eliminated) {
          const redraw = drawOne(draft);
          if (redraw) t.hand.push(redraw);
          else {
            // no card — still in with empty? rules: burn already used in drawOne
            if (t.hand.length === 0) {
              // remain with no hand only if somehow — treat as end
            }
          }
        }
        break;
      }
      case 4:
        me.protected = true;
        events.push({ type: "loveLetter/protected", payload: { playerId: me.id } });
        break;
      case 3: {
        if (fizzleOthers()) break;
        const t = player(draft, targetId!);
        const myRank = me.hand[0]!.rank;
        const theirRank = t.hand[0]!.rank;
        events.push({
          type: "loveLetter/baronCompare",
          payload: { a: me.id, b: t.id, aRank: myRank, bRank: theirRank },
        });
        if (myRank < theirRank) eliminate(draft, me.id, events);
        else if (theirRank < myRank) eliminate(draft, t.id, events);
        break;
      }
      case 2: {
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
          payload: { viewerId: me.id, targetId: t.id, rank: seen },
        });
        return;
      }
      case 1: {
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
      case 0:
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
