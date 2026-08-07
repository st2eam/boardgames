import type { PlayerId } from "@bbge/core";
import { CATEGORY_NAME } from "./handEval";
import { legalActions } from "./rules";
import type { HoldemState } from "./state";
import { cardCode } from "./cards";

function publicCard(c: { id: string; rank: number; suit: string }) {
  return {
    id: c.id,
    rank: c.rank,
    suit: c.suit,
    code: cardCode(c as never),
  };
}

export function projectHoldemView(
  state: HoldemState,
  viewerId: PlayerId | null,
) {
  const you = viewerId
    ? state.players.find((p) => p.id === viewerId)
    : null;
  const finished = state.phase === "finished";
  const potTotal = state.players.reduce((s, p) => s + p.handBet, 0);

  return {
    phase: state.phase,
    street: state.street,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    startingStack: state.startingStack,
    buttonIndex: state.buttonIndex,
    currentPlayerId: state.players[state.toActIndex]?.id ?? null,
    currentBet: state.currentBet,
    minRaiseTo: state.minRaiseTo,
    potTotal,
    pots: state.pots,
    board: state.board.map(publicCard),
    winners: state.winners,
    handNumber: state.handNumber ?? 1,
    lastAction: state.lastAction ?? null,
    legal: viewerId ? legalActions(state, viewerId) : [],
    you: you
      ? {
          id: you.id,
          hole: you.hole.map(publicCard),
          stack: you.stack,
          streetBet: you.streetBet,
          handBet: you.handBet,
          folded: you.folded,
          allIn: you.allIn,
          toCall: Math.max(0, state.currentBet - you.streetBet),
        }
      : null,
    seats: state.players.map((p, index) => {
      const reveal =
        finished &&
        !p.folded &&
        (state.showdown?.some((s) => s.playerId === p.id) ?? false);
      const sd = state.showdown?.find((s) => s.playerId === p.id);
      return {
        id: p.id,
        name: p.name,
        index,
        isButton: index === state.buttonIndex,
        isSmallBlind: index === state.smallBlindIndex,
        isBigBlind: index === state.bigBlindIndex,
        stack: p.stack,
        streetBet: p.streetBet,
        handBet: p.handBet,
        folded: p.folded,
        allIn: p.allIn,
        holeCount: p.hole.length,
        hole:
          p.id === viewerId || reveal
            ? p.hole.map(publicCard)
            : p.hole.map((c) => ({ id: c.id })),
        handCategory:
          sd != null
            ? CATEGORY_NAME[sd.score[0] as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]
            : null,
      };
    }),
  };
}
