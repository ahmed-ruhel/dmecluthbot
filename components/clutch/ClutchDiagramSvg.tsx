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
  // SVG viewport dimensions
  const width = 460;
  const height = 280;

  // Concentric disc coordinates (Left side)
  const cx = 130;
  const cy = 140;
  const maxR = 90;
  const minR = 25;

  // Normalized radii for visual presentation
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
    <div className="relative rounded-2xl border border-slate-800 bg-[#060a12] p-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Interactive Friction Disc & Plate Stack Geometry</span>
        </span>
        <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800/50">
          {theory === "uniform_wear" ? "Uniform Wear (Conservative)" : "Uniform Pressure"}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        style={{ maxHeight: "280px" }}
      >
        <defs>
          <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" />
          </marker>

          <marker
            id="forceArrow"
            markerWidth="6"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
          </marker>
        </defs>

        {/* --- LEFT: Concentric Annular Disc View --- */}
        {/* Outer diameter ring */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="url(#discGrad)"
          stroke="#0891b2"
          strokeWidth="2"
        />

        {/* Inner diameter hole */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="#060a12"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Mean diameter circle */}
        <circle
          cx={cx}
          cy={cy}
          r={rMean}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Center Shaft Hub */}
        <circle cx={cx} cy={cy} r={minR * 0.4} fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#64748b" strokeWidth="1" />
        <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="#64748b" strokeWidth="1" />

        {/* Dimension Callouts for Left Disc */}
        <text x={cx} y={cy - rOuter - 8} fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
          Do = {formatNum(Do, 1)} mm
        </text>

        <text x={cx} y={cy + rInner + 14} fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">
          Di = {formatNum(Di, 1)} mm
        </text>

        <text x={cx + rMean + 5} y={cy - 12} fill="#f59e0b" fontSize="9" fontFamily="monospace">
          Dm = {formatNum(Dm, 1)}
        </text>

        {/* --- RIGHT: Multi-Plate Stack Cross-Section --- */}
        <text x={stackX + 50} y={22} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
          Plate Stack ({n1} driving + {n2} driven)
        </text>

        {/* Central Drive Shaft */}
        <rect
          x={stackX + 35}
          y={stackTopY - 10}
          width="30"
          height={stackHeight + 20}
          fill="#1e293b"
          stroke="#334155"
          rx="3"
        />

        {/* Compressing Force Arrows Fa */}
        <line
          x1={stackX - 25}
          y1={stackTopY + stackHeight / 2}
          x2={stackX - 5}
          y2={stackTopY + stackHeight / 2}
          stroke="#f43f5e"
          strokeWidth="2.5"
          markerEnd="url(#forceArrow)"
        />
        <text x={stackX - 15} y={stackTopY + stackHeight / 2 - 8} fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">
          Fa
        </text>

        <line
          x1={stackX + 125}
          y1={stackTopY + stackHeight / 2}
          x2={stackX + 105}
          y2={stackTopY + stackHeight / 2}
          stroke="#f43f5e"
          strokeWidth="2.5"
          markerEnd="url(#forceArrow)"
        />
        <text x={stackX + 115} y={stackTopY + stackHeight / 2 - 8} fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">
          Fa
        </text>

        {/* Draw alternating plates */}
        {Array.from({ length: totalPlates }).map((_, idx) => {
          const isDriving = idx % 2 === 0;
          const py = stackTopY + (idx + 1) * plateSpacing;
          const plateWidth = isDriving ? 85 : 70;
          const px = isDriving ? stackX + 7.5 : stackX + 15;

          return (
            <g key={idx}>
              <rect
                x={px}
                y={py}
                width={plateWidth}
                height="6"
                fill={isDriving ? "url(#bronzeGrad)" : "url(#steelGrad)"}
                rx="1"
                stroke={isDriving ? "#b45309" : "#475569"}
                strokeWidth="0.5"
              />
              {/* Splines representation */}
              {isDriving ? (
                <rect x={px + 2} y={py - 1} width="4" height="8" fill="#d97706" />
              ) : (
                <rect x={px + plateWidth - 6} y={py - 1} width="4" height="8" fill="#94a3b8" />
              )}
            </g>
          );
        })}

        {/* Stack annotations */}
        <text x={stackX + 50} y={stackTopY + stackHeight + 25} fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
          n&apos; = {nPrime} active friction pairs
        </text>

        {/* Legend */}
        <g transform={`translate(${width - 130}, ${height - 35})`}>
          <rect x="0" y="0" width="10" height="6" fill="#d97706" rx="1" />
          <text x="14" y="6" fill="#cbd5e1" fontSize="9">Driving (n1)</text>

          <rect x="65" y="0" width="10" height="6" fill="#64748b" rx="1" />
          <text x="79" y="6" fill="#cbd5e1" fontSize="9">Driven (n2)</text>
        </g>
      </svg>
    </div>
  );
};
