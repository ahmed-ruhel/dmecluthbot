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

  const pathD = points.pts.reduce((acc, p, i) => {
    const x = scaleX(p.c);
    const y = scaleY(p.T_Nm);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const optX = scaleX(0.577);
  const curX = scaleX(Math.min(0.9, Math.max(0.2, currentRatio)));

  return (
    <div className="rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-2">
        <div>
          <h4 className="text-xs font-bold text-[#2d2f31]">
            Parameter Sensitivity: Torque T vs Diameter Ratio (Di / Do)
          </h4>
          <p className="text-[11px] text-[#6a6f73]">
            Analytical maximum at <span className="text-[#a435f0] font-bold">c = 1/√3 ≈ 0.577</span>. Class practice often uses <span className="font-bold text-[#b4690e]">0.5</span>.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px]">
          <button
            onClick={() => onSelectRatio && onSelectRatio(0.5)}
            className="rounded border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-0.5 font-mono font-bold text-[#2d2f31] hover:border-[#a435f0] hover:text-[#a435f0]"
          >
            0.50 (Class)
          </button>
          <button
            onClick={() => onSelectRatio && onSelectRatio(0.577)}
            className="rounded border border-[#d8b4fe] bg-[#f6efff] px-2 py-0.5 font-mono font-bold text-[#5624d0] hover:bg-[#a435f0] hover:text-white"
          >
            0.577 (Optimum)
          </button>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto select-none font-sans bg-[#f7f9fa] rounded-lg border border-[#e4e8eb]">
          {/* Grid lines */}
          {[0.3, 0.5, 0.577, 0.7, 0.8].map((c) => (
            <line
              key={c}
              x1={scaleX(c)}
              y1={padT}
              x2={scaleX(c)}
              y2={padT + plotH}
              stroke="#e4e8eb"
              strokeWidth="1"
            />
          ))}

          {/* Torque vs c Area fill and Polyline */}
          <path
            d={`${pathD} L ${scaleX(0.9)} ${padT + plotH} L ${scaleX(0.2)} ${padT + plotH} Z`}
            fill="#f6efff"
          />
          <path d={pathD} fill="none" stroke="#a435f0" strokeWidth="2.5" />

          {/* 0.577 Optimum Guideline */}
          <line
            x1={optX}
            y1={padT}
            x2={optX}
            y2={padT + plotH}
            stroke="#a435f0"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text x={optX} y={padT - 6} fill="#a435f0" fontSize="9" textAnchor="middle" fontWeight="bold">
            Opt 0.577
          </text>

          {/* Current Ratio Marker */}
          <line
            x1={curX}
            y1={padT}
            x2={curX}
            y2={padT + plotH}
            stroke="#b4690e"
            strokeWidth="2"
          />
          <circle cx={curX} cy={scaleY(points.pts.find((p) => Math.abs(p.c - currentRatio) < 0.03)?.T_Nm || 0)} r="4" fill="#b4690e" stroke="#ffffff" strokeWidth="1.5" />
          <text x={curX} y={padT + plotH + 20} fill="#b4690e" fontSize="9" textAnchor="middle" fontWeight="bold">
            Current ({currentRatio.toFixed(2)})
          </text>

          {/* Axis labels */}
          <text x={svgW / 2} y={svgH - 5} fill="#6a6f73" fontSize="10" textAnchor="middle" fontWeight="bold">
            Diameter Ratio c = Di / Do
          </text>
          <text x={12} y={padT + plotH / 2} fill="#6a6f73" fontSize="10" textAnchor="middle" transform={`rotate(-90, 12, ${padT + plotH / 2})`} fontWeight="bold">
            Torque T [N·m]
          </text>

          {/* X ticks */}
          {[0.2, 0.4, 0.6, 0.8].map((c) => (
            <text key={c} x={scaleX(c)} y={padT + plotH + 12} fill="#6a6f73" fontSize="9" textAnchor="middle" fontFamily="monospace">
              {c.toFixed(1)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
