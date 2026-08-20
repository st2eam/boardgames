"use client";

import { useState } from "react";
import type { Position, PreflopAction } from "@/lib/texas-holdem";
import { POSITIONS, POSITION_NAMES, CARD_LABELS, POSITION_TABLES, ACTION_NAMES } from "@/lib/texas-holdem";

interface Props {
  locale: string;
}

const ACTION_BG: Record<PreflopAction, string> = {
  R: "bg-green-200 text-green-900",
  F: "bg-stone-100 text-stone-400",
  M: "bg-amber-200 text-amber-900",
};

export function PreflopChart({ locale }: Props) {
  const [position, setPosition] = useState<Position>("UTG");
  const lang = locale as "en" | "zh";
  const table = POSITION_TABLES[position];

  // Count raise hands
  let raiseCount = 0;
  let mixedCount = 0;
  for (const row of table) {
    for (const cell of row) {
      if (cell === "R") raiseCount++;
      if (cell === "M") mixedCount++;
    }
  }
  const totalCells = 169;
  const pct = Math.round(((raiseCount + mixedCount * 0.5) / totalCells) * 100);

  return (
    <div className="space-y-4">
      {/* Position selector */}
      <div className="flex flex-wrap gap-2">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => setPosition(pos)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              position === pos
                ? "bg-accent text-white shadow-sm"
                : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Position info */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-primary-dark">
          {POSITION_NAMES[position][lang]}
        </span>
        <span className="text-muted-foreground">
          {lang === "zh" ? `约 ${pct}% 起手牌` : `~${pct}% of hands`}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(["R", "M", "F"] as PreflopAction[]).map((a) => (
          <div key={a} className="flex items-center gap-1.5">
            <span className={`inline-block h-3.5 w-3.5 rounded ${ACTION_BG[a]}`} />
            <span className="text-muted-foreground">{ACTION_NAMES[a][lang]}</span>
          </div>
        ))}
        <div className="h-4 w-px bg-border" />
        <span className="text-muted-foreground">
          {lang === "zh" ? "对角线↗=同花 / 对角线=对子 / 对角线↙=不同花" : "Above diagonal=suited / Diagonal=pair / Below=offsuit"}
        </span>
      </div>

      {/* 13x13 grid */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-stone-50">
              <th className="px-1.5 py-1 text-center font-medium text-muted-foreground border-b border-r border-border w-8" />
              {CARD_LABELS.map((label) => (
                <th key={label} className="px-1.5 py-1 text-center font-medium text-muted-foreground border-b border-border min-w-[2rem]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CARD_LABELS.map((rowLabel, rowIdx) => (
              <tr key={rowLabel} className="border-b border-border last:border-b-0">
                <td className="px-1.5 py-1 font-medium text-primary-dark border-r border-border text-center">
                  {rowLabel}
                </td>
                {CARD_LABELS.map((colLabel, colIdx) => {
                  const action = table[rowIdx][colIdx];
                  const isPair = rowIdx === colIdx;
                  const isSuited = rowIdx < colIdx;
                  const handLabel = isPair
                    ? `${rowLabel}${colLabel}`
                    : `${isSuited ? rowLabel : colLabel}${isSuited ? colLabel : rowLabel}${isSuited ? "s" : "o"}`;

                  return (
                    <td
                      key={colIdx}
                      className={`px-0.5 py-0.5 text-center font-bold ${ACTION_BG[action]} ${isPair ? "ring-1 ring-inset ring-stone-300" : ""}`}
                      title={`${handLabel}: ${ACTION_NAMES[action][lang]}`}
                    >
                      <span className="text-[10px] leading-none">{handLabel}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sizing info */}
      <div className="rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground space-y-1">
        <div className="font-medium text-primary-dark text-sm">
          {lang === "zh" ? "推荐加注尺度" : "Recommended Open Sizing"}
        </div>
        <div>
          {lang === "zh"
            ? "• UTG / HJ / CO：2.5bb"
            : "• UTG / HJ / CO: 2.5bb"}
        </div>
        <div>
          {lang === "zh"
            ? "• BTN：2-2.5bb"
            : "• BTN: 2-2.5bb"}
        </div>
        <div>
          {lang === "zh"
            ? "• SB：3bb（对大盲收取溢价）"
            : "• SB: 3bb (charge BB a premium)"}
        </div>
        <div className="pt-1 text-[10px] opacity-70">
          {lang === "zh"
            ? "* 仅适用于 RFI（你前面所有人弃牌）。面对加注请使用 3-bet 策略。"
            : "* RFI only (folded to you). Against opens, use 3-bet strategy."}
        </div>
      </div>
    </div>
  );
}
