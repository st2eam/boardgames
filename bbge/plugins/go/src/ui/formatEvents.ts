import type { Event } from "@bbge/core";
import type { PlayLogEntry } from "@bbge/ui";
import { coordLabel } from "../board";

function nameOf(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? id;
}

export function formatGoEvents(
  events: Event[],
  locale: string,
  names?: Record<string, string>,
): PlayLogEntry[] {
  const zh = locale === "zh";
  const out: PlayLogEntry[] = [];
  const at = Date.now();

  for (const e of events) {
    if (e.type === "move/played") {
      const p = e.payload as {
        playerId: string;
        color: string;
        row: number;
        col: number;
        size?: number;
        captured: number;
      };
      const moveLabel = coordLabel(
        { row: p.row, col: p.col },
        p.size ?? 9,
      );
      out.push({
        id: `mv-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(p.playerId, names)}（${p.color === "black" ? "黑" : "白"}）下在 ${moveLabel}${
              p.captured ? `，提 ${p.captured}` : ""
            }`
          : `${nameOf(p.playerId, names)} (${p.color}) → ${moveLabel}${
              p.captured ? `, capture ${p.captured}` : ""
            }`,
        speakerId: p.playerId,
        bubble: moveLabel,
      });
    } else if (e.type === "move/passed") {
      const p = e.payload as { playerId: string };
      out.push({
        id: `pass-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(p.playerId, names)} 停着`
          : `${nameOf(p.playerId, names)} passes`,
        speakerId: p.playerId,
        bubble: zh ? "停着" : "Pass",
      });
    } else if (e.type === "player/resigned") {
      const p = e.payload as { playerId: string };
      out.push({
        id: `resign-${at}-${out.length}`,
        at,
        text: zh
          ? `${nameOf(p.playerId, names)} 认输`
          : `${nameOf(p.playerId, names)} resigns`,
        tone: "warn",
      });
    } else if (e.type === "game/ended") {
      const p = e.payload as {
        reason: string;
        winners?: string[];
        scores?: { black: number; white: number; komi: number };
      };
      if (p.reason === "score" && p.scores) {
        out.push({
          id: `end-${at}-${out.length}`,
          at,
          text: zh
            ? `终局数子 · 黑 ${p.scores.black} · 白 ${p.scores.white}（含贴目 ${p.scores.komi}）· 胜者 ${
                (p.winners ?? []).map((id) => nameOf(id, names)).join("、") || "—"
              }`
            : `Scored · B ${p.scores.black} · W ${p.scores.white} (komi ${p.scores.komi}) · ${
                (p.winners ?? []).map((id) => nameOf(id, names)).join(", ") || "—"
              }`,
          tone: "win",
        });
      } else {
        out.push({
          id: `end-${at}-${out.length}`,
          at,
          text: zh
            ? `对局结束 · ${
                (p.winners ?? []).map((id) => nameOf(id, names)).join("、") || "—"
              } 胜`
            : `Game over · ${
                (p.winners ?? []).map((id) => nameOf(id, names)).join(", ") || "—"
              } wins`,
          tone: "win",
        });
      }
    }
  }

  return out;
}
