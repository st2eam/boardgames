"use client";

import type { YakuDef } from "@/lib/mahjong/scoring";
import { getYakuGroups } from "@/lib/mahjong/scoring";

interface Props {
  selectedYaku: string[];
  isClosed: boolean;
  locale: string;
  onToggle: (id: string) => void;
}

export function YakuSelector({ selectedYaku, isClosed, locale, onToggle }: Props) {
  const groups = getYakuGroups();
  const lang = locale as "en" | "zh";

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.han} className="rounded-lg border border-border bg-surface p-3">
          <h4 className="mb-2 text-sm font-semibold text-primary-dark">
            {group.label[lang]}
          </h4>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {group.yaku.map((yaku: YakuDef) => {
              const disabled = !isClosed && yaku.hanOpen === null;
              const checked = selectedYaku.includes(yaku.id);
              return (
                <label
                  key={yaku.id}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:bg-accent/5"
                  } ${checked ? "bg-accent/10 font-medium" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(yaku.id)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-accent focus:ring-accent/50"
                  />
                  <span className="text-primary-dark">{yaku.name[lang]}</span>
                  {!isClosed && yaku.hanOpen !== null && yaku.hanOpen !== yaku.han && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({yaku.hanOpen}{locale === "zh" ? "番" : " han"})
                    </span>
                  )}
                  {disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {locale === "zh" ? "门清限定" : "Closed only"}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
