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
    }
  | {
      type: "baronessReveal";
      playerId: string;
      targets?: { targetId: string; rank: number; name?: { en: string; zh: string } }[];
      targetCount?: number;
    }
  | {
      type: "bishopRedraw";
      playerId: string;
      actorId: string;
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
  hearts?: number;
};

export type ArenaView = {
  phase: string;
  edition?: "classic" | "full" | "expansion" | "premium";
  winners: string[];
  spyBonus?: string[];
  endReason?: "last_standing" | "hand_compare" | "hearts" | null;
  standings?: ArenaStanding[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: ArenaCard[];
  pending: ArenaPending | null;
  forcedTargetId?: string | null;
  jesterPick?: string | null;
  you: {
    id: string;
    hand: ArenaCard[];
    eliminated: boolean;
    protected: boolean;
    seen?: Record<string, number>;
    hearts?: number;
  } | null;
  others: {
    id: string;
    name: string;
    handCount: number;
    hand?: ArenaCard[];
    discarded: ArenaCard[];
    eliminated: boolean;
    protected: boolean;
    hearts?: number;
  }[];
  selfDiscarded?: ArenaCard[];
};

/** Targeting rules for the selected hand role. */
export function targetSpec(role: string): {
  min: number;
  max: number;
  allowSelf: boolean;
  needsGuess: boolean;
  needsPeek: boolean;
} | null {
  switch (role) {
    case "guard":
    case "bishop":
      return { min: 1, max: 1, allowSelf: false, needsGuess: true, needsPeek: false };
    case "priest":
    case "baron":
    case "king":
    case "dowagerQueen":
    case "jester":
      return { min: 1, max: 1, allowSelf: false, needsGuess: false, needsPeek: false };
    case "prince":
    case "sycophant":
      return { min: 1, max: 1, allowSelf: true, needsGuess: false, needsPeek: false };
    case "baroness":
      return { min: 1, max: 2, allowSelf: false, needsGuess: false, needsPeek: false };
    case "cardinal":
      return { min: 2, max: 2, allowSelf: true, needsGuess: false, needsPeek: true };
    default:
      return null;
  }
}
