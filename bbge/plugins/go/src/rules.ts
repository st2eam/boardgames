import { produce } from "immer";
import type {
  ApplyContext,
  Event,
  PlayerId,
  ValidationError,
  VictoryResult,
} from "@bbge/core";
import {
  boardToAscii,
  emptyBoard,
  listLegalPlays,
  scoreChinese,
  tryPlay,
} from "./board";
import type {
  GoAction,
  GoConfig,
  GoEditionId,
  GoPlayer,
  GoState,
} from "./state";
import {
  komiForEdition,
  normalizeGoEdition,
  sizeForEdition,
} from "./state";

function playerById(state: GoState, id: PlayerId): GoPlayer | undefined {
  return state.players.find((p) => p.id === id);
}

function currentPlayer(state: GoState): GoPlayer {
  return state.players[state.toActIndex]!;
}

function advanceTurn(state: GoState): void {
  state.toActIndex = (state.toActIndex + 1) % state.players.length;
}

export function createGoState(config: GoConfig, _ctx: ApplyContext): GoState {
  const edition = normalizeGoEdition(config.edition);
  const size = sizeForEdition(edition);
  const komi = config.komi ?? komiForEdition(edition);
  const ids = config.playerIds.slice(0, 2);
  if (ids.length < 2) {
    throw new Error("Go requires exactly 2 players");
  }
  const players: GoPlayer[] = [
    {
      id: ids[0]!,
      name: config.playerNames[ids[0]!] ?? ids[0]!,
      color: "black",
      captures: 0,
      resigned: false,
    },
    {
      id: ids[1]!,
      name: config.playerNames[ids[1]!] ?? ids[1]!,
      color: "white",
      captures: 0,
      resigned: false,
    },
  ];
  return {
    schemaVersion: 1,
    pluginId: "go",
    seed: config.seed ?? "go",
    edition,
    size,
    komi,
    phase: "playing",
    board: emptyBoard(size),
    players,
    toActIndex: 0,
    consecutivePasses: 0,
    ko: null,
    lastMove: null,
    winners: [],
    scores: null,
    endReason: null,
  };
}

export function validateGoAction(
  state: GoState,
  action: GoAction,
): true | ValidationError {
  if (state.phase !== "playing") {
    return { error: "game finished", code: "FINISHED" };
  }
  const actor = playerById(state, action.playerId);
  if (!actor) return { error: "unknown player", code: "BAD_PLAYER" };
  if (actor.id !== currentPlayer(state).id) {
    return { error: "not your turn", code: "NOT_TURN" };
  }

  if (action.type === "pass" || action.type === "resign") return true;

  if (action.type === "play") {
    const { row, col } = action.payload;
    if (
      !Number.isInteger(row) ||
      !Number.isInteger(col) ||
      row < 0 ||
      col < 0 ||
      row >= state.size ||
      col >= state.size
    ) {
      return { error: "out of bounds", code: "OOB" };
    }
    const result = tryPlay(
      state.board,
      { row, col },
      actor.color,
      state.ko,
    );
    if (!result) {
      return { error: "illegal move", code: "ILLEGAL" };
    }
    return true;
  }

  return { error: "unknown action", code: "BAD_TYPE" };
}

function finishByScore(state: GoState, events: Event[]): void {
  const scores = scoreChinese(
    state.board,
    {
      black: state.players.find((p) => p.color === "black")?.captures ?? 0,
      white: state.players.find((p) => p.color === "white")?.captures ?? 0,
    },
    state.komi,
  );
  state.scores = scores;
  state.phase = "finished";
  state.endReason = "score";
  const blackId = state.players.find((p) => p.color === "black")!.id;
  const whiteId = state.players.find((p) => p.color === "white")!.id;
  if (scores.black > scores.white) state.winners = [blackId];
  else if (scores.white > scores.black) state.winners = [whiteId];
  else state.winners = [blackId, whiteId];

  events.push({
    type: "game/ended",
    payload: {
      reason: "score",
      scores,
      winners: state.winners,
      boardAscii: boardToAscii(state.board),
    },
  });
}

