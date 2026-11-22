"use client";

import React from "react";

interface BlockBrakeDiagramProps {
  D: number;
  a: number;
  b: number;
  c: number;
  brakeCase: "case1" | "case2" | "case3";
  rotation: "cw" | "ccw";
  Ft: number;
  Fn: number;
  F_operating: number;
  isSelfLocking: boolean;
  isSelfEnergizing: boolean;
  twoThetaDeg: number;
}

export const BlockBrakeDiagramSvg: React.FC<BlockBrakeDiagramProps> = ({
  D,
  a,
  b,
  c,
  brakeCase,
  rotation,
  Ft,
  Fn,
  F_operating,
  isSelfLocking,
  isSelfEnergizing,
  twoThetaDeg,
}) => {
  const W = 500;
  const H = 300;
  const cx = 200;
  const cy = 150;
  const drumR = 80;
  const isHot = Ft > 500;

  // Shoe arc angle
  const thetaHalf = (twoThetaDeg / 2) * (Math.PI / 180);
  const shoeStartAngle = -thetaHalf + Math.PI / 2;
  const shoeEndAngle = thetaHalf + Math.PI / 2;

  // Shoe arc path (bottom of drum)
  const shoeOuter = drumR + 14;
  const sx1 = cx + shoeOuter * Math.cos(shoeStartAngle);
  const sy1 = cy + shoeOuter * Math.sin(shoeStartAngle);
  const sx2 = cx + shoeOuter * Math.cos(shoeEndAngle);
  const sy2 = cy + shoeOuter * Math.sin(shoeEndAngle);
  const si1 = cx + drumR * Math.cos(shoeStartAngle);
  const si2_y = cy + drumR * Math.sin(shoeStartAngle);
  const si3 = cx + drumR * Math.cos(shoeEndAngle);
  const si4_y = cy + drumR * Math.sin(shoeEndAngle);

  // Fulcrum position
  const pivotX = cx + drumR + 50;
  const pivotY = cy + (brakeCase === "case1" ? 0 : c > 0 ? -20 : 0);

  // Lever end
  const leverEndX = pivotX + (a / Math.max(a, b, 1)) * 90;
  const leverEndY = pivotY;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#060a12] p-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isSelfLocking
                ? "bg-rose-500 animate-pulse"
                : isSelfEnergizing
                ? "bg-amber-400 animate-pulse"
                : "bg-cyan-400"
            }`}
          />
          <span>
            Drum Brake Geometry &bull; {brakeCase.toUpperCase()} &bull;{" "}
            {rotation.toUpperCase()} Rotation
          </span>
        </span>
        {isSelfLocking && (
          <span className="rounded-lg bg-rose-950/80 border border-rose-700 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
            ⚠ SELF-LOCKING
          </span>
        )}
        {isSelfEnergizing && !isSelfLocking && (
          <span className="rounded-lg bg-amber-950/80 border border-amber-700 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            ✓ Self-Energizing
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ maxHeight: "300px" }}>
        <defs>
          {/* Drum gradient — ember glow when hot */}
          <radialGradient id="drumGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isHot ? "#7c2d12" : "#1e293b"} stopOpacity="0.9" />
            <stop offset="100%" stopColor={isHot ? "#b45309" : "#0f172a"} stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
          </radialGradient>

          <marker id="arrowB" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" />
          </marker>
          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
          </marker>
          <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Ember glow halo when high heat */}
        {isHot && (
          <circle cx={cx} cy={cy} r={drumR + 24} fill="url(#emberGlow)" />
        )}

        {/* Main drum */}
        <circle cx={cx} cy={cy} r={drumR} fill="url(#drumGrad)" stroke={isHot ? "#c2410c" : "#334155"} strokeWidth="2.5" />

        {/* Rotation direction arc */}
        <path
          d={rotation === "cw"
            ? `M ${cx + drumR * 0.5} ${cy - 20} A 25 25 0 1 1 ${cx + 20} ${cy + drumR * 0.5}`
            : `M ${cx + 20} ${cy + drumR * 0.5} A 25 25 0 1 0 ${cx + drumR * 0.5} ${cy - 20}`}
          fill="none"
          stroke={isHot ? "#f97316" : "#64748b"}
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <text x={cx} y={cy + 6} fill={isHot ? "#f97316" : "#64748b"} fontSize="11" textAnchor="middle" fontFamily="monospace">
          {rotation.toUpperCase()} {rotation === "cw" ? "→" : "←"}
        </text>
        <text x={cx} y={cy - 12} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
          D = {D} mm
        </text>

        {/* Brake shoe arc */}
        <path
          d={`M ${sx1} ${sy1} A ${shoeOuter} ${shoeOuter} 0 0 1 ${sx2} ${sy2} L ${si3} ${si4_y} A ${drumR} ${drumR} 0 0 0 ${si1} ${si2_y} Z`}
          fill={isSelfLocking ? "#4c0519" : "#0c1a2e"}
          stroke={isSelfLocking ? "#f43f5e" : "#0891b2"}
          strokeWidth="1.5"
        />

        {/* Contact zone label */}
        <text
          x={cx}
          y={cy + drumR + 28}
          fill="#38bdf8"
          fontSize="9"
          textAnchor="middle"
          fontFamily="monospace"
        >
          2θ = {twoThetaDeg}°
        </text>

        {/* Fulcrum pivot */}
        <circle cx={pivotX} cy={pivotY} r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
        <text x={pivotX + 10} y={pivotY - 8} fill="#64748b" fontSize="9" fontFamily="monospace">
          Pivot
        </text>

        {/* Lever */}
        <line
          x1={cx + drumR + 14}
          y1={pivotY}
          x2={leverEndX}
          y2={leverEndY}
          stroke="#475569"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={cx + drumR + 14}
          y1={pivotY}
          x2={cx + drumR + 14}
          y2={cy + 20}
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Arm labels a and b */}
        <text x={pivotX + 20} y={leverEndY - 6} fill="#94a3b8" fontSize="9" fontFamily="monospace">
          a = {a} mm
        </text>
        <text x={cx + drumR + 25} y={pivotY - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace">
          b = {b} mm
        </text>

        {/* Force c offset indicator */}
        {c > 0 && (
          <>
            <line
              x1={cx + drumR + 14}
              y1={pivotY}
              x2={cx + drumR + 14}
              y2={pivotY + 25}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text x={cx + drumR + 18} y={pivotY + 20} fill="#f59e0b" fontSize="9" fontFamily="monospace">
              c = {c}
            </text>
          </>
        )}

        {/* Fn normal reaction */}
        <line
          x1={cx + drumR + 5}
          y1={cy}
          x2={cx + drumR - 20}
          y2={cy}
          stroke="#f43f5e"
          strokeWidth="2"
          markerEnd="url(#arrowRed)"
        />
        <text x={cx + drumR + 7} y={cy - 6} fill="#f43f5e" fontSize="9" fontFamily="monospace">
          Fn = {Fn > 0 ? Fn.toFixed(0) : "?"} N
        </text>

        {/* Ft tangential force */}
        <line
          x1={cx + 5}
          y1={cy + drumR - 5}
          x2={cx + (rotation === "cw" ? 40 : -40)}
          y2={cy + drumR - 5}
          stroke="#f59e0b"
          strokeWidth="2"
          markerEnd="url(#arrowAmber)"
        />
        <text
          x={cx + (rotation === "cw" ? 45 : -45)}
          y={cy + drumR + 3}
          fill="#f59e0b"
          fontSize="9"
          fontFamily="monospace"
          textAnchor={rotation === "cw" ? "start" : "end"}
        >
          Ft = {Ft > 0 ? Ft.toFixed(0) : "?"} N
        </text>

        {/* Applied force F at lever */}
        {F_operating > 0 && (
          <>
            <line
              x1={leverEndX + 30}
              y1={leverEndY}
              x2={leverEndX + 5}
              y2={leverEndY}
              stroke="#06b6d4"
              strokeWidth="2.5"
              markerEnd="url(#arrowB)"
            />
            <text x={leverEndX + 32} y={leverEndY - 6} fill="#06b6d4" fontSize="9" fontFamily="monospace">
              F = {F_operating.toFixed(0)} N
            </text>
          </>
        )}

        {/* Case label badge */}
        <rect x="8" y="8" width="90" height="22" rx="5" fill="#0c1a2e" stroke="#1e293b" />
        <text x="53" y="23" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
          {brakeCase === "case1" ? "Case 1 (c=0)" : brakeCase === "case2" ? "Case 2 (Ft btw fulc & ctr)" : "Case 3 (Fulc btw Ft & ctr)"}
        </text>
      </svg>
    </div>
  );
};
