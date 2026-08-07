import type {
  Action,
  Event,
  GamePlugin,
  PlayerId,
} from "@bbge/core";
import { createRng } from "@bbge/core";
import type { SessionPhase } from "./phases";

export interface LobbySeat {
  id: PlayerId;
  name: string;
  kind: "human" | "ai";
  ready: boolean;
}

export interface LobbyState {
  seats: LobbySeat[];
  hostPlayerId: PlayerId;
  seed: string;
  /** Optional game edition (e.g. love-letter classic | full); synced to guests. */
  edition?: string;
  /** Extra createGame config snapshot for lobby UI (blinds, etc.). */
  gameConfig?: Record<string, unknown>;
}

export interface AiChatMessage {
  playerId: PlayerId;
  text: string;
  at: number;
}

export type AiPresenceEvent =
  | { type: "ai/thinking"; playerId: PlayerId; started: true }
  | { type: "ai/thinking"; playerId: PlayerId; started: false }
  | { type: "ai/chat"; message: AiChatMessage };

type SubmitOk = {
  ok: true;
  events: Event[];
  views: Map<PlayerId, unknown>;
  seq: number;
};
type SubmitErr = { ok: false; error: string };

export class HostSession<TState = unknown, TAction extends Action = Action> {
  private phase: SessionPhase = "lobby";
  private lobby: LobbyState;
  private state: TState | null = null;
  private seq = 0;
  private chat: AiChatMessage[] = [];
  private canStartAi: () => boolean | Promise<boolean>;
  /** Extra fields merged into plugin createGame config (e.g. edition). */
  private gameConfig: Record<string, unknown>;

  constructor(
    private plugin: GamePlugin<TState, TAction, unknown>,
    opts: {
      seed: string;
      hostPlayerId: PlayerId;
      canStartAi?: () => boolean | Promise<boolean>;
      gameConfig?: Record<string, unknown>;
    },
  ) {
    this.gameConfig = opts.gameConfig ?? {};
    this.lobby = {
      seats: [],
      hostPlayerId: opts.hostPlayerId,
      seed: opts.seed,
      edition:
        typeof this.gameConfig.edition === "string"
          ? this.gameConfig.edition
          : undefined,
    };
    this.canStartAi = opts.canStartAi ?? (() => true);
  }

  getPhase(): SessionPhase {
    return this.phase;
  }

  getLobby(): LobbyState {
    return structuredClone({
      ...this.lobby,
      gameConfig: { ...this.gameConfig },
    });
  }

  getSeed(): string {
    return this.lobby.seed;
  }

  addHumanSeat(id: PlayerId, name: string): void {
    if (this.phase !== "lobby") return;
    if (this.lobby.seats.some((s) => s.id === id)) return;
    this.lobby.seats.push({ id, name, kind: "human", ready: false });
  }

  addAiSeat(id: PlayerId, name: string): void {
    if (this.phase !== "lobby") return;
    if (this.lobby.seats.some((s) => s.id === id)) return;
    this.lobby.seats.push({ id, name, kind: "ai", ready: true });
  }

  removeSeat(id: PlayerId): void {
    if (this.phase !== "lobby") return;
    if (id === this.lobby.hostPlayerId) return;
    this.lobby.seats = this.lobby.seats.filter((s) => s.id !== id);
  }

  setReady(id: PlayerId, ready: boolean): void {
    const seat = this.lobby.seats.find((s) => s.id === id);
    if (seat && seat.kind === "human") seat.ready = ready;
  }

  /** Update createGame extras (e.g. edition) while still in lobby. */
  setGameConfig(patch: Record<string, unknown>): void {
    if (this.phase !== "lobby") return;
    this.gameConfig = { ...this.gameConfig, ...patch };
    if (typeof patch.edition === "string") {
      this.lobby.edition = patch.edition;
    }
  }

  getGameConfig(): Record<string, unknown> {
    return { ...this.gameConfig };
  }

  private dealMatch(): void {
    const playerIds = this.lobby.seats.map((s) => s.id);
    const playerNames = Object.fromEntries(
      this.lobby.seats.map((s) => [s.id, s.name]),
    );
    const rng = createRng(this.lobby.seed);
    this.state = this.plugin.createGame(
      {
        playerIds,
        playerNames,
        seed: this.lobby.seed,
        ...this.gameConfig,
      },
      { rng },
    );
    this.seq = 0;
    this.phase = "playing";
    const victory = this.plugin.checkVictory(this.state);
    if (victory) this.phase = "finished";
  }

