"use client";

import { useCallback } from "react";

type Stone = "black" | "white";
type Coord = { row: number; col: number };

interface Props {
  size: number;
  stones: Record<string, Stone>;
  onIntersectionClick: (c: Coord) => void;
  disabled?: boolean;
  lastMove?: Coord | null;
  ko?: Coord | null;
  className?: string;
}

/** Logical SVG size — CSS scales the element to fill its box. */
const VIEW = 1000;
const PADDING = 36;

const STAR_POINTS_9 = [
  [2, 2],
  [2, 6],
  [4, 4],
  [6, 2],
  [6, 6],
];
const STAR_POINTS_13 = [
  [3, 3],
  [3, 9],
  [6, 6],
  [9, 3],
  [9, 9],
];
const STAR_POINTS_19 = [
  [3, 3],
  [3, 9],
  [3, 15],
  [9, 3],
  [9, 9],
  [9, 15],
  [15, 3],
  [15, 9],
  [15, 15],
];

export function GoBoard({
  size,
  stones,
  onIntersectionClick,
  disabled,
  lastMove,
  ko,
  className = "",
}: Props) {
  const spacing = (VIEW - PADDING * 2) / (size - 1);

  const starPoints = useCallback(() => {
    if (size <= 9) return STAR_POINTS_9;
    if (size <= 13) return STAR_POINTS_13;
    return STAR_POINTS_19;
  }, [size]);

  const toSvg = (i: number) => PADDING + i * spacing;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = VIEW / rect.width;
    const scaleY = VIEW / rect.height;
    const col = Math.round((x * scaleX - PADDING) / spacing);
    const row = Math.round((y * scaleY - PADDING) / spacing);
    if (row >= 0 && row < size && col >= 0 && col < size) {
      onIntersectionClick({ row, col });
    }
  };

  const stoneR = spacing * 0.44;
  const lineW = size >= 19 ? 1.1 : size >= 13 ? 1.3 : 1.6;
  const starR = size >= 19 ? 5 : 6.5;

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={`h-full w-full touch-manipulation rounded-lg bg-amber-100 shadow-inner ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${className}`}
      onClick={handleClick}
      role="img"
      aria-label={`Go board ${size}×${size}`}
    >
      <rect x={0} y={0} width={VIEW} height={VIEW} rx={14} fill="#e8c26a" />
      {Array.from({ length: size }, (_, i) => (
        <g key={`lines-${i}`}>
          <line
            x1={toSvg(0)}
            y1={toSvg(i)}
            x2={toSvg(size - 1)}
            y2={toSvg(i)}
            stroke="#8b6914"
            strokeWidth={lineW}
          />
          <line
            x1={toSvg(i)}
            y1={toSvg(0)}
            x2={toSvg(i)}
            y2={toSvg(size - 1)}
            stroke="#8b6914"
            strokeWidth={lineW}
          />
        </g>
      ))}
      {starPoints().map(([r, c]) => (
        <circle
          key={`star-${r}-${c}`}
          cx={toSvg(c)}
          cy={toSvg(r)}
          r={starR}
          fill="#8b6914"
        />
      ))}
      {ko && (
        <rect
          x={toSvg(ko.col) - stoneR * 0.35}
          y={toSvg(ko.row) - stoneR * 0.35}
          width={stoneR * 0.7}
          height={stoneR * 0.7}
          fill="none"
          stroke="#b45309"
          strokeWidth={3}
        />
      )}
      {Object.entries(stones).map(([k, color]) => {
        const [r, c] = k.split(",").map(Number);
        const cx = toSvg(c!);
        const cy = toSvg(r!);
        const isLast = lastMove && lastMove.row === r && lastMove.col === c;
        return (
          <g key={`stone-${k}`}>
            <circle
              cx={cx + 2}
              cy={cy + 2}
              r={stoneR}
              fill="rgba(0,0,0,0.18)"
            />
            <circle
              cx={cx}
              cy={cy}
              r={stoneR}
              fill={color === "black" ? "#1a1a1a" : "#f5f5f0"}
              stroke={color === "black" ? "#000" : "#c5c5b5"}
              strokeWidth={1}
            />
            {isLast && (
              <circle
                cx={cx}
                cy={cy}
                r={stoneR * 0.28}
                fill={color === "black" ? "#fff" : "#333"}
                opacity={0.8}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
