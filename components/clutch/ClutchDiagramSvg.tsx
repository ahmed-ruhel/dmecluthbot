"use client";

import React from "react";
import { formatNum } from "@/lib/engine/units";

interface ClutchDiagramSvgProps {
  Do: number;
  Di: number;
  Dm: number;
  n1: number;
  n2: number;
  nPrime: number;
  Fa: number;
  theory: "uniform_wear" | "uniform_pressure";
}

export const ClutchDiagramSvg: React.FC<ClutchDiagramSvgProps> = ({
  Do,
  Di,
  Dm,
  n1,
  n2,
  nPrime,
  Fa,
  theory,
}) => {
  const width = 460;
  const height = 280;

  // Concentric disc coordinates (Left side)
  const cx = 130;
  const cy = 140;
  const maxR = 90;

  const ratio = Do > 0 ? Math.max(0.2, Math.min(0.85, Di / Do)) : 0.5;
  const rOuter = maxR;
  const rInner = maxR * ratio;
  const rMean = (rOuter + rInner) / 2;

  // Plate Stack coordinates (Right side)
  const stackX = 280;
  const stackTopY = 40;
  const stackHeight = 180;
  const totalPlates = Math.max(2, Math.min(16, n1 + n2));
  const plateSpacing = stackHeight / (totalPlates + 1);

  return (
    <div className="relative rounded-xl border border-[#d1d7dc] bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-2 mb-2">
        <span className="text-xs font-bold text-[#2d2f31] flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-[#a435f0] animate-pulse"></span>
          <span>Interactive Friction Disc &amp; Plate Stack Geometry</span>
        </span>
        <span className="rounded bg-[#f6efff] px-2 py-0.5 text-[10px] font-mono font-bold text-[#5624d0] border border-[#d8b4fe]">
          {theory === "uniform_wear" ? "Uniform Wear (Standard)" : "Uniform Pressure"}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
        {/* Subtle grid pattern background */}
        <defs>
          <pattern id="clutch-grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f2f5" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#clutch-grid-light)" rx="8" />

        {/* ================= LEFT: CONCENTRIC DISC ================= */}
        {/* Outer Friction Disc */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="#f6efff"
          stroke="#a435f0"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Inner Hole */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="#ffffff"
          stroke="#6a6f73"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Mean Radius Guideline (Dashed) */}
        <circle
          cx={cx}
          cy={cy}
          r={rMean}
          fill="none"
          stroke="#b4690e"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Center crosshair */}
        <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="#919496" strokeWidth="1" />
        <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="#919496" strokeWidth="1" />

        {/* Outer Dimension Label Do */}
        <text
          x={cx}
          y={cy - rOuter - 6}
          textAnchor="middle"
          fill="#a435f0"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Do = {formatNum(Do, 1)} mm
        </text>

        {/* Inner Dimension Label Di */}
        <text
          x={cx}
          y={cy + rInner + 14}
          textAnchor="middle"
          fill="#6a6f73"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Di = {formatNum(Di, 1)} mm
        </text>

        {/* Mean Diameter Label Dm */}
        <text
          x={cx + rMean + 5}
          y={cy}
          fill="#b4690e"
          fontSize="9"
          fontFamily="monospace"
          alignmentBaseline="middle"
          fontWeight="bold"
        >
          Dm = {formatNum(Dm, 1)}
        </text>

        {/* ================= RIGHT: MULTI-PLATE STACK ================= */}
        {/* Central Shaft */}
        <rect
          x={stackX + 50}
          y={stackTopY - 10}
          width={16}
          height={stackHeight + 20}
          fill="#e4e8eb"
          stroke="#d1d7dc"
          strokeWidth="1.5"
          rx="2"
        />
        <text
          x={stackX + 58}
          y={stackTopY - 16}
          textAnchor="middle"
          fill="#6a6f73"
          fontSize="9"
          fontWeight="bold"
        >
          Plate Stack ({n1} driving + {n2} driven)
        </text>

        {/* Disc Pack Plates */}
        {Array.from({ length: totalPlates }).map((_, idx) => {
          const isDriving = idx % 2 === 0;
          const yPos = stackTopY + (idx + 1) * plateSpacing;
          const plateWidth = isDriving ? 80 : 70;
          const plateOffset = isDriving ? 0 : 5;

          return (
            <g key={idx}>
              <rect
                x={stackX + 58 - plateWidth / 2 + plateOffset}
                y={yPos - 3}
                width={plateWidth}
                height={6}
                fill={isDriving ? "#a435f0" : "#2d2f31"}
                rx="2"
              />
              {/* Friction interface contact lines */}
              {idx < totalPlates - 1 && (
                <line
                  x1={stackX + 22}
                  y1={yPos + plateSpacing / 2}
                  x2={stackX + 94}
                  y2={yPos + plateSpacing / 2}
                  stroke="#e4e8eb"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          );
        })}

        {/* Axial Force Arrows Fa */}
        {Fa > 0 && (
          <g>
            {/* Left arrow pushing in */}
            <line
              x1={stackX - 8}
              y1={cy}
              x2={stackX + 10}
              y2={cy}
              stroke="#b32d0f"
              strokeWidth="2.5"
            />
            <polygon
              points={`${stackX + 16},${cy} ${stackX + 8},${cy - 4} ${stackX + 8},${cy + 4}`}
              fill="#b32d0f"
            />
            <text x={stackX - 14} y={cy + 3} fill="#b32d0f" fontSize="9" fontWeight="bold" textAnchor="end">
              Fa
            </text>

            {/* Right arrow pushing in */}
            <line
              x1={stackX + 124}
              y1={cy}
              x2={stackX + 106}
              y2={cy}
              stroke="#b32d0f"
              strokeWidth="2.5"
            />
            <polygon
              points={`${stackX + 100},${cy} ${stackX + 108},${cy - 4} ${stackX + 108},${cy + 4}`}
              fill="#b32d0f"
            />
            <text x={stackX + 130} y={cy + 3} fill="#b32d0f" fontSize="9" fontWeight="bold" textAnchor="start">
              Fa
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${stackX - 5}, ${height - 22})`}>
          <rect x="0" y="0" width="10" height="6" fill="#a435f0" rx="1" />
          <text x="14" y="6" fill="#6a6f73" fontSize="9">Driving (n1)</text>

          <rect x="75" y="0" width="10" height="6" fill="#2d2f31" rx="1" />
          <text x="89" y="6" fill="#6a6f73" fontSize="9">Driven (n2)</text>
        </g>

        {/* Active friction surfaces text */}
        <text
          x={stackX + 58}
          y={height - 8}
          textAnchor="middle"
          fill="#5624d0"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          n&apos; = {nPrime} active friction pairs
        </text>
      </svg>
    </div>
  );
};
