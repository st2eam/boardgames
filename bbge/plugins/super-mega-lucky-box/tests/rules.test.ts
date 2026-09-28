import { describe, expect, it } from "vitest";
import { createRng } from "@bbge/core";
import { LUCKY_BOX_CARDS, validateLuckyBoxDeck } from "../src/cards";
import {
  applySmlbAction,
  createSmlbState,
  projectSmlbView,
  scoreMoonTokens,
  scoreSoloMoons,
  soloScoreRating,
  validateSmlbAction,
} from "../src";
import { createMockSmlbSeat } from "../src/mockSeat";
import type { SmlbAction, SmlbState } from "../src/state";

function setup(count = 1, seed = "smlb-test"): SmlbState {
  const playerIds = Array.from({ length: count }, (_, i) => "p" + i);
  const playerNames = Object.fromEntries(playerIds.map((id) => [id, id]));
  return createSmlbState(
    { playerIds, playerNames, seed },
    { rng: createRng(seed) },
  );
}

function act(state: SmlbState, action: SmlbAction): SmlbState {
  const valid = validateSmlbAction(state, action);
  expect(valid).toBe(true);
  return applySmlbAction(state, action, { rng: createRng(state.seed) }).state;
}

function startRound(state: SmlbState): SmlbState {
  let next = state;
  for (const player of next.players) {
    next = act(next, {
      type: "keepStartingCards",
      playerId: player.id,
      payload: { cardIds: player.startingOffers.slice(0, 3) },
    });
  }
  return act(next, {
    type: "advance",
    playerId: next.players[0]!.id,
    payload: {},
  });
}

function boardCard(cardId: string, marked = Array(9).fill(false)) {
  return {
    cardId,
    marked,
    claimedRows: [false, false, false],
    claimedColumns: [false, false, false],
  };
}

function numberState(cardId: string, currentNumber: number): SmlbState {
  const state = setup();
  const player = state.players[0]!;
  player.cards = [boardCard(cardId)];
  player.startingOffers = [];
  state.phase = "selecting";
  state.currentNumber = currentNumber;
  state.numberDeck = [currentNumber, 1, 2, 3, 4, 5, 6, 7, 8];
  state.numberCursor = 1;
  state.revealedNumbers = [currentNumber];
  return state;
}

function cellWith(cardId: string, value: number): number {
  return LUCKY_BOX_CARDS.find((card) => card.id === cardId)!.grid.indexOf(value);
}

describe("numbered physical Lucky Box deck", () => {
  it("contains 60 unique faces with balanced printed numbers", () => {
    expect(validateLuckyBoxDeck()).toEqual([]);
    expect(new Set(LUCKY_BOX_CARDS.map((card) => card.id)).size).toBe(60);
    expect(
      new Set(
        LUCKY_BOX_CARDS.map((card) =>
          JSON.stringify([card.grid, card.rows, card.columns]),
        ),
      ).size,
    ).toBe(60);
  });

  it("matches the five supplied physical cards, including blank bonus positions", () => {
    const signature = (id: string) => {
      const card = LUCKY_BOX_CARDS.find((item) => item.id === id)!;
      const reward = (item: typeof card.rows[number]) =>
        item.kind === "number" ? String(item.value)
          : item.kind === "wild" ? "?"
            : item.kind === "lightning" ? item.count === 1 ? "L" : "D"
              : item.kind === "star" ? "S"
                : item.kind === "moon" ? "M" : "-";
      return [card.grid.join(""), card.rows.map(reward).join(""), card.columns.map(reward).join("")].join("|");
    };
    expect(signature("box-37")).toBe("123231456|?-?|LLS");
    expect(signature("box-52")).toBe("123231789|456|DMM");
    expect(signature("box-54")).toBe("456789897|123|MDM");
    expect(signature("box-58")).toBe("123789897|456|DMM");
    expect(signature("box-09")).toBe("456654789|321|M97");
  });
});

