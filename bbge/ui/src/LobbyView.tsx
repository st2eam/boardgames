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
  displayName: string;
  onDisplayName: (v: string) => void;
  onAddAi: () => void;
  onAddHotseat: () => void;
  onStart: () => void;
  onReady: () => void;
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
}

function SeatCard({
  name,
  kind,
  ready,
  host,
}: {
  name: string;
  kind: "human" | "ai";
  ready: boolean;
  host?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm">
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full font-heading text-sm font-bold text-white",
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
          {host ? "Host · " : ""}
          {kind === "ai" ? "AI" : "Human"}
          {ready ? " · Ready" : ""}
        </p>
      </div>
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
  displayName,
  onDisplayName,
  onAddAi,
  onAddHotseat,
  onStart,
  onReady,
  editions,
  edition,
  onEditionChange,
  stakes,
  onStakesChange,
  maxSeats,
}: Props) {
  const zh = locale === "zh";
  const hostId = lobby?.hostPlayerId;
  const seatCount = lobby?.seats.length ?? 0;
  const atCap = maxSeats != null && seatCount >= maxSeats;
  const selectedEdition = editions?.find((e) => e.id === edition);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#3E2723]/20 bg-[#efe6d8] shadow-card">
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

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 flex-col space-y-4 overflow-y-auto rounded-2xl border border-border bg-white/95 p-4 shadow-sm">
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
                  className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-stone-600"
                  value={shareUrl}
                />
                <button
                  type="button"
                  className="cursor-pointer shrink-0 rounded-lg bg-accent px-3 py-2.5 font-heading text-xs font-bold text-white hover:bg-accent-dark"
                  onClick={() => void navigator.clipboard.writeText(shareUrl)}
                >
                  {zh ? "复制" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onAddHotseat}
              disabled={atCap}
              className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {zh ? "加热座" : "Hotseat"}
            </button>
            <button
              type="button"
              onClick={onAddAi}
              disabled={atCap}
              className="cursor-pointer rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-heading text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {zh ? "加 AI" : "Add AI"}
            </button>
            <button
              type="button"
              onClick={onReady}
              className="cursor-pointer rounded-lg border border-border px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark hover:bg-primary-light"
            >
              Ready
            </button>
            <button
              type="button"
              onClick={onStart}
              className="ml-auto cursor-pointer rounded-xl bg-accent px-6 py-2.5 font-heading text-sm font-bold text-white shadow-card hover:bg-accent-dark"
            >
              {zh ? "开始游戏" : "Start match"}
            </button>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white/95 p-3 shadow-sm">
          <p className="shrink-0 px-0.5 pb-2 font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
            {zh ? "座位" : "Seats"} · {lobby?.seats.length ?? 0}
          </p>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {(lobby?.seats ?? []).map((s) => (
              <SeatCard
                key={s.id}
                name={s.name}
                kind={s.kind}
                ready={s.ready}
                host={s.id === hostId}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
