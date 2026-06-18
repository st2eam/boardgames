"use client";

import type { MeldType, WaitType, PairType, MeldInput } from "@/lib/mahjong/scoring";

interface Props {
  melds: MeldInput[];
  pairType: PairType;
  waitType: WaitType;
  locale: string;
  onMeldsChange: (melds: MeldInput[]) => void;
  onPairChange: (pairType: PairType) => void;
  onWaitChange: (waitType: WaitType) => void;
}

const MELD_TYPES: { value: MeldType; label: { en: string; zh: string } }[] = [
  { value: "shuntsu", label: { en: "Shuntsu (seq)", zh: "顺子" } },
  { value: "minko", label: { en: "Open Pon", zh: "明刻" } },
  { value: "anko", label: { en: "Closed Pon", zh: "暗刻" } },
  { value: "minkan", label: { en: "Open Kan", zh: "明杠" } },
  { value: "ankan", label: { en: "Closed Kan", zh: "暗杠" } },
];

const WAIT_TYPES: { value: WaitType; label: { en: string; zh: string }; fu: number }[] = [
  { value: "ryanmen", label: { en: "Ryanmen (open)", zh: "两面" }, fu: 0 },
  { value: "shanpon", label: { en: "Shanpon (pair)", zh: "双碰" }, fu: 0 },
  { value: "kanchan", label: { en: "Kanchan (middle)", zh: "嵌张" }, fu: 2 },
  { value: "penchan", label: { en: "Penchan (edge)", zh: "边张" }, fu: 2 },
  { value: "tanki", label: { en: "Tanki (single)", zh: "单骑" }, fu: 2 },
];

export function FuInput({ melds, pairType, waitType, locale, onMeldsChange, onPairChange, onWaitChange }: Props) {
  const lang = locale as "en" | "zh";

  const handleMeldTypeChange = (idx: number, type: MeldType) => {
    const updated = [...melds];
    updated[idx] = { ...updated[idx], type };
    onMeldsChange(updated);
  };

  const handleMeldTerminalChange = (idx: number, isTerminal: boolean) => {
    const updated = [...melds];
    updated[idx] = { ...updated[idx], isTerminal };
    onMeldsChange(updated);
  };

  const addMeld = () => {
    if (melds.length < 4) {
      onMeldsChange([...melds, { type: "shuntsu", isTerminal: false }]);
    }
  };

  const removeMeld = (idx: number) => {
    onMeldsChange(melds.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Melds */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-dark">
            {locale === "zh" ? "面子" : "Melds"}
          </span>
          {melds.length < 4 && (
            <button
              type="button"
              onClick={addMeld}
              className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              + {locale === "zh" ? "添加" : "Add"}
            </button>
          )}
        </div>
        {melds.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {locale === "zh" ? "点击\"添加\"添加面子（顺子无符数可不添加）" : "Click \"Add\" to add melds (sequences have 0 fu, optional)"}
          </p>
        )}
        <div className="space-y-2">
          {melds.map((meld, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded border border-border bg-white p-2">
              <select
                value={meld.type}
                onChange={(e) => handleMeldTypeChange(idx, e.target.value as MeldType)}
                className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {MELD_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label[lang]}
                  </option>
                ))}
              </select>
              {meld.type !== "shuntsu" && (
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={meld.isTerminal}
                    onChange={(e) => handleMeldTerminalChange(idx, e.target.checked)}
                    className="h-3 w-3 rounded border-stone-300 text-accent"
                  />
                  {locale === "zh" ? "幺九" : "Terminal"}
                </label>
              )}
              <button
                type="button"
                onClick={() => removeMeld(idx)}
                className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pair type */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-primary-dark">
          {locale === "zh" ? "雀头" : "Pair"}
        </span>
        <div className="flex gap-2">
          {(["normal", "yakuhai"] as PairType[]).map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => onPairChange(pt)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                pairType === pt
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {pt === "normal"
                ? (locale === "zh" ? "普通" : "Normal")
                : (locale === "zh" ? "役牌" : "Yakuhai")}
            </button>
          ))}
        </div>
      </div>

      {/* Wait type */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-primary-dark">
          {locale === "zh" ? "听牌形" : "Wait Type"}
        </span>
        <div className="flex flex-wrap gap-2">
          {WAIT_TYPES.map((wt) => (
            <button
              key={wt.value}
              type="button"
              onClick={() => onWaitChange(wt.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                waitType === wt.value
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {wt.label[lang]}
              {wt.fu > 0 && <span className="ml-1 text-xs opacity-70">+{wt.fu}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
