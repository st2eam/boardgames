export type PlayerId = string;

export interface Action<T extends string = string, P = unknown> {
  type: T;
  playerId: PlayerId;
  payload: P;
  clientActionId?: string;
}

export interface Event<T extends string = string, P = unknown> {
  type: T;
  payload: P;
  actionSeq?: number;
}

export interface ApplyContext {
  rng: import("./rng").Rng;
  now?: number;
  engine?: unknown;
}

export interface ApplyResult<TState> {
  state: TState;
  events: Event[];
}

export interface ValidationError {
  error: string;
  code?: string;
}

export interface VictoryResult {
  kind: "winner" | "draw" | "ranking";
  winners?: PlayerId[];
  ranking?: PlayerId[];
  reason?: string;
}

export interface GamePlugin<TState = unknown, TAction = Action, TConfig = unknown> {
  id: string;
  name: string;
  version: string;
  author?: string;
  metadata: {
    minPlayers: number;
    maxPlayers: number;
    pacing: "turn" | "simultaneous" | "realtime";
    tags?: string[];
  };
  setup?(ctx: unknown): void | Promise<void>;
  createGame(config: TConfig, ctx: ApplyContext): TState;
  validateAction(
    state: TState,
    action: TAction,
    ctx: ApplyContext,
  ): true | ValidationError;
  applyAction(
    state: TState,
    action: TAction,
    ctx: ApplyContext,
  ): ApplyResult<TState>;
  onTurnStart?(state: TState, ctx: ApplyContext): ApplyResult<TState> | TState;
  onTurnEnd?(state: TState, ctx: ApplyContext): ApplyResult<TState> | TState;
  checkVictory(state: TState): VictoryResult | null;
  projectView?(state: TState, viewerId: PlayerId | null): unknown;
  serialize(state: TState): string;
  deserialize(payload: string): TState;
}
