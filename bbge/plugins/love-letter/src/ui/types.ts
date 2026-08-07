export type ArenaCard = {
  id: string;
  rank: number;
  role?: string;
  name?: { en: string; zh: string };
};

export type ArenaPending =
  | {
      type: "chancellor";
      playerId: string;
      held?: ArenaCard[];
    }
  | {
      type: "priestReveal";
      playerId: string;
      targetId: string;
      rank?: number;
      name?: { en: string; zh: string };
    };

export type ArenaStanding = {
  playerId: string;
  name: string;
  eliminated: boolean;
  handRank: number | null;
  handName?: { en: string; zh: string } | null;
  playedSpy: boolean;
  won: boolean;
  spyFavor: boolean;
};

export type ArenaView = {
  phase: string;
  edition?: "full" | "premium";
  winners: string[];
  spyBonus?: string[];
  endReason?: "last_standing" | "hand_compare" | null;
  standings?: ArenaStanding[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: ArenaCard[];
  pending: ArenaPending | null;
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
    hand?: ArenaCard[];
    discarded: ArenaCard[];
    eliminated: boolean;
    protected: boolean;
  }[];
  selfDiscarded?: ArenaCard[];
};
