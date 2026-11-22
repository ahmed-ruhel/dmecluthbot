"use client";

import React, { useMemo, useState } from "react";
import { formatNum } from "@/lib/engine/units";

interface ClutchWhatIfCurveProps {
  Do: number;
  mu: number;
  pMax: number;
  nPrime: number;
  currentRatio: number;
  onSelectRatio?: (ratio: number) => void;
}

export const ClutchWhatIfCurve: React.FC<ClutchWhatIfCurveProps> = ({
  Do,
  mu,
  pMax,
  nPrime,
  currentRatio,
  onSelectRatio,
}) => {
  const [hoverPoint, setHoverPoint] = useState<{ c: number; T: number; x: number; y: number } | null>(null);

  // Generate 40 points from c = 0.20 to 0.90
  const points = useMemo(() => {
    const pts = [];
    const DoMm = Do > 0 ? Do : 200;
    const muVal = mu > 0 ? mu : 0.25;
    const pVal = pMax > 0 ? pMax : 0.35;
    const n = nPrime > 0 ? nPrime : 4;

    let maxT = 0;
    for (let i = 20; i <= 90; i += 2) {
      const c = i / 100;
      // Formula for Uniform Wear: T = (1/8) * pi * mu * n' * p_max * Do^3 * c * (1 - c^2)
      const cFactor = c * (1 - c * c);
      const T_Nmm = (1 / 8) * Math.PI * muVal * n * pVal * Math.pow(DoMm, 3) * cFactor;
      const T_Nm = T_Nmm / 1000;
      if (T_Nm > maxT) maxT = T_Nm;
      pts.push({ c, T_Nm });
    }
    return { pts, maxT: maxT > 0 ? maxT : 100 };
  }, [Do, mu, pMax, nPrime]);

  // SVG coordinate transformation
  const svgW = 460;
  const svgH = 200;
  const padL = 45;
  const padR = 25;
  const padT = 30;
  const padB = 35;

  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const scaleX = (c: number) => padL + ((c - 0.2) / (0.9 - 0.2)) * plotW;
  const scaleY = (T: number) => padT + plotH - (T / (points.maxT * 1.15)) * plotH;

  // Build SVG polyline path
  const pathD = points.pts
    .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(pt.c).toFixed(1)} ${scaleY(pt.T_Nm).toFixed(1)}`)
    .join(" ");

  // Optimum point c = 0.577
  const cOpt = 0.577;
  const tOpt_Nmm = (1 / 8) * Math.PI * (mu || 0.25) * (nPrime || 4) * (pMax || 0.35) * Math.pow(Do || 200, 3) * (cOpt * (1 - cOpt * cOpt));
  const tOpt_Nm = tOpt_Nmm / 1000;
  const optX = scaleX(cOpt);
  const optY = scaleY(tOpt_Nm);

  // Current point
  const curC = Math.max(0.2, Math.min(0.9, currentRatio || 0.5));
  const curT_Nmm = (1 / 8) * Math.PI * (mu || 0.25) * (nPrime || 4) * (pMax || 0.35) * Math.pow(Do || 200, 3) * (curC * (1 - curC * curC));
  const curT_Nm = curT_Nmm / 1000;
  const curX = scaleX(curC);
  const curY = scaleY(curT_Nm);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#060a12] p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">
            What-If Parameter Curve: Torque vs. Diameter Ratio (Di / Do)
          </h4>
          <p className="text-[11px] text-slate-400">
            Optimum torque occurs mathematically at <span className="text-cyan-400 font-mono">1/&radic;3 &approx; 0.577</span>
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => onSelectRatio && onSelectRatio(0.5)}
            className={`rounded px-2 py-0.5 border transition-all ${
              Math.abs(currentRatio - 0.5) < 0.01
                ? "bg-amber-950/80 border-amber-600 text-amber-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Class: 0.50
          </button>
          <button
            onClick={() => onSelectRatio && onSelectRatio(0.577)}
            className={`rounded px-2 py-0.5 border transition-all ${
              Math.abs(currentRatio - 0.577) < 0.01
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Opt: 0.577
          </button>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((c) => (
            <g key={c}>
              <line
                x1={scaleX(c)}
                y1={padT}
                x2={scaleX(c)}
                y2={padT + plotH}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              <text
                x={scaleX(c)}
                y={padT + plotH + 16}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {c.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Torque ticks */}
          {[0, 0.5, 1.0].map((frac) => {
            const val = points.maxT * frac;
            const y = scaleY(val);
            return (
              <g key={frac}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={padL - 6} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path
            d={`${pathD} L ${scaleX(0.9)} ${padT + plotH} L ${scaleX(0.2)} ${padT + plotH} Z`}
            fill="url(#curveFill)"
          />

          {/* Main Curve */}
          <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

          {/* Optimum Point Marker (0.577) */}
          <line x1={optX} y1={optY} x2={optX} y2={padT + plotH} stroke="#06b6d4" strokeDasharray="3 3" />
          <circle cx={optX} cy={optY} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
          <text x={optX} y={optY - 8} fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            Optimum (0.577)
          </text>

          {/* Current Operating Point Marker */}
          <circle cx={curX} cy={curY} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <text x={curX} y={curY - 10} fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            Active: {formatNum(curT_Nm, 1)} N·m
          </text>

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 4} fill="#94a3b8" fontSize="10" textAnchor="middle">
            Diameter Ratio (c = Di / Do)
          </text>
          <text
            x={12}
            y={padT + plotH / 2}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90 12 ${padT + plotH / 2})`}
          >
            Torque T [N·m]
          </text>
        </svg>
      </div>
    </div>
  );
};
