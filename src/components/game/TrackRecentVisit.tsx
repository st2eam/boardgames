"use client";

import { useEffect } from "react";
import { trackRecentGame } from "@/lib/recent-games";

export function TrackRecentVisit({ slug }: { slug: string }) {
  useEffect(() => {
    trackRecentGame(slug);
  }, [slug]);

  return null;
}
