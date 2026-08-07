"use client";

import type { LobbyState } from "@bbge/runtime";

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
    <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4 shadow-card transition-colors duration-200 hover:border-accent/40">
      <div
        className={[
          "flex h-14 w-14 items-center justify-center rounded-full font-heading text-lg font-bold text-white shadow-md",
          kind === "ai"
            ? "bg-linear-to-br from-emerald-500 to-teal-700"
            : "bg-linear-to-br from-primary to-primary-dark",
        ].join(" ")}
      >
        {kind === "ai" ? (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.3 48.3 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
      </div>
      <p className="max-w-[6rem] truncate font-heading text-sm font-bold text-primary-dark">
        {name}
      </p>
      <div className="flex flex-wrap justify-center gap-1">
        {host && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
            Host
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            kind === "ai"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-primary-light text-primary"
          }`}
        >
          {kind === "ai" ? "AI" : "Human"}
        </span>
        {ready && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
            Ready
          </span>
        )}
      </div>
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
}: Props) {
  const zh = locale === "zh";
  const hostId = lobby?.hostPlayerId;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      <div className="bg-linear-to-br from-primary via-primary-dark to-[#2a1814] px-5 py-6 text-amber-50 sm:px-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
          {zh ? "大厅" : "Lobby"}
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold">
          {zh ? "准备开局" : "Ready the table"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-amber-100/80">
          {zh
            ? "分享链接邀请好友，或添加热座 / AI 座位。"
            : "Share a link for friends, or add hotseat / AI seats."}
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-heading text-sm font-semibold text-primary-dark">
              {zh ? "显示名称" : "Display name"}
            </span>
            <input
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm transition-colors duration-200 focus:border-accent"
              value={displayName}
              onChange={(e) => onDisplayName(e.target.value)}
            />
          </label>
          <div>
            <span className="mb-1.5 block font-heading text-sm font-semibold text-primary-dark">
              {zh ? "邀请链接" : "Invite link"}
            </span>
            <div className="flex gap-2">
              <input
                readOnly
                className="min-w-0 flex-1 truncate rounded-xl border border-border bg-surface px-3 py-3 text-xs text-stone-600"
                value={shareUrl}
              />
              <button
                type="button"
                className="cursor-pointer shrink-0 rounded-xl bg-accent px-4 py-3 font-heading text-sm font-bold text-white transition-colors duration-200 hover:bg-accent-dark"
                onClick={() => void navigator.clipboard.writeText(shareUrl)}
              >
                {zh ? "复制" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 font-heading text-sm font-semibold text-primary-dark">
            {zh ? "座位" : "Seats"} · {lobby?.seats.length ?? 0}
          </p>
          <div className="flex flex-wrap gap-3">
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
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          <button
            type="button"
            onClick={onAddHotseat}
            className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark transition-colors duration-200 hover:border-accent/50"
          >
            {zh ? "加热座" : "Hotseat"}
          </button>
          <button
            type="button"
            onClick={onAddAi}
            className="cursor-pointer rounded-xl border border-emerald-300/80 bg-emerald-50 px-4 py-2.5 font-heading text-sm font-semibold text-emerald-800 transition-colors duration-200 hover:bg-emerald-100"
          >
            {zh ? "加 AI" : "Add AI"}
          </button>
          <button
            type="button"
            onClick={onReady}
            className="cursor-pointer rounded-xl border border-border px-4 py-2.5 font-heading text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary-light"
          >
            Ready
          </button>
          <button
            type="button"
            onClick={onStart}
            className="ml-auto cursor-pointer rounded-xl bg-accent px-6 py-2.5 font-heading text-sm font-bold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark"
          >
            {zh ? "开始游戏" : "Start match"}
          </button>
        </div>
      </div>
    </div>
  );
}
