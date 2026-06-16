"use client";

import type { PlayerScore } from "@/lib/score/score-storage";
import type { ScoreConfig } from "@/types/game";

interface Props {
  players: PlayerScore[];
  config: ScoreConfig;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRename: (index: number, name: string) => void;
  t: (key: string) => string;
}

export function PlayerSetup({ players, config, onAdd, onRemove, onRename, t }: Props) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-700">{t("players")}</h3>
        <button
          onClick={onAdd}
          disabled={players.length >= config.players.max}
          className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          + {t("addPlayer")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-2 py-1.5"
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <input
              value={p.name}
              onChange={(e) => onRename(i, e.target.value)}
              className="w-16 border-none bg-transparent text-xs font-medium text-stone-800 outline-none focus:ring-0 p-0"
              maxLength={10}
            />
            {players.length > config.players.min && (
              <button
                onClick={() => onRemove(i)}
                className="text-stone-300 hover:text-red-400 transition-colors"
                aria-label="Remove"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