  async start(): Promise<{ ok: true } | { ok: false; error: string }> {
    if (this.phase !== "lobby") return { ok: false, error: "not in lobby" };
    if (this.lobby.seats.length < this.plugin.metadata.minPlayers) {
      return { ok: false, error: "not enough players" };
    }
    if (this.lobby.seats.some((s) => s.kind === "human" && !s.ready)) {
      return { ok: false, error: "not all ready" };
    }
    if (this.lobby.seats.some((s) => s.kind === "ai")) {
      const ok = await this.canStartAi();
      if (!ok) return { ok: false, error: "api key required for AI seats" };
    }
    this.dealMatch();
    return { ok: true };
  }

  /**
   * Same seats → new seed → new deal. Only from `finished`.
   * If the plugin defines `continueMatch` (e.g. Hold'em cash session),
   * stacks/session state are preserved and chat is kept.
   */
  rematch(seed: string): SubmitOk | SubmitErr {
    if (this.phase !== "finished") {
      return { ok: false, error: "not finished" };
    }
    if (this.lobby.seats.length < this.plugin.metadata.minPlayers) {
      return { ok: false, error: "not enough players" };
    }
    this.lobby.seed = seed;

    const cont = (
      this.plugin as GamePlugin<TState, TAction, unknown> & {
        continueMatch?: (
          state: TState,
          ctx: { rng: ReturnType<typeof createRng> },
        ) => TState;
      }
    ).continueMatch;

    if (typeof cont === "function" && this.state) {
      try {
        this.state = cont(this.state, { rng: createRng(seed) });
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "cannot continue match",
        };
      }
      this.seq = 0;
      this.phase = "playing";
      const victory = this.plugin.checkVictory(this.state);
      if (victory) this.phase = "finished";
      return { ok: true, events: [], views: this.allViews(), seq: this.seq };
    }

    this.chat = [];
    this.dealMatch();
    return { ok: true, events: [], views: this.allViews(), seq: this.seq };
  }

  submitAction(action: TAction): SubmitOk | SubmitErr {
    if (this.phase !== "playing" || !this.state) {
      return { ok: false, error: "not playing" };
    }
    const seat = this.lobby.seats.find((s) => s.id === action.playerId);
    if (!seat) return { ok: false, error: "unknown seat" };

    const prepare = (
      this.plugin as GamePlugin<TState, TAction, unknown> & {
        prepareTurn?: (s: TState) => { state: TState; events: Event[] };
      }
    ).prepareTurn;
    if (typeof prepare === "function") {
      const p = prepare(this.state);
      this.state = p.state;
    }

    const v = this.plugin.validateAction(this.state, action, {
      rng: createRng(this.lobby.seed),
    });
    if (v !== true) return { ok: false, error: v.error };

    const result = this.plugin.applyAction(this.state, action, {
      rng: createRng(this.lobby.seed),
    });
    this.state = result.state;
    this.seq += 1;
    const events = result.events.map((e) => ({ ...e, actionSeq: this.seq }));

    const victory = this.plugin.checkVictory(this.state);
    if (victory) {
      this.phase = "finished";
      events.push({
        type: "WinnerDeclared",
        payload: victory,
        actionSeq: this.seq,
      });
    }

    return { ok: true, events, views: this.allViews(), seq: this.seq };
  }

  getView(viewerId: PlayerId): unknown {
    if (!this.state) return null;
    return this.plugin.projectView
      ? this.plugin.projectView(this.state, viewerId)
      : this.state;
  }

  allViews(): Map<PlayerId, unknown> {
    const map = new Map<PlayerId, unknown>();
    for (const s of this.lobby.seats) {
      map.set(s.id, this.getView(s.id));
    }
    return map;
  }

  getPublicChat(): AiChatMessage[] {
    return this.chat.slice();
  }

  pushChat(msg: AiChatMessage): void {
    this.chat.push(msg);
  }

  getSerializedState(): string | null {
    if (!this.state) return null;
    return this.plugin.serialize(this.state);
  }

  getAiSeatIds(): PlayerId[] {
    return this.lobby.seats.filter((s) => s.kind === "ai").map((s) => s.id);
  }

  /**
   * Active seat for turn-based plugins.
   * Convention: `projectView` includes `currentPlayerId` (public).
   */
  getCurrentPlayerId(): PlayerId | null {
    if (!this.state || this.phase !== "playing") return null;
    const v = this.getView(this.lobby.hostPlayerId) as {
      currentPlayerId?: PlayerId;
    } | null;
    return v?.currentPlayerId ?? null;
  }
}
