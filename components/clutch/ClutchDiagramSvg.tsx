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
  const width = 480;
  const height = 280;

  // Concentric disc coordinates (Left side)
  const cx = 135;
  const cy = 140;
  const maxR = 90;

  const ratio = Do > 0 ? Math.max(0.2, Math.min(0.85, Di / Do)) : 0.5;
  const rOuter = maxR;
  const rInner = maxR * ratio;
  const rMean = (rOuter + rInner) / 2;

  // Plate Stack coordinates (Right side)
  const stackX = 285;
  const stackTopY = 40;
  const stackHeight = 180;
  const totalPlates = Math.max(2, Math.min(16, n1 + n2));
  const plateSpacing = stackHeight / (totalPlates + 1);

  return (
    <div className="relative rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2 mb-2">
        <span className="text-xs font-mono font-bold text-[#0f172a] flex items-center space-x-2">
          <span className="h-2 w-2 rounded-sm bg-[#0284c7]"></span>
          <span>SCHEMATIC: FRICTION INTERFACE &amp; MULTI-PLATE STACK</span>
        </span>
        <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
          {theory === "uniform_wear" ? "UNIFORM WEAR (Eq 13.9d)" : "UNIFORM PRESSURE (Eq 13.9a)"}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
        {/* Subtle engineering CAD grid */}
        <defs>
          <pattern id="clutch-grid-tech" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <pattern id="friction-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#0284c7" strokeWidth="1.2" strokeOpacity="0.4" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#clutch-grid-tech)" rx="6" />

        {/* ================= LEFT: CONCENTRIC DISC ================= */}
        {/* Outer Friction Disc */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="url(#friction-hatch)"
          stroke="#0284c7"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Inner Hole */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="#ffffff"
          stroke="#475569"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />

        {/* Mean Radius Guideline (Dashed Centerline) */}
        <circle
          cx={cx}
          cy={cy}
          r={rMean}
          fill="none"
          stroke="#d97706"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Centerline Crosshair */}
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#64748b" strokeWidth="1" />
        <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} stroke="#64748b" strokeWidth="1" />
        <text x={cx + 14} y={cy + 3} fill="#64748b" fontSize="8" fontFamily="monospace">CL</text>

        {/* Outer Dimension Label Do */}
        <line x1={cx - rOuter} y1={cy - rOuter - 8} x2={cx + rOuter} y2={cy - rOuter - 8} stroke="#0284c7" strokeWidth="1" />
        <line x1={cx - rOuter} y1={cy - rOuter - 12} x2={cx - rOuter} y2={cy - rOuter - 4} stroke="#0284c7" strokeWidth="1" />
        <line x1={cx + rOuter} y1={cy - rOuter - 12} x2={cx + rOuter} y2={cy - rOuter - 4} stroke="#0284c7" strokeWidth="1" />
        <text
          x={cx}
          y={cy - rOuter - 11}
          textAnchor="middle"
          fill="#0369a1"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ⌀Do = {formatNum(Do, 1)} mm
        </text>

        {/* Inner Dimension Label Di */}
        <line x1={cx - rInner} y1={cy + rInner + 8} x2={cx + rInner} y2={cy + rInner + 8} stroke="#475569" strokeWidth="1" />
        <line x1={cx - rInner} y1={cy + rInner + 4} x2={cx - rInner} y2={cy + rInner + 12} stroke="#475569" strokeWidth="1" />
        <line x1={cx + rInner} y1={cy + rInner + 4} x2={cx + rInner} y2={cy + rInner + 12} stroke="#475569" strokeWidth="1" />
        <text
          x={cx}
          y={cy + rInner + 20}
          textAnchor="middle"
          fill="#334155"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ⌀Di = {formatNum(Di, 1)} mm
        </text>

        {/* Mean Diameter Label Dm */}
        <text
          x={cx + rMean + 6}
          y={cy}
          fill="#d97706"
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
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          rx="1"
        />
        <text
          x={stackX + 58}
          y={stackTopY - 16}
          textAnchor="middle"
          fill="#64748b"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          SHAFT / PACK ({n1} + {n2})
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
                fill={isDriving ? "#0284c7" : "#1e293b"}
                rx="1"
              />
              {/* Friction interface contact lines */}
              {idx < totalPlates - 1 && (
                <line
                  x1={stackX + 22}
                  y1={yPos + plateSpacing / 2}
                  x2={stackX + 94}
                  y2={yPos + plateSpacing / 2}
                  stroke="#cbd5e1"
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
              stroke="#059669"
              strokeWidth="2"
            />
            <polygon
              points={`${stackX + 16},${cy} ${stackX + 8},${cy - 4} ${stackX + 8},${cy + 4}`}
              fill="#059669"
            />
            <text x={stackX - 12} y={cy + 3} fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end">
              Fa
            </text>

            {/* Right arrow pushing in */}
            <line
              x1={stackX + 124}
              y1={cy}
              x2={stackX + 106}
              y2={cy}
              stroke="#059669"
              strokeWidth="2"
            />
            <polygon
              points={`${stackX + 100},${cy} ${stackX + 108},${cy - 4} ${stackX + 108},${cy + 4}`}
              fill="#059669"
            />
            <text x={stackX + 128} y={cy + 3} fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="start">
              Fa
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${stackX - 5}, ${height - 22})`}>
          <rect x="0" y="0" width="10" height="6" fill="#0284c7" rx="1" />
          <text x="14" y="6" fill="#475569" fontSize="8" fontFamily="monospace">Driving (n1)</text>

          <rect x="75" y="0" width="10" height="6" fill="#1e293b" rx="1" />
          <text x="89" y="6" fill="#475569" fontSize="8" fontFamily="monospace">Driven (n2)</text>
        </g>

        {/* Active friction surfaces text */}
        <text
          x={stackX + 58}
          y={height - 8}
          textAnchor="middle"
          fill="#0369a1"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          n&apos; = {nPrime} active pairs
        </text>
      </svg>
    </div>
  );
};
