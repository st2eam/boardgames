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
  /** Floating chrome (e.g. table talk) over the felt */
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
    if (typeof window === "undefined") return { width: 900, height: 560 };
    const w = Math.min(960, Math.max(320, window.innerWidth - 48));
    const h = Math.min(640, Math.max(420, Math.round(window.innerHeight * 0.62)));
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
    const rest = held.filter((c) => c.id !== cardId);
    if (rest.length < 2) return;
    onAction({
      type: "resolveChancellor",
      playerId: actorId,
      payload: {
        keepCardId: cardId,
        bottomOrderIds: [rest[0]!.id, rest[1]!.id],
      },
    });
    setSelectedCardId(null);
  };

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: size.width }}>
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
      {overlay ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
