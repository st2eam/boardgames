"use client";

import type { Action } from "@/lib/blackjack";
import { HARD_TABLE, SOFT_TABLE, PAIR_TABLE, ACTION_NAMES } from "@/lib/blackjack";

interface Props {
  locale: string;
}

const DEALER_COLS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

const ACTION_BG: Record<Action, string> = {
  H: "bg-green-200 text-green-900",
  S: "bg-red-200 text-red-900",
  D: "bg-amber-200 text-amber-900",
  P: "bg-blue-200 text-blue-900",
};

function StrategyTable({ title, table, rowLabels }: {
  title: string;
  table: Record<number, Action[]>;
  rowLabels: { key: number; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-primary-dark">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-stone-50">
              <th className="px-2 py-1.5 text-left font-medium text-muted-foreground border-b border-r border-border" />
              {DEALER_COLS.map((col) => (
                <th key={col} className="px-2 py-1.5 text-center font-medium text-muted-foreground border-b border-border min-w-[28px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map(({ key, label }) => (
              <tr key={key} className="border-b border-border last:border-b-0">
                <td className="px-2 py-1 font-medium text-primary-dark border-r border-border whitespace-nowrap">
                  {label}
                </td>
                {table[key]?.map((action, idx) => (
                  <td key={idx} className={`px-1 py-1 text-center font-bold ${ACTION_BG[action]}`}>
                    {action}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StrategyChart({ locale }: Props) {
  const lang = locale as "en" | "zh";

  const hardRows = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
    key: n,
    label: String(n),
  }));

  const softRows = [13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
    key: n,
    label: `A+${n - 11}`,
  }));

  const pairLabels: Record<number, string> = { 2: "2,2", 3: "3,3", 4: "4,4", 5: "5,5", 6: "6,6", 7: "7,7", 8: "8,8", 9: "9,9", 10: "10,10", 11: "A,A" };
  const pairRows = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
    key: n,
    label: pairLabels[n],
  }));

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(["H", "S", "D", "P"] as Action[]).map((a) => (
          <span key={a} className={`rounded px-2 py-0.5 font-bold ${ACTION_BG[a]}`}>
            {a} = {ACTION_NAMES[a][lang]}
          </span>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {locale === "zh"
          ? "行 = 玩家手牌，列 = 庄家明牌"
          : "Rows = Player hand, Columns = Dealer upcard"}
      </p>

      <StrategyTable
        title={locale === "zh" ? "硬牌 (Hard Totals)" : "Hard Totals"}
        table={HARD_TABLE}
        rowLabels={hardRows}
      />
      <StrategyTable
        title={locale === "zh" ? "软牌 (Soft Totals)" : "Soft Totals"}
        table={SOFT_TABLE}
        rowLabels={softRows}
      />
      <StrategyTable
        title={locale === "zh" ? "对子 (Pairs)" : "Pairs"}
        table={PAIR_TABLE}
        rowLabels={pairRows}
      />
    </div>
  );
}