describe("Super Mega Lucky Box setup and views", () => {
  it("reproduces seeded deals and changes the shuffled deal for another seed", () => {
    const a = setup(3, "seed-a");
    const b = setup(3, "seed-a");
    const c = setup(3, "seed-b");
    expect(a).toEqual(b);
    expect(a.luckyDeck).not.toEqual(c.luckyDeck);
    expect(a.numberDeck).toEqual(b.numberDeck);
    expect(a.numberDeck).toHaveLength(9);
    expect(a.players.every((player) => player.startingOffers.length === 5)).toBe(true);
  });

  it("keeps the other player's five-card starting offer private", () => {
    const state = setup(2);
    const view = projectSmlbView(state, "p0");
    const serialized = JSON.stringify(view);
    expect(view.you?.startingOffers).toHaveLength(5);
    for (const id of state.players[1]!.startingOffers) {
      expect(serialized).not.toContain(id);
    }
    expect(view.players[1]!.cards).toEqual([]);
  });

  it("requires each player to keep exactly three of their own five cards", () => {
    const state = setup(2);
    const own = state.players[0]!;
    expect(
      validateSmlbAction(state, {
        type: "keepStartingCards",
        playerId: own.id,
        payload: { cardIds: own.startingOffers.slice(0, 2) },
      }),
    ).not.toBe(true);
    expect(
      validateSmlbAction(state, {
        type: "keepStartingCards",
        playerId: own.id,
        payload: { cardIds: state.players[1]!.startingOffers.slice(0, 3) },
      }),
    ).not.toBe(true);
    const next = act(state, {
      type: "keepStartingCards",
      playerId: own.id,
      payload: { cardIds: own.startingOffers.slice(0, 3) },
    });
    expect(next.players[0]!.cards).toHaveLength(3);
    expect(next.players[0]!.startingOffers).toHaveLength(0);
    expect(next.phase).toBe("startingDraft");
  });
});

describe("number selection and Lightning", () => {
  it("wraps 9 to 1 and 1 to 9 with one token", () => {
    for (const [shown, target] of [
      [9, 1],
      [1, 9],
    ] as const) {
      const card = LUCKY_BOX_CARDS.find((item) => item.grid.includes(target))!;
      const state = numberState(card.id, shown);
      const player = state.players[0]!;
      player.lightning = 1;
      const cellIndex = cellWith(card.id, target);
      const next = act(state, {
        type: "markNumber",
        playerId: player.id,
        payload: {
          cardId: card.id,
          cellIndex,
          adjustments: shown === 9 ? [1] : [-1],
        },
      });
      expect(next.players[0]!.cards[0]!.marked[cellIndex]).toBe(true);
      expect(next.players[0]!.lightning).toBe(0);
    }
  });

  it("rejects unreachable adjustments, a false skip, another player's card, and a second response", () => {
    const card = LUCKY_BOX_CARDS.find((item) => item.grid.includes(5))!;
    const state = numberState(card.id, 5);
    state.players[0]!.lightning = 1;
    expect(
      validateSmlbAction(state, {
        type: "markNumber",
        playerId: "p0",
        payload: { cardId: card.id, cellIndex: cellWith(card.id, 5), adjustments: [1, 1] },
      }),
    ).not.toBe(true);
    expect(
      validateSmlbAction(state, {
        type: "skipNumber",
        playerId: "p0",
        payload: {},
      }),
    ).not.toBe(true);

    const round = startRound(setup(2));
    const twoPlayer = structuredClone(round);
    const foreignCard = LUCKY_BOX_CARDS.find((item) =>
      item.grid.includes(twoPlayer.currentNumber!),
    )!;
    twoPlayer.players[1]!.cards = [boardCard(foreignCard.id)];
    expect(
      validateSmlbAction(twoPlayer, {
        type: "markNumber",
        playerId: "p0",
        payload: {
          cardId: foreignCard.id,
          cellIndex: cellWith(foreignCard.id, twoPlayer.currentNumber!),
          adjustments: [],
        },
      }),
    ).not.toBe(true);

    const validCard = LUCKY_BOX_CARDS.find((item) =>
      item.grid.includes(twoPlayer.currentNumber!),
    )!;
    const validIndex = cellWith(validCard.id, twoPlayer.currentNumber!);
    twoPlayer.players[0]!.cards = [boardCard(validCard.id)];
    const marked = act(twoPlayer, {
      type: "markNumber",
      playerId: "p0",
      payload: { cardId: validCard.id, cellIndex: validIndex, adjustments: [] },
    });
    expect(
      validateSmlbAction(marked, {
        type: "markNumber",
        playerId: "p0",
        payload: { cardId: validCard.id, cellIndex: validIndex, adjustments: [] },
      }),
    ).not.toBe(true);
  });

  it("does not allow skipping when an open number is reachable, but allows a genuine skip", () => {
    const card = LUCKY_BOX_CARDS.find((item) => item.grid.includes(1))!;
    const state = numberState(card.id, 1);
    expect(
      validateSmlbAction(state, {
        type: "skipNumber",
        playerId: "p0",
        payload: {},
      }),
    ).not.toBe(true);
    state.players[0]!.cards[0]!.marked = Array(9).fill(true);
    expect(
      validateSmlbAction(state, {
        type: "skipNumber",
        playerId: "p0",
        payload: {},
      }),
    ).toBe(true);
  });
});

