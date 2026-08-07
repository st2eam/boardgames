import type { Action, PlayerId } from "@bbge/core";
import type { AiDecision } from "./ai-seat";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const arrStart = raw.indexOf("[");
  // Prefer array wrapper when model returns [action, speak]
  if (arrStart >= 0 && (start < 0 || arrStart < start)) {
    const arrEnd = raw.lastIndexOf("]");
    if (arrEnd > arrStart) {
      return JSON.parse(raw.slice(arrStart, arrEnd + 1));
    }
  }
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

function asSpeakText(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

/** Parse Action + optional speak from model content. */
export function parseLoveLetterAiContent(
  text: string,
  playerId: PlayerId,
): AiDecision {
  const raw = extractJson(text);
  let speak: string | undefined;
  let actionRaw: Record<string, unknown> | null = null;

  const takeSpeakObj = (o: Record<string, unknown>) => {
    if (o.type === "speak") {
      speak = asSpeakText(o.text) ?? asSpeakText(o.speak) ?? speak;
      return true;
    }
    return false;
  };

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (takeSpeakObj(o)) continue;
      if (typeof o.type === "string") actionRaw = o;
    }
  } else if (raw && typeof raw === "object") {
    const o = { ...(raw as Record<string, unknown>) };
    if (takeSpeakObj(o)) {
      throw new Error("speak-only response; need play action");
    }
    speak = asSpeakText(o.speak) ?? asSpeakText(o.say) ?? speak;
    delete o.speak;
    delete o.say;
    delete o["发言"];
    actionRaw = o;
  }

  if (!actionRaw || typeof actionRaw.type !== "string") {
    throw new Error("bad action shape");
  }
  const action = { ...actionRaw, playerId } as Action;
  return { action, speak };
}
