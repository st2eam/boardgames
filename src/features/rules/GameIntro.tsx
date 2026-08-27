interface Props {
  content: string;
  locale: string;
}

/** A consistent player-first orientation before detailed rules or a flow begin. */
export function GameIntro({ content, locale }: Props) {
  const isZh = locale === "zh";

  return (
    <section
      aria-label={isZh ? "这局的背景、身份与目标" : "The game's setting, role, and goal"}
      className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5"
    >
      <p className="mb-3 font-heading text-base font-bold text-primary-dark">
        {isZh ? "先花 10 秒：这局你是谁，怎么赢？" : "First 10 seconds: who are you, and how do you win?"}
      </p>
      <p className="rounded-xl border border-border bg-white p-3.5 text-sm leading-6 text-stone-700">
        {content}
      </p>
    </section>
  );
}
