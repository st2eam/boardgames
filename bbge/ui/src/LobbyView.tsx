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
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card space-y-4">
      <div>
        <label className="text-sm font-medium text-primary-dark">
          {zh ? "你的名字" : "Your name"}
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          value={displayName}
          onChange={(e) => onDisplayName(e.target.value)}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-primary-dark">
          {zh ? "房间链接" : "Room link"}
        </p>
        <div className="mt-1 flex gap-2">
          <input
            readOnly
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-stone-600"
            value={shareUrl}
          />
          <button
            type="button"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
          >
            {zh ? "复制" : "Copy"}
          </button>
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {(lobby?.seats ?? []).map((s) => (
          <li
            key={s.id}
            className="flex justify-between rounded-lg border border-border px-3 py-2"
          >
            <span>
              {s.name}{" "}
              <span className="text-stone-400">
                ({s.kind}
                {s.ready ? " · ready" : ""})
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddHotseat}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          {zh ? "加热座玩家" : "Add hotseat"}
        </button>
        <button
          type="button"
          onClick={onAddAi}
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {zh ? "加 AI 座位" : "Add AI seat"}
        </button>
        <button
          type="button"
          onClick={onReady}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          Ready
        </button>
        <button
          type="button"
          onClick={onStart}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          {zh ? "开始" : "Start"}
        </button>
      </div>
    </div>
  );
}
