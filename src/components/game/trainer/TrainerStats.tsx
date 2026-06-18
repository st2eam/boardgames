"use client";

interface TrainerStatsProps {
  correct: number;
  total: number;
  streak: number;
  locale: string;
}

export function TrainerStats({ correct, total, streak, locale }: TrainerStatsProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 text-sm">
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">
          {locale === "zh" ? "正确" : "Correct"}
        </span>
        <span className="text-lg font-bold text-green-600">{correct}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">
          {locale === "zh" ? "总题" : "Total"}
        </span>
        <span className="text-lg font-bold text-primary-dark">{total}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">
          {locale === "zh" ? "正确率" : "Accuracy"}
        </span>
        <span className="text-lg font-bold text-accent">{accuracy}%</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">
          {locale === "zh" ? "连续" : "Streak"}
        </span>
        <span className="text-lg font-bold text-orange-500">{streak}</span>
      </div>
    </div>
  );
}