describe("bonus chains", () => {
  it("claims a printed blank line without queuing a reward", () => {
    const state = numberState("box-37", 1);
    state.players[0]!.cards[0]!.marked = [false, false, false, true, true, false, false, false, false];
    const next = act(state, {
      type: "markNumber",
      playerId: "p0",
      payload: { cardId: "box-37", cellIndex: 5, adjustments: [] },
    });
    expect(next.players[0]!.cards[0]!.claimedRows[1]).toBe(true);
    expect(next.players[0]!.pendingBonuses).toEqual([]);
  });

  it("queues both lines from one square and allows the player to choose order", () => {
    const first = LUCKY_BOX_CARDS[0]!;
    const second = LUCKY_BOX_CARDS[2]!;
    const firstMarked = Array(9).fill(false);
    for (const index of [1, 2, 3, 6]) firstMarked[index] = true;
    const secondMarked = Array(9).fill(false);
    for (const index of [7, 8]) secondMarked[index] = true;
    const state = numberState(first.id, first.grid[0]!);
    state.players[0]!.cards = [
      boardCard(first.id, firstMarked),
      boardCard(second.id, secondMarked),
    ];

    let next = act(state, {
      type: "markNumber",
      playerId: "p0",
      payload: { cardId: first.id, cellIndex: 0, adjustments: [] },
    });
    expect(next.players[0]!.pendingBonuses.map((bonus) => bonus.line)).toEqual([
      "row",
      "column",
    ]);
    const columnBonus = next.players[0]!.pendingBonuses.find(
      (bonus) => bonus.line === "column" && bonus.index === 0,
    )!;
    next = act(next, {
      type: "resolveBonus",
      playerId: "p0",
      payload: { bonusId: columnBonus.id },
    });
    expect(
      next.players[0]!.pendingBonuses.some(
        (bonus) => bonus.line === "row" && bonus.index === 0,
      ),
    ).toBe(true);

    const numberBonus = next.players[0]!.pendingBonuses.find(
      (bonus) => bonus.line === "row" && bonus.index === 0,
    )!;
    next = act(next, {
      type: "resolveBonus",
      playerId: "p0",
      payload: {
        bonusId: numberBonus.id,
        cardId: second.id,
        cellIndex: 6,
      },
    });
    expect(next.players[0]!.cards[1]!.marked[6]).toBe(true);
    expect(
      next.players[0]!.pendingBonuses.some(
        (bonus) => bonus.cardId === second.id && bonus.line === "row" && bonus.index === 2,
      ),
    ).toBe(true);
  });

  it("does not allow an unresolved number reward to be stored or aimed at the wrong value", () => {
    const card = LUCKY_BOX_CARDS.find((item) => item.rows[0]?.kind === "number")!;
    const state = numberState(card.id, card.grid[0]!);
    state.players[0]!.cards[0]!.marked = [false, true, true, false, false, false, false, false, false];
    const marked = act(state, {
      type: "markNumber",
      playerId: "p0",
      payload: { cardId: card.id, cellIndex: 0, adjustments: [] },
    });
    const bonus = marked.players[0]!.pendingBonuses.find(
      (item) => item.line === "row" && item.index === 0,
    );
    if (!bonus || bonus.reward.kind !== "number") throw new Error("expected a number reward");
    const numberValue = bonus.reward.value;
    const wrongCell = card.grid.findIndex(
      (value, index) =>
        value !== numberValue && !marked.players[0]!.cards[0]!.marked[index],
    );
    expect(
      validateSmlbAction(marked, {
        type: "resolveBonus",
        playerId: "p0",
        payload: { bonusId: bonus.id, cardId: card.id, cellIndex: wrongCell },
      }),
    ).not.toBe(true);
  });
});

