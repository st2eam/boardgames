"use client";

import { useState, useMemo, useCallback } from "react";
import { TILE_COUNT, YAKU_LIST } from "@/lib/mahjong";
import type { Decomposition, AnalysisContext, AnalysisResult } from "@/lib/mahjong";
import { decomposeHand, analyzeHand } from "@/lib/mahjong";
import { isWinningHand } from "@/lib/mahjong";
import { HandPicker } from "./HandPicker";
import { AgariSelector } from "./AgariSelector";
import { MeldMarker } from "./MeldMarker";
import { ScoreResult } from "./ScoreResult";

interface Props {
  locale: string;
}

const WIND_IDS = [27, 28, 29, 30];
const WIND_NAMES = {
  zh: ["东", "南", "西", "北"],
  en: ["East", "South", "West", "North"],
};

const EXTRA_YAKU_IDS = [
  "riichi", "double-riichi", "ippatsu",
  "haitei", "houtei", "rinshan", "chankan",
  "tenhou", "chiihou",
];

export function ScoreCalculator({ locale }: Props) {
  const lang = locale as "en" | "zh";

  // Step 1: Tile selection
  const [hand, setHand] = useState<number[]>(new Array(TILE_COUNT).fill(0));
  // Step 2: Agari tile
  const [agariTile, setAgariTile] = useState<number | null>(null);
  // Step 3: Context
  const [isTsumo, setIsTsumo] = useState(false);
  const [isDealer, setIsDealer] = useState(false);
  const [roundWind, setRoundWind] = useState(27); // East
  const [seatWind, setSeatWind] = useState(27);
  // Step 3b: Open melds
  const [openMeldIndices, setOpenMeldIndices] = useState<Set<number>>(new Set());
  // Step 4: Extra yaku
  const [extraYaku, setExtraYaku] = useState<string[]>([]);

  const totalTiles = hand.reduce((a, b) => a + b, 0);
  const isComplete = totalTiles === 14;

  // Validate that hand is a winning hand
  const isWin = useMemo(() => {
    if (!isComplete) return false;
    return isWinningHand(hand);
  }, [hand, isComplete]);

  // Get all valid decompositions
  const decompositions = useMemo(() => {
    if (!isWin) return [];
    return decomposeHand(hand);
  }, [hand, isWin]);

  // Pick the first standard decomposition for meld marking
  const primaryDecomp: Decomposition | null = useMemo(() => {
    if (decompositions.length === 0) return null;
    return decompositions.find(d => d.type === "standard") ?? decompositions[0];
  }, [decompositions]);

  const handleToggleMeld = useCallback((idx: number) => {
    setOpenMeldIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleToggleExtraYaku = useCallback((id: string) => {
    setExtraYaku(prev =>
      prev.includes(id) ? prev.filter(y => y !== id) : [...prev, id]
    );
  }, []);

  // Run analysis
  const analysisResult: AnalysisResult | null = useMemo(() => {
    if (!isWin || agariTile === null) return null;

    const openMeldTiles: number[][] = [];
    if (primaryDecomp && primaryDecomp.type === "standard") {
      for (const idx of openMeldIndices) {
        const m = primaryDecomp.melds[idx];
        if (m) openMeldTiles.push(m.tiles);
      }
    }

    const ctx: AnalysisContext = {
      agariTile,
      isTsumo,
      isDealer,
      roundWind,
      seatWind,
      extraYaku,
      openMelds: openMeldTiles,
    };

    return analyzeHand(hand, ctx, openMeldTiles);
  }, [hand, isWin, agariTile, isTsumo, isDealer, roundWind, seatWind, extraYaku, openMeldIndices, primaryDecomp]);

  const handleReset = () => {
    setHand(new Array(TILE_COUNT).fill(0));
    setAgariTile(null);
    setIsTsumo(false);
    setIsDealer(false);
    setRoundWind(27);
    setSeatWind(27);
    setOpenMeldIndices(new Set());
    setExtraYaku([]);
  };

  // When hand changes, reset downstream state
  const handleHandChange = (newHand: number[]) => {
    setHand(newHand);
    if (agariTile !== null && newHand[agariTile] === 0) {
      setAgariTile(null);
    }
    setOpenMeldIndices(new Set());
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Pick tiles */}
      <StepSection
        step={1}
        title={lang === "zh" ? "选择手牌" : "Select Hand Tiles"}
        locale={lang}
        done={isComplete}
      >
        <HandPicker hand={hand} maxTiles={14} locale={locale} onHandChange={handleHandChange} />
        {isComplete && !isWin && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {lang === "zh" ? "当前牌型不是和牌形，请调整" : "This hand is not a valid winning hand, please adjust"}
          </div>
        )}
      </StepSection>

      {/* Step 2: Agari tile */}
      {isWin && (
        <StepSection
          step={2}
          title={lang === "zh" ? "选择和牌" : "Select Winning Tile"}
          locale={lang}
          done={agariTile !== null}
        >
          <AgariSelector hand={hand} agariTile={agariTile} locale={locale} onSelect={setAgariTile} />
        </StepSection>
      )}

      {/* Step 3: Context (wind, tsumo/ron, dealer, open melds) */}
      {isWin && agariTile !== null && (
        <StepSection
          step={3}
          title={lang === "zh" ? "对局设置" : "Game Context"}
          locale={lang}
          done
        >
          <div className="space-y-3">
            {/* Toggles row */}
            <div className="flex flex-wrap items-center gap-3">
              <ToggleGroup
                options={[
                  { value: false, label: lang === "zh" ? "荣和" : "Ron" },
                  { value: true, label: lang === "zh" ? "自摸" : "Tsumo" },
                ]}
                value={isTsumo}
                onChange={setIsTsumo}
              />
              <div className="h-6 w-px bg-border" />
              <ToggleGroup
                options={[
                  { value: false, label: lang === "zh" ? "闲家" : "Non-dealer" },
                  { value: true, label: lang === "zh" ? "庄家" : "Dealer" },
                ]}
                value={isDealer}
                onChange={setIsDealer}
              />
            </div>

            {/* Wind selectors */}
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  {lang === "zh" ? "场风" : "Round Wind"}
                </span>
                <div className="flex gap-1">
                  {WIND_IDS.map((wid, i) => (
                    <button
                      key={wid}
                      type="button"
                      onClick={() => setRoundWind(wid)}
                      className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                        roundWind === wid ? "bg-accent text-white" : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
                      }`}
                    >
                      {WIND_NAMES[lang][i]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  {lang === "zh" ? "自风" : "Seat Wind"}
                </span>
                <div className="flex gap-1">
                  {WIND_IDS.map((wid, i) => (
                    <button
                      key={wid}
                      type="button"
                      onClick={() => setSeatWind(wid)}
                      className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                        seatWind === wid ? "bg-accent text-white" : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
                      }`}
                    >
                      {WIND_NAMES[lang][i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Open meld marker */}
            {primaryDecomp && primaryDecomp.type === "standard" && (
              <MeldMarker
                decomposition={primaryDecomp}
                openMeldIndices={openMeldIndices}
                locale={locale}
                onToggleMeld={handleToggleMeld}
              />
            )}
          </div>
        </StepSection>
      )}

      {/* Step 4: Extra yaku checkboxes */}
      {isWin && agariTile !== null && (
        <StepSection
          step={4}
          title={lang === "zh" ? "特殊条件" : "Special Conditions"}
          locale={lang}
          done
        >
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {EXTRA_YAKU_IDS.map(id => {
                const yaku = YAKU_LIST.find(y => y.id === id);
                if (!yaku) return null;
                const isClosed = openMeldIndices.size === 0;
                const disabled = !isClosed && yaku.hanOpen === null;
                const checked = extraYaku.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
                      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-accent/5"
                    } ${checked ? "bg-accent/10 font-medium" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handleToggleExtraYaku(id)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-accent focus:ring-accent/50"
                    />
                    <span className="text-primary-dark">{yaku.name[lang]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </StepSection>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="space-y-4">
          {/* Detected yaku (read-only) */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-primary-dark">
              {lang === "zh" ? "检测到的役种" : "Detected Yaku"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisResult.allYaku.map(id => {
                const yaku = YAKU_LIST.find(y => y.id === id);
                if (!yaku) return null;
                const isAuto = analysisResult.detectedYaku.includes(id);
                return (
                  <span
                    key={id}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                      isAuto
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {yaku.name[lang]}
                    <span className="text-xs opacity-60">
                      {openMeldIndices.size === 0
                        ? `${yaku.han}${lang === "zh" ? "番" : "han"}`
                        : `${yaku.hanOpen ?? yaku.han}${lang === "zh" ? "番" : "han"}`}
                    </span>
                  </span>
                );
              })}
              {analysisResult.allYaku.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {lang === "zh" ? "未检测到役种" : "No yaku detected"}
                </span>
              )}
            </div>
          </div>

          {/* Fu breakdown (read-only) */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-primary-dark">
              {lang === "zh" ? "符数明细" : "Fu Breakdown"}
            </h3>
            <FuBreakdownDisplay result={analysisResult} locale={lang} />
          </div>

          {/* Score result */}
          <ScoreResult result={analysisResult.score} isDealer={isDealer} locale={locale} />
        </div>
      )}

      {/* Not a valid winning hand yet - but tiles complete */}
      {isComplete && isWin && agariTile !== null && !analysisResult && (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-muted-foreground">
          {lang === "zh" ? "未检测到有效役种" : "No valid yaku detected"}
        </div>
      )}

      {/* Reset button */}
      {totalTiles > 0 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface transition-colors"
          >
            {lang === "zh" ? "重置" : "Reset"}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helper components
// ============================================================

function StepSection({ step, title, locale, done, children }: {
  step: number;
  title: string;
  locale: "en" | "zh";
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-green-500 text-white" : "bg-accent text-white"
        }`}>
          {done ? "✓" : step}
        </span>
        <h3 className="text-sm font-semibold text-primary-dark">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ToggleGroup<T>({ options, value, onChange }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden">
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-accent text-white"
              : "bg-surface text-muted-foreground hover:bg-accent/10"
          } ${idx > 0 ? "border-l border-border" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FuBreakdownDisplay({ result, locale }: { result: AnalysisResult; locale: "en" | "zh" }) {
  const items: { label: string; fu: number }[] = [];

  // Base fu
  items.push({
    label: locale === "zh" ? "底符" : "Base",
    fu: 20,
  });

  // Tsumo bonus
  if (result.score.fu > 0) {
    for (const m of result.fuMelds) {
      const meldName = (() => {
        switch (m.type) {
          case "shuntsu": return locale === "zh" ? "顺子" : "Sequence";
          case "minko": return locale === "zh" ? "明刻" : "Open Pon";
          case "anko": return locale === "zh" ? "暗刻" : "Closed Pon";
          case "minkan": return locale === "zh" ? "明杠" : "Open Kan";
          case "ankan": return locale === "zh" ? "暗杠" : "Closed Kan";
        }
      })();
      const termLabel = m.isTerminal ? (locale === "zh" ? "(幺九)" : "(terminal)") : "";
      const base = (() => {
        switch (m.type) {
          case "shuntsu": return 0;
          case "minko": return 4;
          case "anko": return 8;
          case "minkan": return 16;
          case "ankan": return 32;
        }
      })();
      const fu = m.isTerminal ? base * 2 : base;
      if (fu > 0) {
        items.push({ label: `${meldName} ${termLabel}`, fu });
      }
    }

    if (result.pairType === "yakuhai") {
      items.push({
        label: locale === "zh" ? "役牌雀头" : "Yakuhai Pair",
        fu: 2,
      });
    }

    const waitFu = ((): number => {
      switch (result.waitType) {
        case "kanchan": return 2;
        case "penchan": return 2;
        case "tanki": return 2;
        default: return 0;
      }
    })();
    if (waitFu > 0) {
      const waitName = (() => {
        switch (result.waitType) {
          case "kanchan": return locale === "zh" ? "嵌张听" : "Kanchan wait";
          case "penchan": return locale === "zh" ? "边张听" : "Penchan wait";
          case "tanki": return locale === "zh" ? "单骑听" : "Tanki wait";
          default: return "";
        }
      })();
      items.push({ label: waitName, fu: waitFu });
    }
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium text-primary-dark">+{item.fu}</span>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
        <span className="text-primary-dark">{locale === "zh" ? "合计（向上取整至10）" : "Total (rounded up to 10)"}</span>
        <span className="text-accent">{result.score.fu} {locale === "zh" ? "符" : "fu"}</span>
      </div>
    </div>
  );
}
