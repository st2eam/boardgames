"use client";

import { useMemo, useState } from "react";
import type { LoveLetterAction } from "../state";

type CardV = { id: string; rank: number; name?: { en: string; zh: string } };
type View = {
  phase: string;
  winners: string[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: CardV[];
  pending: {
    type: string;
    playerId: string;
    held?: CardV[];
  } | null;
  you: {
    id: string;
    hand: CardV[];
    eliminated: boolean;
    protected: boolean;
  } | null;
  others: {
    id: string;
    name: string;
    handCount: number;
    discarded: CardV[];
    eliminated: boolean;
    protected: boolean;
  }[];
};

interface Props {
  locale: string;
  view: unknown;
  myId: string;
  hotseat: boolean;
  disabled?: boolean;
  onAction: (action: LoveLetterAction) => void;
}

function label(c: CardV, locale: string) {
  const n = c.name?.[locale === "zh" ? "zh" : "en"] ?? String(c.rank);
  return `${c.rank} ${n}`;
}

export function LoveLetterTable({
  locale,
  view: viewUnknown,
  myId,
  hotseat,
  disabled,
  onAction,
}: Props) {
  const view = viewUnknown as View;
  const zh = locale === "zh";
  const [selected, setSelected] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [guessRank, setGuessRank] = useState(9);

  const actorId = hotseat ? view.currentPlayerId : myId;
  const isMyTurn = view.currentPlayerId === actorId && view.phase === "playing";

  const hand = useMemo(() => {
    if (hotseat) {
      // host hotseat: we only have projectView for myId — need current player's hand
      // PlayShell passes view for myId; for hotseat switch view externally.
      return view.you?.id === actorId ? view.you.hand : view.you?.hand ?? [];
    }
    return view.you?.hand ?? [];
  }, [view, hotseat, actorId]);

  if (view.phase === "finished") {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 shadow-card text-center">
        <p className="font-heading text-xl font-bold text-primary-dark">
          {zh ? "本局结束" : "Round over"}
        </p>
        <p className="mt-2 text-stone-600">
          {zh ? "胜者：" : "Winners: "}
          {view.winners.join(", ")}
        </p>
      </div>
    );
  }

  if (view.pending?.type === "chancellor" && view.pending.playerId === actorId) {
    const held = view.pending.held ?? [];
    return (
      <div className="rounded-2xl border border-border bg-white p-4 shadow-card space-y-3">
        <p className="font-medium">
          {zh ? "大臣：保留一张，其余放回牌底" : "Chancellor: keep one card"}
        </p>
        <div className="flex flex-wrap gap-2">
          {held.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm"
              onClick={() => {
                const rest = held.filter((x) => x.id !== c.id);
                if (rest.length < 2) return;
                onAction({
                  type: "resolveChancellor",
                  playerId: actorId,
                  payload: {
                    keepCardId: c.id,
                    bottomOrderIds: [rest[0]!.id, rest[1]!.id],
                  },
                });
              }}
            >
              {label(c, locale)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const needsTarget = (() => {
    const c = hand.find((x) => x.id === selected);
    return c && [1, 2, 3, 5, 7].includes(c.rank);
  })();

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card space-y-4">
      <div className="flex flex-wrap gap-3 text-sm text-stone-600">
        <span>
          {zh ? "牌堆" : "Deck"}: {view.deckCount}
        </span>
        <span>
          {zh ? "当前" : "Turn"}: {view.currentPlayerId}
          {isMyTurn ? (zh ? "（你的回合）" : " (you)") : ""}
        </span>
      </div>

      {view.faceUp.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 mb-1">
            {zh ? "公开移出牌" : "Face-up removed"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {view.faceUp.map((c) => (
              <span
                key={c.id}
                className="rounded border border-border px-2 py-1 text-xs"
              >
                {label(c, locale)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {view.others.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={!needsTarget || o.eliminated || o.protected}
            onClick={() => setTargetId(o.id)}
            className={`rounded-xl border px-3 py-2 text-left text-sm ${
              targetId === o.id ? "border-accent bg-accent/10" : "border-border"
            } ${o.eliminated ? "opacity-40" : ""}`}
          >
            <div className="font-medium">{o.name}</div>
            <div className="text-xs text-stone-500">
              {o.eliminated
                ? zh
                  ? "出局"
                  : "out"
                : o.protected
                  ? zh
                    ? "侍女保护"
                    : "protected"
                  : `${zh ? "手牌" : "hand"} ${o.handCount}`}
            </div>
          </button>
        ))}
        {needsTarget &&
          hand.find((c) => c.id === selected)?.rank === 5 && (
            <button
              type="button"
              onClick={() => setTargetId(actorId)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                targetId === actorId
                  ? "border-accent bg-accent/10"
                  : "border-border"
              }`}
            >
              {zh ? "自己" : "Self"}
            </button>
          )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">
          {zh ? "手牌" : "Hand"}
          {hotseat ? ` (${actorId})` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {(view.you?.hand ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={disabled || !isMyTurn}
              onClick={() => setSelected(c.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                selected === c.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface"
              }`}
            >
              {label(c, locale)}
            </button>
          ))}
        </div>
      </div>

      {selected &&
        hand.find((c) => c.id === selected)?.rank === 1 && (
          <label className="block text-sm">
            {zh ? "猜测点数（非守卫）" : "Guess rank (not Guard)"}
            <select
              className="mt-1 rounded-lg border border-border px-2 py-1"
              value={guessRank}
              onChange={(e) => setGuessRank(Number(e.target.value))}
            >
              {[0, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

      <button
        type="button"
        disabled={disabled || !isMyTurn || !selected}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        onClick={() => {
          if (!selected) return;
          onAction({
            type: "playCard",
            playerId: actorId,
            payload: {
              cardId: selected,
              targetId: targetId ?? undefined,
              guessRank:
                hand.find((c) => c.id === selected)?.rank === 1
                  ? guessRank
                  : undefined,
            },
          });
          setSelected(null);
          setTargetId(null);
        }}
      >
        {zh ? "出牌" : "Play card"}
      </button>
    </div>
  );
}