describe("round and final scoring", () => {
  it.each([
    [1, 1],
    [2, 4],
    [3, 9],
  ])("scores %i stars as a round total of %i", (stars, points) => {
    const state = setup();
    const player = state.players[0]!;
    player.cards = [];
    player.starsThisRound = stars;
    state.phase = "advancing";
    state.advanceKind = "scoreRound";
    const next = act(state, { type: "advance", playerId: player.id, payload: {} });
    expect(next.players[0]!.roundScores[0]).toBe(points);
    expect(next.players[0]!.score).toBe(points);
    expect(next.phase).toBe("roundDraft");
  });

  it("scores completed and incomplete cards, stars, and solo moons after round four", () => {
    const state = setup();
    const player = state.players[0]!;
    const complete = boardCard(LUCKY_BOX_CARDS[0]!.id, Array(9).fill(true));
    const incompleteMarks = Array(9).fill(false);
    incompleteMarks[0] = true;
    incompleteMarks[1] = true;
    incompleteMarks[2] = true;
    player.cards = [complete, boardCard(LUCKY_BOX_CARDS[1]!.id, incompleteMarks)];
    player.score = 60;
    player.starsThisRound = 3;
    player.moons = 6;
    state.round = 4;
    state.numberCursor = 9;
    state.phase = "advancing";
    state.advanceKind = "scoreRound";

    const next = act(state, { type: "advance", playerId: player.id, payload: {} });
    expect(next.phase).toBe("finished");
    expect(next.players[0]!.roundScores[3]).toBe(17);
    expect(next.players[0]!.incompletePoints).toBe(1);
    expect(next.players[0]!.moonPoints).toBe(10);
    expect(next.players[0]!.finalScore).toBe(88);
    expect(next.winners).toEqual(["p0"]);
    expect(soloScoreRating(70)).toBe("luckyChampion");
  });

  it("breaks equal totals by moon count and supports shared wins when both tie", () => {
    const state = setup(2);
    state.round = 4;
    state.numberCursor = 9;
    state.phase = "advancing";
    state.advanceKind = "scoreRound";
    state.players[0]!.score = 106;
    state.players[0]!.moons = 1;
    state.players[1]!.score = 100;
    state.players[1]!.moons = 2;
    const next = act(state, { type: "advance", playerId: "p0", payload: {} });
    expect(next.players.map((player) => player.finalScore)).toEqual([106, 106]);
    expect(next.winners).toEqual(["p1"]);

    const tied = setup(2);
    tied.round = 4;
    tied.numberCursor = 9;
    tied.phase = "advancing";
    tied.advanceKind = "scoreRound";
    tied.players[0]!.score = 100;
    tied.players[1]!.score = 100;
    tied.players[0]!.moons = 2;
    tied.players[1]!.moons = 2;
    const shared = act(tied, { type: "advance", playerId: "p0", payload: {} });
    expect(shared.winners).toEqual(["p0", "p1"]);
  });

  it("uses the full two-player and tied majority/minority Moon awards", () => {
    expect(
      scoreMoonTokens([
        { id: "a", moons: 2 },
        { id: "b", moons: 2 },
      ]),
    ).toEqual({ a: 6, b: 6 });
    expect(
      scoreMoonTokens([
        { id: "a", moons: 2 },
        { id: "b", moons: 2 },
        { id: "c", moons: 0 },
      ]),
    ).toEqual({ a: 6, b: 6, c: -6 });
    expect(
      scoreMoonTokens([
        { id: "a", moons: 1 },
        { id: "b", moons: 1 },
        { id: "c", moons: 1 },
      ]),
    ).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("matches each solo Moon rating", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(scoreSoloMoons)).toEqual([
      -6, -2, 0, 1, 3, 6, 10,
    ]);
    expect(
      [44, 45, 50, 55, 60, 65, 70].map((score) => soloScoreRating(score)),
    ).toEqual([
      "unlucky",
      "goodStart",
      "onTrolley",
      "greatGame",
      "superScore",
      "megaGame",
      "luckyChampion",
    ]);
  });

  it("reshuffles the face-up Lucky Box discard when the deck runs out", () => {
    const state = setup();
    state.phase = "advancing";
    state.advanceKind = "scoreRound";
    state.numberCursor = 9;
    state.luckyDeck = [LUCKY_BOX_CARDS[0]!.id];
    state.luckyDiscard = LUCKY_BOX_CARDS.slice(1).map((card) => card.id);
    state.players[0]!.cards = [];
    const next = act(state, { type: "advance", playerId: "p0", payload: {} });
    expect(next.phase).toBe("roundDraft");
    expect(next.players[0]!.roundOffers).toHaveLength(3);
    expect(new Set(next.players[0]!.roundOffers).size).toBe(3);
    expect(next.luckyDiscard).toEqual([]);
    expect(next.luckyDeck).toHaveLength(57);
  });
});

describe("full solo match", () => {
  it("plays through nine numbers in each of four rounds with the deterministic mock seat", async () => {
    let state = setup(1, "four-round-solo");
    const ai = createMockSmlbSeat("p0");
    let guard = 0;
    while (state.phase !== "finished" && guard++ < 500) {
      if (state.phase === "advancing") {
        state = act(state, { type: "advance", playerId: "p0", payload: {} });
      } else if (state.phase === "startingDraft") {
        state = act(state, {
          type: "keepStartingCards",
          playerId: "p0",
          payload: { cardIds: state.players[0]!.startingOffers.slice(0, 3) },
        });
      } else if (state.phase === "roundDraft") {
        state = act(state, {
          type: "pickRoundCard",
          playerId: "p0",
          payload: { cardId: state.players[0]!.roundOffers[0]! },
        });
      } else {
        const view = projectSmlbView(state, "p0");
        const decision = await ai.think(view);
        state = act(state, decision.action as SmlbAction);
      }
    }
    expect(guard).toBeLessThan(500);
    expect(state.phase).toBe("finished");
    expect(state.round).toBe(4);
    expect(state.players[0]!.roundScores).toHaveLength(4);
    expect(state.winners).toEqual(["p0"]);
  });
});
