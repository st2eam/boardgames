"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PlayShell } from "@bbge/ui";
import { loadApiKey } from "@/lib/chat/api-key-storage";
import { ensurePlayPluginsRegistered } from "@/lib/bbge/registerPlayPlugins";
import { getLlmSeatFactory } from "@/lib/bbge/llmSeats";

ensurePlayPluginsRegistered();

interface Props {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
  /** From play.json default when URL omits ?edition= */
  defaultEdition?: string;
}

export function PlayPageClient({
  locale,
  slug,
  gameName,
  pluginId,
  defaultEdition = "full",
}: Props) {
  const search = useSearchParams();
  const room = search.get("room");
  const editionParam = search.get("edition");
  const edition =
    editionParam === "premium" || editionParam === "full"
      ? editionParam
      : defaultEdition === "premium"
        ? "premium"
        : "full";

  // Lock document scroll on play — overflow only inside seat/log containers.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <PlayShell
        locale={locale}
        slug={slug}
        gameName={gameName}
        pluginId={pluginId}
        edition={edition}
        roomIdFromUrl={room}
        loadApiKey={loadApiKey}
        createDeepSeekSeat={getLlmSeatFactory(pluginId)}
      />
    </div>
  );
}
