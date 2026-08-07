"use client";

import { useSearchParams } from "next/navigation";
import { PlayShell } from "@bbge/ui";
import { loadApiKey } from "@/lib/chat/api-key-storage";
import { createDeepSeekLoveLetterSeat } from "@/lib/bbge/DeepSeekLoveLetterSeat";

interface Props {
  locale: string;
  slug: string;
  gameName: string;
  pluginId: string;
}

export function PlayPageClient({ locale, slug, gameName, pluginId }: Props) {
  const search = useSearchParams();
  const room = search.get("room");

  return (
    <PlayShell
      locale={locale}
      slug={slug}
      gameName={gameName}
      pluginId={pluginId}
      roomIdFromUrl={room}
      loadApiKey={loadApiKey}
      createDeepSeekSeat={createDeepSeekLoveLetterSeat}
    />
  );
}
