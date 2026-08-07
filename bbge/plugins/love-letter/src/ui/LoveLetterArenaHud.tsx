"use client";

import { motion, AnimatePresence } from "motion/react";
import type { LoveLetterAction } from "../state";
import type { ArenaView } from "./LoveLetterPixiArena";

interface Props {
  locale: string;
  view: ArenaView;
  actorId: string;
  isMyTurn: boolean;
  selectedCardId: string | null;
  selectedTargetId: string | null;
  guessRank: number;
  disabled?: boolean;
  onGuessRank: (r: number) => void;
  onConfirmPlay: () => void;
  onChancellorKeep: (cardId: string) => void;
  onSelfTarget: () => void;
}

function cardRank(
  view: ArenaView,
  cardId: string | null,
): number | undefined {
  if (!cardId) return undefined;
  const fromHand = view.you?.hand.find((c) => c.id === cardId)?.rank;
  if (fromHand !== undefined) return fromHand;
  return view.pending?.held?.find((c) => c.id === cardId)?.rank;
}

export function LoveLetterArenaHud({
  locale,
  view,
  actorId,
  isMyTurn,
  selectedCardId,
  selectedTargetId,
  guessRank,
  disabled,
  onGuessRank,
  onConfirmPlay,
  onChancellorKeep,
  onSelfTarget,
}: Props) {
  const zh = locale === "zh";
  const rank = cardRank(view, selectedCardId);
  const needsTarget = rank !== undefined && [1, 2, 3, 5, 7].includes(rank);
  const needsGuess = rank === 1;
  const canPlay =
    isMyTurn &&
    selectedCardId &&
    !disabled &&
    (!needsTarget || selectedTargetId) &&
    view.pending?.type !== "chancellor";

  if (view.phase === "finished") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto absolute inset-x-0 bottom-6 flex justify-center px-4"
      >
        <div className="rounded-2xl border border-accent/40 bg-primary-dark/95 px-6 py-4 text-center shadow-dialog backdrop-blur-md">
          <p className="font-heading text-lg font-bold text-accent">
            {zh ? "本局结束" : "Round over"}
          </p>
          <p className="mt-1 font-heading text-sm text-amber-50">
            {zh ? "胜者" : "Winners"} · {view.winners.join(" · ")}
          </p>
        </div>
      </motion.div>
    );
  }

  if (view.pending?.type === "chancellor" && view.pending.playerId === actorId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4"
      >
        <p className="rounded-full bg-black/55 px-4 py-1.5 font-heading text-sm font-semibold text-amber-50 backdrop-blur">
          {zh ? "大臣：点选牌桌中央要保留的牌" : "Chancellor: tap a center card to keep"}
        </p>
        {selectedCardId && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChancellorKeep(selectedCardId)}
            className="cursor-pointer rounded-2xl bg-accent px-6 py-3 font-heading text-sm font-bold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark disabled:opacity-40"
          >
            {zh ? "确认保留" : "Keep this card"}
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-3 pb-3 pt-8">
      <AnimatePresence>
        {isMyTurn && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-full bg-black/50 px-4 py-1 font-heading text-xs font-semibold text-amber-50 backdrop-blur"
          >
            {zh ? "点选手牌 → 点对手（如需）→ 打出" : "Select card → target if needed → Play"}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
        {needsTarget && rank === 5 && (
          <button
            type="button"
            onClick={onSelfTarget}
            className={`cursor-pointer rounded-xl px-3 py-2 font-heading text-xs font-bold transition-colors duration-200 ${
              selectedTargetId === actorId
                ? "bg-accent text-white"
                : "bg-white/90 text-primary-dark hover:bg-white"
            }`}
          >
            {zh ? "目标：自己" : "Target self"}
          </button>
        )}

        {needsGuess &&
          [0, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onGuessRank(r)}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-heading text-sm font-bold transition-colors duration-200 ${
                guessRank === r
                  ? "bg-accent text-white"
                  : "bg-white/90 text-primary-dark hover:bg-white"
              }`}
            >
              {r}
            </button>
          ))}

        <motion.button
          type="button"
          disabled={!canPlay}
          whileTap={canPlay ? { scale: 0.97 } : undefined}
          onClick={onConfirmPlay}
          className="cursor-pointer rounded-2xl bg-accent px-7 py-3 font-heading text-sm font-bold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-35"
        >
          {zh ? "打出此牌" : "Play card"}
        </motion.button>
      </div>
    </div>
  );
}

export type { LoveLetterAction };
