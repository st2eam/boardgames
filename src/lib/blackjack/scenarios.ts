import type { Card, Rank } from "./cards";
import { RANKS, SUITS, cardValue, handValue, isPair } from "./cards";

export interface Scenario {
  playerCards: Card[];
  dealerUpcard: Card;
  playerTotal: number;
  isSoft: boolean;
  isPair: boolean;
  pairValue: number | null;
  dealerUpcardValue: number;
}

function randomRank(): Rank {
  return RANKS[Math.floor(Math.random() * RANKS.length)];
}

function randomSuit() {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

export function generateScenario(): Scenario {
  // Generate a 2-card player hand
  const r1 = randomRank();
  const r2 = randomRank();
  const playerCards: Card[] = [
    { rank: r1, suit: randomSuit() },
    { rank: r2, suit: randomSuit() },
  ];

  const dealerRank = randomRank();
  const dealerUpcard: Card = { rank: dealerRank, suit: randomSuit() };

  const { total, isSoft } = handValue(playerCards);
  const pair = isPair(playerCards);
  const pairValue = pair ? cardValue(playerCards[0].rank) : null;
  const dealerUpcardValue = cardValue(dealerRank);

  return {
    playerCards,
    dealerUpcard,
    playerTotal: total,
    isSoft,
    isPair: pair,
    pairValue,
    dealerUpcardValue,
  };
}
