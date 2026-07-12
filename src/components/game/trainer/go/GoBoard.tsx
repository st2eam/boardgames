"use client";

import { useCallback } from "react";
import type { Stone, Coord } from "@/lib/go/types";

interface Props {
  size: number;
  stones: Record<string, Stone>;
  onIntersectionClick: (c: Coord) => void;
  disabled?: boolean;
  lastMove?: Coord | null;
}

const PADDING = 24;
const STAR_POINTS_9 = [
  [2, 2], [2, 6], [4, 4], [6, 2], [6, 6],
];
const STAR_POINTS_13 = [
  [3, 3], [3, 9], [6, 6], [9, 3], [9, 9],
];
const STAR_POINTS_19 = [
  [3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15],
  [15, 3], [15, 9], [15, 15],
];

export function GoBoard({ size, stones, onIntersectionClick, disabled, lastMove }: Props) {
  const viewSize = 320;
  const spacing = (viewSize - PADDING * 2) / (size - 1);

  const getStarPoints = useCallback(() => {
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
    const scaleX = viewSize / rect.width;
    const scaleY = viewSize / rect.height;
    const col = Math.round((x * scaleX - PADDING) / spacing);
    const row = Math.round((y * scaleY - PADDING) / spacing);
    if (row >= 0 && row < size && col >= 0 && col < size) {
      onIntersectionClick({ row, col });
    }
  };

  const starPoints = getStarPoints();
  const stoneR = spacing * 0.44;

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="w-full max-w-[320px] cursor-pointer rounded-lg bg-amber-100 shadow-inner"
      onClick={handleClick}
    >
      {/* Board background */}
      <rect x={0} y={0} width={viewSize} height={viewSize} rx={8} fill="#e8c26a" />

      {/* Grid lines */}
      {Array.from({ length: size }, (_, i) => (
        <g key={`lines-${i}`}>
          <line
            x1={toSvg(0)} y1={toSvg(i)} x2={toSvg(size - 1)} y2={toSvg(i)}
            stroke="#8b6914" strokeWidth={0.6}
          />
          <line
            x1={toSvg(i)} y1={toSvg(0)} x2={toSvg(i)} y2={toSvg(size - 1)}
            stroke="#8b6914" strokeWidth={0.6}
          />
        </g>
      ))}

      {/* Star points */}
      {starPoints.map(([r, c]) => (
        <circle key={`star-${r}-${c}`} cx={toSvg(c)} cy={toSvg(r)} r={2} fill="#8b6914" />
      ))}

      {/* Stones */}
      {Object.entries(stones).map(([k, color]) => {
        const [r, c] = k.split(",").map(Number);
        const cx = toSvg(c);
        const cy = toSvg(r);
        const isLast = lastMove && lastMove.row === r && lastMove.col === c;
        return (
          <g key={`stone-${k}`}>
            {/* Shadow */}
            <circle cx={cx + 1.5} cy={cy + 1.5} r={stoneR} fill="rgba(0,0,0,0.15)" />
            {/* Stone */}
            <circle
              cx={cx} cy={cy} r={stoneR}
              fill={color === "black" ? "#1a1a1a" : "#f5f5f0"}
              stroke={color === "black" ? "#000" : "#c5c5b5"}
              strokeWidth={0.5}
            />
            {/* Highlight */}
            {color === "black" && (
              <ellipse cx={cx - stoneR * 0.3} cy={cy - stoneR * 0.3}
                rx={stoneR * 0.35} ry={stoneR * 0.25} fill="rgba(255,255,255,0.15)" />
            )}
            {/* Last move marker */}
            {isLast && (
              <circle cx={cx} cy={cy} r={stoneR * 0.3} fill={color === "black" ? "#fff" : "#333"} opacity={0.7} />
            )}
          </g>
        );
      })}

    </svg>
  );
}
