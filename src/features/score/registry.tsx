import type { ScoreConfig } from "@/types/game";
import { CaboScoreTracker } from "@/features/score/CaboScoreTracker";
import { SeaSaltScoreTracker } from "@/features/score/SeaSaltScoreTracker";
import { JustWildScoreTracker } from "@/features/score/JustWildScoreTracker";
import { NimmtScoreTracker } from "@/features/score/NimmtScoreTracker";

interface ScoreByTypeProps {
  config: ScoreConfig;
  locale: string;
}

/** Dispatch score UI by `score.json` type. Only dedicated multi-round trackers. */
export function ScoreByType({ config, locale }: ScoreByTypeProps) {
  switch (config.type) {
    case "cabo-multi":
      return <CaboScoreTracker locale={locale} />;
    case "sea-salt-multi":
      return <SeaSaltScoreTracker locale={locale} />;
    case "just-wild-multi":
      return <JustWildScoreTracker locale={locale} />;
    case "nimmt-multi":
      return <NimmtScoreTracker locale={locale} />;
  }
}
