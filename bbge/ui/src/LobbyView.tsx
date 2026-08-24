"use client";

import type { LobbyState } from "@bbge/runtime";

export type LobbyEditionOption = {
  id: string;
  label: string;
  hint?: string;
};

interface Props {
  locale: string;
  lobby: LobbyState | null;
  shareUrl: string;
  roomReady?: boolean;
  displayName: string;
  onDisplayName: (v: string) => void;
  onAddAi: () => void;
  onAddHotseat: () => void;
  onStart: () => void;
  onReady: () => void;
  /** Host: reorder turn order (seat index = action order) */
  onMoveSeat?: (id: string, delta: -1 | 1) => void;
  onShuffleSeats?: () => void;
  /** Host-only edition picker (e.g. Love Letter) */
  editions?: LobbyEditionOption[];
  edition?: string;
  onEditionChange?: (id: string) => void;
  /** Texas Hold'em stakes (lobby customizable) */
  stakes?: { smallBlind: number; bigBlind: number; startingStack: number };
  onStakesChange?: (patch: {
    smallBlind?: number;
    bigBlind?: number;
    startingStack?: number;
  }) => void;
  maxSeats?: number;
  onRemoveSeat?: (id: string) => void;
}

function SeatCard({
  index,
  name,
  kind,
  ready,
  host,
  zh,
  canReorder,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  index: number;
  name: string;
  kind: "human" | "ai";
  ready: boolean;
  host?: boolean;
  zh: boolean;
  canReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div data-testid="lobby-seat" className="flex items-center gap-2 rounded-xl border border-border bg-white px-2.5 py-2 shadow-sm sm:gap-3 sm:px-3 sm:py-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface font-heading text-xs font-bold tabular-nums text-stone-600"
        title={zh ? "行动顺序" : "Turn order"}
      >
        {index + 1}
      </span>
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white",
          kind === "ai"
            ? "bg-linear-to-br from-emerald-500 to-teal-700"
            : "bg-primary",
        ].join(" ")}
      >
        {kind === "ai" ? "AI" : name.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-bold text-primary-dark">
          {name}
        </p>
        <p className="text-[11px] text-stone-500">
          {host ? (zh ? "房主 · " : "Host · ") : ""}
          {kind === "ai" ? "AI" : zh ? "玩家" : "Human"}
          {ready ? (zh ? " · 就绪" : " · Ready") : ""}
        </p>
      </div>
      {canReorder && (
        <div className="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            disabled={!onMoveUp}
            onClick={onMoveUp}
            aria-label={zh ? "上移" : "Move up"}
            className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold text-primary-dark hover:bg-surface disabled:cursor-not-allowed disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={!onMoveDown}
            onClick={onMoveDown}
            aria-label={zh ? "下移" : "Move down"}
            className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold text-primary-dark hover:bg-surface disabled:cursor-not-allowed disabled:opacity-25"
          >
            ▼
          </button>
        </div>
      )}
      {!host && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={zh ? "移除" : "Remove"}
          className="cursor-pointer shrink-0 rounded-lg px-1.5 py-0.5 text-xs font-bold text-stone-400 hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      )}
      {ready && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
          ✓
        </span>
      )}
    </div>
  );
}

