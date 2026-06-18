"use client";

import { useState, useMemo } from "react";
import type { WinMethod, WaitType, PairType, MeldInput, CalcInput } from "@/lib/mahjong/scoring";
import { calculateScore, YAKU_LIST } from "@/lib/mahjong/scoring";
import { YakuSelector } from "./YakuSelector";
import { FuInput } from "./FuInput";
import { ScoreResult } from "./ScoreResult";

interface Props {
  locale: string;
}

export function ScoreCalculator({ locale }: Props) {
  const [isDealer, setIsDealer] = useState(false);
  const [winMethod, setWinMethod] = useState<WinMethod>("ron");
  const [isClosed, setIsClosed] = useState(true);
  const [selectedYaku, setSelectedYaku] = useState<string[]>([]);
  const [melds, setMelds] = useState<MeldInput[]>([]);
  const [pairType, setPairType] = useState<PairType>("normal");
  const [waitType, setWaitType] = useState<WaitType>("ryanmen");

  const handleToggleYaku = (id: string) => {
    setSelectedYaku((prev) =>
      prev.includes(id) ? prev.filter((y) => y !== id) : [...prev, id]
    );
  };

  const handleClosedChange = (closed: boolean) => {
    setIsClosed(closed);
    if (!closed) {
      setSelectedYaku((prev) =>
        prev.filter((id) => {
          const y = YAKU_LIST.find((yaku) => yaku.id === id);
          return y && y.hanOpen !== null;
        })
      );
    }
  };

  const handleReset = () => {
    setIsDealer(false);
    setWinMethod("ron");
    setIsClosed(true);
    setSelectedYaku([]);
    setMelds([]);
    setPairType("normal");
    setWaitType("ryanmen");
  };

  const calcInput: CalcInput = useMemo(() => ({
    isDealer,
    winMethod,
    isClosed,
    yakuIds: selectedYaku,
    fu: { melds, pairType, waitType },
  }), [isDealer, winMethod, isClosed, selectedYaku, melds, pairType, waitType]);

  const result = useMemo(() => {
    if (selectedYaku.length === 0) return null;
    return calculateScore(calcInput);
  }, [calcInput, selectedYaku]);

  return (
    <div className="space-y-6">
      {/* Basic toggles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dealer/Non-dealer */}
        <ToggleGroup
          options={[
            { value: false, label: locale === "zh" ? "闲家" : "Non-dealer" },
            { value: true, label: locale === "zh" ? "庄家" : "Dealer" },
          ]}
          value={isDealer}
          onChange={setIsDealer}
        />
        <div className="h-6 w-px bg-border" />
        {/* Ron/Tsumo */}
        <ToggleGroup
          options={[
            { value: "ron" as WinMethod, label: locale === "zh" ? "荣和" : "Ron" },
            { value: "tsumo" as WinMethod, label: locale === "zh" ? "自摸" : "Tsumo" },
          ]}
          value={winMethod}
          onChange={setWinMethod}
        />
        <div className="h-6 w-px bg-border" />
        {/* Closed/Open */}
        <ToggleGroup
          options={[
            { value: true, label: locale === "zh" ? "门清" : "Closed" },
            { value: false, label: locale === "zh" ? "副露" : "Open" },
          ]}
          value={isClosed}
          onChange={handleClosedChange}
        />
        <div className="h-6 w-px bg-border" />
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface transition-colors"
        >
          {locale === "zh" ? "重置" : "Reset"}
        </button>
      </div>

      {/* Result (sticky at top on scroll) */}
      <ScoreResult result={result} isDealer={isDealer} locale={locale} />

      {/* Two column layout on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Yaku selection */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary-dark">
            {locale === "zh" ? "役种选择" : "Yaku Selection"}
          </h3>
          <YakuSelector
            selectedYaku={selectedYaku}
            isClosed={isClosed}
            locale={locale}
            onToggle={handleToggleYaku}
          />
        </div>

        {/* Fu components */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-primary-dark">
            {locale === "zh" ? "符数组成" : "Fu Components"}
          </h3>
          <div className="rounded-lg border border-border bg-surface p-4">
            <FuInput
              melds={melds}
              pairType={pairType}
              waitType={waitType}
              locale={locale}
              onMeldsChange={setMelds}
              onPairChange={setPairType}
              onWaitChange={setWaitType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Generic toggle group helper
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
