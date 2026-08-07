"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { LoveLetterAction } from "../state";
import {
  LoveLetterPixiArena,
  type ArenaView,
} from "./LoveLetterPixiArena";
import { LoveLetterArenaHud } from "./LoveLetterArenaHud";

interface Props {
  locale: string;
  view: unknown;
  myId: string;
  hotseat: boolean;
  disabled?: boolean;
  thinkingId?: string | null;
  onAction: (action: LoveLetterAction) => void;
  /** Table talk panel — rendered beside the action bar, not over the felt */
  overlay?: ReactNode;
}

export function LoveLetterTable({
  locale,
  view: viewUnknown,
  myId,
  hotseat,
  disabled,
  thinkingId,
  onAction,
  overlay,
}: Props) {
  const view = viewUnknown as ArenaView;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [guessRank, setGuessRank] = useState(9);

  const actorId = hotseat ? view.currentPlayerId : myId;
  const isMyTurn =
    view.currentPlayerId === actorId && view.phase === "playing";
  const interactive = Boolean(isMyTurn && !disabled);

  const size = useMemo(() => {
    if (typeof window === "undefined") return { width: 900, height: 640 };
    const w = Math.min(960, Math.max(320, window.innerWidth - 48));
    // Extra height for opponent strip + felt + own hand band
    const h = Math.min(720, Math.max(560, Math.round(window.innerHeight * 0.6)));
    return { width: w, height: h };
  }, []);

  const confirmPlay = () => {
    if (!selectedCardId) return;
    onAction({
      type: "playCard",
      playerId: actorId,
      payload: {
        cardId: selectedCardId,
        targetId: selectedTargetId ?? undefined,
        guessRank:
          view.you?.hand.find((c) => c.id === selectedCardId)?.rank === 1
            ? guessRank
            : undefined,
      },
    });
    setSelectedCardId(null);
    setSelectedTargetId(null);
  };

  const chancellorKeep = (cardId: string) => {
    const held = view.pending?.held ?? [];
    if (!held.some((c) => c.id === cardId)) return;
    const rest = held.filter((c) => c.id !== cardId);
    onAction({
      type: "resolveChancellor",
      playerId: actorId,
      payload: {
        keepCardId: cardId,
        bottomOrderIds: rest.map((c) => c.id),
      },
    });
    setSelectedCardId(null);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-3" style={{ maxWidth: size.width }}>
      <LoveLetterPixiArena
        locale={locale}
        view={view}
        selectedCardId={selectedCardId}
        selectedTargetId={selectedTargetId}
        thinkingId={thinkingId}
        interactive={interactive}
        onSelectCard={setSelectedCardId}
        onSelectTarget={setSelectedTargetId}
        width={size.width}
        height={size.height}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <LoveLetterArenaHud
            locale={locale}
            view={view}
            actorId={actorId}
            isMyTurn={isMyTurn}
            selectedCardId={selectedCardId}
            selectedTargetId={selectedTargetId}
            guessRank={guessRank}
            disabled={disabled}
            onGuessRank={setGuessRank}
            onConfirmPlay={confirmPlay}
            onChancellorKeep={chancellorKeep}
            onSelfTarget={() => setSelectedTargetId(actorId)}
          />
        </div>
        {overlay ? (
          <div className="w-full shrink-0 sm:w-64">{overlay}</div>
        ) : null}
      </div>
    </div>
  );
}