export function LobbyView({
  locale,
  lobby,
  shareUrl,
  roomReady = true,
  displayName,
  onDisplayName,
  onAddAi,
  onAddHotseat,
  onStart,
  onReady,
  onMoveSeat,
  onShuffleSeats,
  editions,
  edition,
  onEditionChange,
  stakes,
  onStakesChange,
  maxSeats,
  onRemoveSeat,
}: Props) {
  const zh = locale === "zh";
  const hostId = lobby?.hostPlayerId;
  const seatCount = lobby?.seats.length ?? 0;
  const atCap = maxSeats != null && seatCount >= maxSeats;
  const selectedEdition = editions?.find((e) => e.id === edition);
  const canReorder = Boolean(onMoveSeat) && seatCount > 1;
  const canRemove = Boolean(onRemoveSeat);

  return (
    <div data-testid="play-lobby" className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3E2723]/20 bg-[#efe6d8] shadow-card">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#3E2723]/15 bg-[#5D4037] px-4 py-3 text-amber-50">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-accent">
            {zh ? "大厅" : "Lobby"}
          </p>
          <h2 className="font-heading text-lg font-bold">
            {zh ? "准备开局" : "Ready the table"}
          </h2>
        </div>
        <p className="text-xs text-amber-100/75">
          {zh ? "分享链接或加热座 / AI" : "Share link or add hotseat / AI"}
          {maxSeats != null
            ? zh
              ? ` · 最多 ${maxSeats} 人`
              : ` · max ${maxSeats}`
            : ""}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3 overflow-hidden p-2.5 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:space-y-4 sm:p-4">
          {stakes && (
            <div className="shrink-0 rounded-xl border border-border bg-surface/80 p-3">
              <p className="mb-2 font-heading text-xs font-bold text-stone-500">
                {zh ? "盲注 / 筹码" : "Blinds / Stack"}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["smallBlind", zh ? "小盲" : "SB", stakes.smallBlind],
                    ["bigBlind", zh ? "大盲" : "BB", stakes.bigBlind],
                    [
                      "startingStack",
                      zh ? "起始筹码" : "Stack",
                      stakes.startingStack,
                    ],
                  ] as const
                ).map(([key, label, value]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-stone-500">
                      {label}
                    </span>
                    <input
                      type="number"
                      min={1}
                      disabled={!onStakesChange}
                      className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm disabled:opacity-60"
                      value={value}
                      onChange={(e) =>
                        onStakesChange?.({
                          [key]: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">
                {zh
                  ? "大盲 ≥ 2×小盲；起始筹码 ≥ 20×大盲"
                  : "BB ≥ 2×SB; stack ≥ 20×BB"}
              </p>
            </div>
          )}

          {editions && editions.length > 1 && (
            <div className="shrink-0">
              <p className="mb-1.5 font-heading text-xs font-bold text-stone-500">
                {onEditionChange
                  ? zh
                    ? "选择版本"
                    : "Edition"
                  : zh
                    ? "版本"
                    : "Edition"}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {editions.map((e) => {
                  const active = e.id === edition;
                  if (!onEditionChange) {
                    return (
                      <div
                        key={e.id}
                        className={[
                          "rounded-xl border px-3 py-2.5 text-left",
                          active
                            ? "border-accent bg-amber-50 shadow-sm ring-2 ring-accent/30"
                            : "border-border bg-surface/60 opacity-50",
                        ].join(" ")}
                      >
                        <p className="font-heading text-sm font-bold text-primary-dark">
                          {e.label}
                        </p>
                        {e.hint ? (
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            {e.hint}
                          </p>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onEditionChange(e.id)}
                      className={[
                        "cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-accent bg-amber-50 shadow-sm ring-2 ring-accent/30"
                          : "border-border bg-surface hover:border-accent/40",
                      ].join(" ")}
                    >
                      <p className="font-heading text-sm font-bold text-primary-dark">
                        {e.label}
                      </p>
                      {e.hint ? (
                        <p className="mt-0.5 text-[11px] text-stone-500">
                          {e.hint}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {selectedEdition?.hint ? (
                <p className="mt-1.5 text-[11px] text-stone-400 sm:hidden">
                  {selectedEdition.hint}
                </p>
              ) : null}
            </div>
          )}

          <div className="grid shrink-0 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-heading text-xs font-bold text-stone-500">
                {zh ? "显示名称" : "Display name"}
              </span>
              <input
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                value={displayName}
                onChange={(e) => onDisplayName(e.target.value)}
              />
            </label>
            <div>
              <span className="mb-1 block font-heading text-xs font-bold text-stone-500">
                {zh ? "邀请链接" : "Invite link"}
              </span>
              <div className="flex gap-2">
                <input
                  readOnly
                  disabled={!roomReady}
                  className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-stone-600"
                  value={roomReady ? shareUrl : zh ? "正在创建安全邀请链接…" : "Creating secure invite link…"}
                />
                <button
                  type="button"
                  disabled={!roomReady}
                  className="cursor-pointer shrink-0 rounded-lg bg-accent px-3 py-2.5 font-heading text-xs font-bold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => void navigator.clipboard.writeText(shareUrl)}
                >
                  {zh ? "复制" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          </div>

          <div data-testid="lobby-actions" className="shrink-0 border-t border-border bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAddHotseat}
              disabled={atCap}
              className="min-h-11 cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {zh ? "加热座" : "Hotseat"}
            </button>
            <button
              type="button"
              onClick={onAddAi}
              disabled={atCap}
              className="min-h-11 cursor-pointer rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-heading text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {zh ? "加 AI" : "Add AI"}
            </button>
            <button
              type="button"
              onClick={onReady}
              className="min-h-11 cursor-pointer rounded-lg border border-border px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark hover:bg-primary-light"
            >
              Ready
            </button>
            <button
              type="button"
              onClick={onStart}
              className="ml-auto min-h-11 cursor-pointer rounded-xl bg-accent px-6 py-2.5 font-heading text-sm font-bold text-white shadow-card hover:bg-accent-dark"
            >
              {zh ? "开始游戏" : "Start match"}
            </button>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white/95 p-3 shadow-sm">
          <div className="flex shrink-0 items-center justify-between gap-2 px-0.5 pb-2">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
              {zh ? "行动顺序" : "Turn order"} · {lobby?.seats.length ?? 0}
            </p>
            {onShuffleSeats && seatCount > 1 && (
              <button
                type="button"
                onClick={onShuffleSeats}
                className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1 font-heading text-[10px] font-bold text-primary-dark hover:border-accent/40"
              >
                {zh ? "打乱" : "Shuffle"}
              </button>
            )}
          </div>
          <p className="shrink-0 px-0.5 pb-2 text-[10px] leading-snug text-stone-400">
            {zh
              ? "序号 1 先行动。可用箭头调整座次。"
              : "Seat 1 acts first. Use arrows to reorder."}
          </p>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {(lobby?.seats ?? []).map((s, i) => (
              <SeatCard
                key={s.id}
                index={i}
                name={s.name}
                kind={s.kind}
                ready={s.ready}
                host={s.id === hostId}
                zh={zh}
                canReorder={canReorder}
                onMoveUp={
                  canReorder && i > 0
                    ? () => onMoveSeat?.(s.id, -1)
                    : undefined
                }
                onMoveDown={
                  canReorder && i < seatCount - 1
                    ? () => onMoveSeat?.(s.id, 1)
                    : undefined
                }
                onRemove={
                  canRemove && s.id !== hostId
                    ? () => onRemoveSeat?.(s.id)
                    : undefined
                }
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
