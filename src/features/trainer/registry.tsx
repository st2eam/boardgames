import type { TrainerConfig } from "@/types/game";
import type { GoTrainerConfig } from "@/lib/go/types";
import { TenpaiTrainer } from "@/features/trainer/TenpaiTrainer";
import { BasicStrategyTrainer } from "@/features/trainer/blackjack/BasicStrategyTrainer";
import { PreflopTrainer } from "@/features/trainer/texas-holdem/PreflopTrainer";
import { GoTsumegoTrainer } from "@/features/trainer/go/GoTsumegoTrainer";

export const TRAINER_TITLES: Record<string, { en: string; zh: string }> = {
  tenpai: { en: "Tenpai Trainer", zh: "听牌训练" },
  "blackjack-basic-strategy": { en: "Basic Strategy Trainer", zh: "基本策略训练" },
  "texas-holdem-preflop": { en: "Preflop Trainer", zh: "翻前训练" },
  "go-tsumego": { en: "Trainer", zh: "训练" },
};

export const TRAINER_DESCRIPTIONS: Record<string, { en: string; zh: string }> = {
  tenpai: {
    en: "practice identifying winning tiles",
    zh: "练习判断听什么牌",
  },
  "blackjack-basic-strategy": {
    en: "practice optimal blackjack decisions",
    zh: "练习最优21点决策",
  },
  "texas-holdem-preflop": {
    en: "practice GTO preflop open-raise decisions",
    zh: "练习GTO翻前起手牌决策",
  },
  "go-tsumego": {
    en: "practice Go problems",
    zh: "练习围棋题目",
  },
};

interface TrainerByTypeProps {
  type: string;
  config: TrainerConfig;
  locale: string;
}

/** Dispatch trainer UI by `trainer.json` type. Add new types here. */
export function TrainerByType({ type, config, locale }: TrainerByTypeProps) {
  switch (type) {
    case "tenpai":
      return <TenpaiTrainer config={config} locale={locale} />;
    case "blackjack-basic-strategy":
      return <BasicStrategyTrainer locale={locale} />;
    case "texas-holdem-preflop":
      return <PreflopTrainer locale={locale} />;
    case "go-tsumego":
      return <GoTsumegoTrainer config={config as unknown as GoTrainerConfig} locale={locale} />;
    default:
      return null;
  }
}
