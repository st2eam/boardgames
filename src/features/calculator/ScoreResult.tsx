"use client";

import type { ScoreBreakdown } from "@/lib/mahjong/scoring";
import { LEVEL_NAMES } from "@/lib/mahjong/scoring";

interface Props {
  result: ScoreBreakdown | null;
  isDealer: boolean;
  locale: string;
}

export function ScoreResult({ result, isDealer, locale }: Props) {
  const lang = locale as "en" | "zh";

  if (!result || result.han === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-muted-foreground">
        {locale === "zh" ? "请选择至少一个役种" : "Select at least one yaku to calculate"}
      </div>
    );
  }

  const levelName = LEVEL_NAMES[result.level as keyof typeof LEVEL_NAMES];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{result.han}</div>
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "番" : "Han"}</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-dark">{result.fu}</div>
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "符" : "Fu"}</div>
          </div>
        </div>
        {result.level !== "normal" && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            {levelName[lang]}
          </span>
        )}
      </div>

      {/* Points detail */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-primary-dark">
          {locale === "zh" ? "点数明细" : "Points Breakdown"}
        </h4>
        {isDealer ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="text-xs text-amber-700 mb-1">
                {locale === "zh" ? "庄家·自摸" : "Dealer Tsumo"}
              </div>
              <div className="text-lg font-bold text-amber-900">
                {result.dealerTsumo.toLocaleString()} <span className="text-xs font-normal">× 3</span>
              </div>
              <div className="text-xs text-amber-600">
                {locale === "zh" ? "总计" : "Total"}: {(result.dealerTsumo * 3).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="text-xs text-amber-700 mb-1">
                {locale === "zh" ? "庄家·荣和" : "Dealer Ron"}
              </div>
              <div className="text-lg font-bold text-amber-900">
                {result.dealerRon.toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="text-xs text-blue-700 mb-1">
                {locale === "zh" ? "闲家·自摸" : "Non-dealer Tsumo"}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm text-blue-900">
                  <span className="font-bold">{result.nonDealerTsumoDealer.toLocaleString()}</span>
                  <span className="text-xs ml-1">({locale === "zh" ? "庄付" : "dealer"})</span>
                </div>
                <div className="text-sm text-blue-900">
                  <span className="font-bold">{result.nonDealerTsumoNonDealer.toLocaleString()}</span>
                  <span className="text-xs ml-1">× 2 ({locale === "zh" ? "闲付" : "non-dealer"})</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {locale === "zh" ? "总计" : "Total"}: {(result.nonDealerTsumoDealer + result.nonDealerTsumoNonDealer * 2).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="text-xs text-blue-700 mb-1">
                {locale === "zh" ? "闲家·荣和" : "Non-dealer Ron"}
              </div>
              <div className="text-lg font-bold text-blue-900">
                {result.nonDealerRon.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
