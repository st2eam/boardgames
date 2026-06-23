import type { Card, Rank, Suit } from "../blackjack/cards";
import { SUITS } from "../blackjack/cards";
import type { Position, CardLabel } from "./strategy";
import { POSITIONS, CARD_LABELS, getCorrectAction, getHandLabel } from "./strategy";
import type { PreflopAction } from "./strategy";

export interface PreflopScenario {
  position: Position;
  card1: Card;
  card2: Card;
  card1Label: CardLabel;
  card2Label: CardLabel;
  isSuited: boolean;
  handLabel: string;
  correctAction: PreflopAction;
}

const RANK_TO_LABEL: Record<Rank, CardLabel> = {
  "A": "A", "K": "K", "Q": "Q", "J": "J", "10": "T",
  "9": "9", "8": "8", "7": "7", "6": "6", "5": "5",
  "4": "4", "3": "3", "2": "2",
};

function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function differentSuit(s: Suit): Suit {
  const others = SUITS.filter(x => x !== s);
  return others[Math.floor(Math.random() * others.length)];
}

const ALL_RANKS: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

function randomRank(): Rank {
  return ALL_RANKS[Math.floor(Math.random() * ALL_RANKS.length)];
}

export function generatePreflopScenario(): PreflopScenario {
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

  const rank1 = randomRank();
  let rank2 = randomRank();

  const suit1 = randomSuit();
  // ~30% chance suited if different ranks, always different suit for pairs
  const isSuited = rank1 !== rank2 && Math.random() < 0.35;
  const suit2 = rank1 === rank2
    ? differentSuit(suit1)
    : (isSuited ? suit1 : differentSuit(suit1));

  const card1: Card = { rank: rank1, suit: suit1 };
  const card2: Card = { rank: rank2, suit: suit2 };

  const label1 = RANK_TO_LABEL[rank1];
  const label2 = RANK_TO_LABEL[rank2];

  const handLabel = getHandLabel(label1, label2, isSuited);
  const correctAction = getCorrectAction(position, label1, label2, isSuited);

  return {
    position,
    card1,
    card2,
    card1Label: label1,
    card2Label: label2,
    isSuited,
    handLabel,
    correctAction,
  };
}