export function applyGoAction(
  state: GoState,
  action: GoAction,
  _ctx: ApplyContext,
): { state: GoState; events: Event[] } {
  const events: Event[] = [];
  const next = produce(state, (draft) => {
    const actor = draft.players.find((p) => p.id === action.playerId)!;

    if (action.type === "resign") {
      actor.resigned = true;
      draft.phase = "finished";
      draft.endReason = "resign";
      const winner = draft.players.find((p) => p.id !== actor.id)!;
      draft.winners = [winner.id];
      events.push({
        type: "player/resigned",
        payload: { playerId: actor.id, color: actor.color },
      });
      events.push({
        type: "game/ended",
        payload: {
          reason: "resign",
          winners: draft.winners,
          resignedId: actor.id,
        },
      });
      return;
    }

    if (action.type === "pass") {
      draft.consecutivePasses += 1;
      draft.ko = null;
      draft.lastMove = null;
      events.push({
        type: "move/passed",
        payload: { playerId: actor.id, color: actor.color },
      });
      if (draft.consecutivePasses >= 2) {
        finishByScore(draft, events);
        return;
      }
      advanceTurn(draft);
      return;
    }

    // play
    const { row, col } = action.payload;
    const placed = tryPlay(
      draft.board,
      { row, col },
      actor.color,
      draft.ko,
    )!;
    draft.board = placed.board;
    draft.ko = placed.ko;
    draft.consecutivePasses = 0;
    draft.lastMove = { row, col, color: actor.color };
    actor.captures += placed.captured.length;

    events.push({
      type: "move/played",
      payload: {
        playerId: actor.id,
        color: actor.color,
        row,
        col,
        size: draft.size,
        captured: placed.captured.length,
        capturedCoords: placed.captured,
      },
    });
    if (placed.captured.length) {
      events.push({
        type: "stones/captured",
        payload: {
          by: actor.id,
          color: actor.color,
          count: placed.captured.length,
          coords: placed.captured,
        },
      });
    }
    advanceTurn(draft);
  });

  return { state: next, events };
}

export function checkGoVictory(state: GoState): VictoryResult | null {
  if (state.phase !== "finished") return null;
  if (state.winners.length === 0) return null;
  if (state.winners.length > 1) {
    return { kind: "draw", winners: state.winners, reason: "jigo" };
  }
  return {
    kind: "winner",
    winners: state.winners,
    reason: state.endReason ?? "score",
  };
}

export type GoLegalItem =
  | { type: "play"; row: number; col: number }
  | { type: "pass" }
  | { type: "resign" };

export function legalActions(
  state: GoState,
  playerId: PlayerId,
): GoLegalItem[] {
  if (state.phase !== "playing") return [];
  const actor = currentPlayer(state);
  if (actor.id !== playerId) return [];
  const plays = listLegalPlays(state.board, actor.color, state.ko).map(
    (c) => ({ type: "play" as const, row: c.row, col: c.col }),
  );
  return [...plays, { type: "pass" }, { type: "resign" }];
}

export function goEditionOptions(): {
  id: GoEditionId;
  label: { en: string; zh: string };
  hint: { en: string; zh: string };
}[] {
  return [
    {
      id: "9x9",
      label: { en: "9×9 (teaching)", zh: "9×9（教学盘）" },
      hint: {
        en: "2 players · ~15–40 min · komi 6.5",
        zh: "2 人 · 约 15–40 分钟 · 贴目 6.5",
      },
    },
    {
      id: "13x13",
      label: { en: "13×13", zh: "13×13" },
      hint: {
        en: "2 players · longer · komi 7.5",
        zh: "2 人 · 稍长 · 贴目 7.5",
      },
    },
  ];
}
