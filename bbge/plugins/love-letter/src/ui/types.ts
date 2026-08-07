export type ArenaCard = {
  id: string;
  rank: number;
  name?: { en: string; zh: string };
};

export type ArenaView = {
  phase: string;
  winners: string[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: ArenaCard[];
  pending: {
    type: string;
    playerId: string;
    held?: ArenaCard[];
  } | null;
  you: {
    id: string;
    hand: ArenaCard[];
    eliminated: boolean;
    protected: boolean;
    seen?: Record<string, number>;
  } | null;
  others: {
    id: string;
    name: string;
    handCount: number;
    discarded: { id: string; rank: number; name?: { en: string; zh: string } }[];
    eliminated: boolean;
    protected: boolean;
  }[];
  selfDiscarded?: { id: string; rank: number; name?: { en: string; zh: string } }[];
};
