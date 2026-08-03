import type { ScoreConfig } from "@/types/game";
import { ScoreTracker } from "@/components/game/score/ScoreTracker";
import { CaboScoreTracker } from "@/components/game/score/CaboScoreTracker";
import { SeaSaltScoreTracker } from "@/components/game/score/SeaSaltScoreTracker";
import { JustWildScoreTracker } from "@/components/game/score/JustWildScoreTracker";
import { NimmtScoreTracker } from "@/components/game/score/NimmtScoreTracker";

interface ScoreByTypeProps {
  slug: string;
  config: ScoreConfig;
  locale: string;
}

/** Dispatch score UI by `score.json` type. Register dedicated trackers here. */
export function ScoreByType({ slug, config, locale }: ScoreByTypeProps) {
  switch (config.type) {
    case "cabo-multi":
      return <CaboScoreTracker locale={locale} />;
    case "sea-salt-multi":
      return <SeaSaltScoreTracker locale={locale} />;
    case "just-wild-multi":
      return <JustWildScoreTracker locale={locale} />;
    case "nimmt-multi":
      return <NimmtScoreTracker locale={locale} />;
    default:
      return <ScoreTracker slug={slug} config={config} locale={locale} />;
  }
}
