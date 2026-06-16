"use client";

const GAME_THEMES: Record<string, { icon: string; pattern: string; accent: string }> = {
  "texas-holdem": { icon: "🃏", pattern: "cards", accent: "#b91c1c" },
  tacta: { icon: "♟️", pattern: "hexagons", accent: "#92400e" },
  "stars-twenty-one": { icon: "⭐", pattern: "stars", accent: "#7c3aed" },
  skyscraper: { icon: "🏙️", pattern: "blocks", accent: "#0284c7" },
  "king-of-wilderness": { icon: "🦁", pattern: "leaves", accent: "#15803d" },
  "dirty-pig": { icon: "🐷", pattern: "dots", accent: "#be185d" },
  "dirty-pig-pageant": { icon: "👑", pattern: "sparkles", accent: "#db2777" },
  "durian-coach-boxing": { icon: "🥊", pattern: "zigzag", accent: "#ea580c" },
  catan: { icon: "🏝️", pattern: "hexagons", accent: "#ca8a04" },
  "catan-china": { icon: "🏯", pattern: "hexagons", accent: "#dc2626" },
  "sea-salt-origami": { icon: "🐙", pattern: "waves", accent: "#0891b2" },
  "sea-salt-extra-salt": { icon: "🧂", pattern: "waves", accent: "#0e7490" },
  sanguosha: { icon: "⚔️", pattern: "diamonds", accent: "#991b1b" },
  "sanguosha-disloyal": { icon: "🗡️", pattern: "diamonds", accent: "#581c87" },
  "modern-art": { icon: "🎨", pattern: "abstract", accent: "#c026d3" },
  uno: { icon: "🔴", pattern: "circles", accent: "#dc2626" },
  "uno-flip": { icon: "🔄", pattern: "circles", accent: "#2563eb" },
  "uno-no-mercy": { icon: "🔥", pattern: "zigzag", accent: "#b91c1c" },
  carcassonne: { icon: "🏰", pattern: "tiles", accent: "#1d4ed8" },
  "wind-sound-again": { icon: "🎐", pattern: "waves", accent: "#6366f1" },
  cabo: { icon: "🏖️", pattern: "dots", accent: "#0d9488" },
  "exploding-kittens": { icon: "🐱", pattern: "sparkles", accent: "#f59e0b" },
  "exploding-kittens-black": { icon: "😈", pattern: "zigzag", accent: "#1e1b4b" },
  splendor: { icon: "💎", pattern: "diamonds", accent: "#7c3aed" },
  "splendor-pokemon": { icon: "✨", pattern: "sparkles", accent: "#e11d48" },
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function PatternSVG({ pattern, accent, seed }: { pattern: string; accent: string; seed: number }) {
  const r = (i: number) => ((seed * (i + 1) * 7919) % 100) / 100;

  switch (pattern) {
    case "cards":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(6)].map((_, i) => (
            <rect key={i} x={20 + r(i) * 150} y={10 + r(i + 10) * 80} width="28" height="38" rx="3"
              fill="none" stroke={accent} strokeWidth="1.5"
              transform={`rotate(${-30 + r(i + 5) * 60}, ${34 + r(i) * 150}, ${29 + r(i + 10) * 80})`} />
          ))}
        </svg>
      );
    case "hexagons": {
      const pts = (cx: number, cy: number, s: number) =>
        [0, 1, 2, 3, 4, 5].map(i => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`;
        }).join(" ");
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(8)].map((_, i) => (
            <polygon key={i} points={pts(20 + r(i) * 160, 10 + r(i + 7) * 105, 12 + r(i + 3) * 10)}
              fill="none" stroke={accent} strokeWidth="1.2" />
          ))}
        </svg>
      );
    }
    case "stars":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(12)].map((_, i) => {
            const cx = r(i) * 200, cy = r(i + 5) * 125, s = 2 + r(i + 10) * 6;
            return <circle key={i} cx={cx} cy={cy} r={s} fill={accent} />;
          })}
          {[...Array(5)].map((_, i) => {
            const cx = 20 + r(i + 20) * 160, cy = 15 + r(i + 25) * 95;
            return <text key={`s${i}`} x={cx} y={cy} fontSize={10 + r(i + 30) * 14} fill={accent} opacity="0.6">✦</text>;
          })}
        </svg>
      );
    case "waves":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(5)].map((_, i) => {
            const y = 20 + i * 22;
            return (
              <path key={i}
                d={`M0,${y} Q50,${y - 12 + r(i) * 24} 100,${y} T200,${y}`}
                fill="none" stroke={accent} strokeWidth="1.5" />
            );
          })}
        </svg>
      );
    case "dots":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(30)].map((_, i) => (
            <circle key={i} cx={r(i) * 200} cy={r(i + 10) * 125}
              r={1.5 + r(i + 20) * 4} fill={accent} />
          ))}
        </svg>
      );
    case "diamonds":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(8)].map((_, i) => {
            const cx = 20 + r(i) * 160, cy = 15 + r(i + 5) * 95, s = 8 + r(i + 10) * 12;
            return <rect key={i} x={cx - s / 2} y={cy - s / 2} width={s} height={s}
              fill="none" stroke={accent} strokeWidth="1.2"
              transform={`rotate(45, ${cx}, ${cy})`} />;
          })}
        </svg>
      );
    case "circles":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(7)].map((_, i) => (
            <circle key={i} cx={20 + r(i) * 160} cy={15 + r(i + 5) * 95}
              r={10 + r(i + 10) * 20} fill="none" stroke={accent} strokeWidth="1.5" />
          ))}
        </svg>
      );
    case "sparkles":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(10)].map((_, i) => {
            const cx = r(i) * 200, cy = r(i + 5) * 125, s = 3 + r(i + 10) * 6;
            return (
              <g key={i}>
                <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke={accent} strokeWidth="1" />
                <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke={accent} strokeWidth="1" />
                <line x1={cx - s * 0.6} y1={cy - s * 0.6} x2={cx + s * 0.6} y2={cy + s * 0.6} stroke={accent} strokeWidth="0.7" />
                <line x1={cx + s * 0.6} y1={cy - s * 0.6} x2={cx - s * 0.6} y2={cy + s * 0.6} stroke={accent} strokeWidth="0.7" />
              </g>
            );
          })}
        </svg>
      );
    case "zigzag":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(4)].map((_, i) => {
            const y = 20 + i * 28;
            const pts = [...Array(9)].map((_, j) => `${j * 25},${y + (j % 2 === 0 ? 0 : 16)}`).join(" ");
            return <polyline key={i} points={pts} fill="none" stroke={accent} strokeWidth="1.5" />;
          })}
        </svg>
      );
    case "blocks":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(10)].map((_, i) => {
            const w = 8 + r(i) * 16, h = 12 + r(i + 5) * 30;
            return <rect key={i} x={10 + r(i + 10) * 170} y={125 - h - r(i + 15) * 30}
              width={w} height={h} fill={accent} rx="1" />;
          })}
        </svg>
      );
    case "tiles":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(12)].map((_, i) => {
            const x = r(i) * 180, y = r(i + 5) * 105, s = 14 + r(i + 10) * 8;
            return <rect key={i} x={x} y={y} width={s} height={s} fill={accent} rx="2" />;
          })}
        </svg>
      );
    case "leaves":
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(8)].map((_, i) => {
            const cx = 15 + r(i) * 170, cy = 10 + r(i + 5) * 105, s = 8 + r(i + 10) * 10;
            return <ellipse key={i} cx={cx} cy={cy} rx={s} ry={s * 0.5}
              fill="none" stroke={accent} strokeWidth="1.2"
              transform={`rotate(${r(i + 15) * 360}, ${cx}, ${cy})`} />;
          })}
        </svg>
      );
    default:
      return (
        <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
          {[...Array(6)].map((_, i) => (
            <circle key={i} cx={30 + r(i) * 140} cy={20 + r(i + 5) * 85}
              r={8 + r(i + 10) * 18} fill="none" stroke={accent} strokeWidth="1.2" />
          ))}
        </svg>
      );
  }
}

interface Props {
  slug: string;
  gradient: string;
  className?: string;
  children?: React.ReactNode;
}

export function GameCover({ slug, gradient, className = "", children }: Props) {
  const theme = GAME_THEMES[slug];
  const seed = hashStr(slug);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {theme && (
        <>
          <PatternSVG pattern={theme.pattern} accent={theme.accent} seed={seed} />
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
            style={{ fontSize: "clamp(3rem, 8vw, 5rem)", opacity: 0.18, filter: "grayscale(0.3)" }}
            aria-hidden="true"
          >
            {theme.icon}
          </span>
        </>
      )}
      {!theme && (
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/40" />
          <div className="absolute top-1/3 -left-4 h-28 w-28 rounded-full bg-white/25" />
          <div className="absolute bottom-1/4 right-8 h-6 w-6 rounded-full bg-white/50" />
        </div>
      )}
      {children}
    </div>
  );
}
