"use client";

import React from "react";

interface BandBrakeDiagramProps {
  D: number;
  theta_deg: number;
  mu: number;
  F1: number;
  F2: number;
  brakeType: "simple" | "differential";
  isSelfLocking: boolean;
  h?: number;
  b_prime?: number;
}

export const BandBrakeDiagramSvg: React.FC<BandBrakeDiagramProps> = ({
  D,
  theta_deg,
  mu,
  F1,
  F2,
  brakeType,
  isSelfLocking,
  h = 0,
  b_prime = 0,
}) => {
  const W = 480;
  const H = 280;
  const cx = 170;
  const cy = 140;
  const drumR = 80;

  const theta_rad = (theta_deg * Math.PI) / 180;
  // Start and end angles for the wrapped band
  const startAngle = -Math.PI / 2 - theta_rad / 2;
  const endAngle = -Math.PI / 2 + theta_rad / 2;
  const bandR = drumR + 10;

  // Convert to x,y
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const bandStart = toXY(startAngle, bandR);
  const bandEnd = toXY(endAngle, bandR);
  const largeArc = theta_deg > 180 ? 1 : 0;

  // Tight and slack side endpoints
  const tightEnd = toXY(startAngle, bandR + 5);
  const slackEnd = toXY(endAngle, bandR + 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#060a12] p-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <span className={`h-2 w-2 rounded-full ${isSelfLocking ? "bg-rose-500 animate-pulse" : "bg-emerald-400"}`} />
          <span>
            {brakeType === "simple" ? "Simple" : "Differential"} Band Brake &bull; θ = {theta_deg}° wrap
          </span>
        </span>
        {isSelfLocking && (
          <span className="rounded-lg bg-rose-950/80 border border-rose-700 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 animate-pulse">
            ⚠ SELF-LOCKING
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ maxHeight: "280px" }}>
        <defs>
          <radialGradient id="drumGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
          </radialGradient>
          <marker id="arrowTight" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
          </marker>
          <marker id="arrowSlack" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" />
          </marker>
        </defs>

        {/* Drum */}
        <circle cx={cx} cy={cy} r={drumR} fill="url(#drumGrad2)" stroke="#334155" strokeWidth="2.5" />
        <text x={cx} y={cy + 5} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
          D = {D} mm
        </text>

        {/* Band arc */}
        <path
          d={`M ${bandStart.x} ${bandStart.y} A ${bandR} ${bandR} 0 ${largeArc} 1 ${bandEnd.x} ${bandEnd.y}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Wrap angle arc (inner drum indicator) */}
        <path
          d={`M ${toXY(startAngle, drumR - 15).x} ${toXY(startAngle, drumR - 15).y}
              A ${drumR - 15} ${drumR - 15} 0 ${largeArc} 1
              ${toXY(endAngle, drumR - 15).x} ${toXY(endAngle, drumR - 15).y}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.5"
        />

        {/* θ label */}
        <text
          x={cx + (drumR - 25) * Math.cos((startAngle + endAngle) / 2)}
          y={cy + (drumR - 25) * Math.sin((startAngle + endAngle) / 2) + 4}
          fill="#10b981"
          fontSize="11"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
        >
          θ
        </text>

        {/* Tight side F1 arrow */}
        <line
          x1={tightEnd.x}
          y1={tightEnd.y}
          x2={tightEnd.x + 55 * Math.cos(startAngle - 0.3)}
          y2={tightEnd.y + 55 * Math.sin(startAngle - 0.3)}
          stroke="#f43f5e"
          strokeWidth="2.5"
          markerEnd="url(#arrowTight)"
        />
        <text
          x={tightEnd.x + 60 * Math.cos(startAngle - 0.3)}
          y={tightEnd.y + 60 * Math.sin(startAngle - 0.3)}
          fill="#f43f5e"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          F1 (Tight)
        </text>
        <text
          x={tightEnd.x + 60 * Math.cos(startAngle - 0.3)}
          y={tightEnd.y + 60 * Math.sin(startAngle - 0.3) + 10}
          fill="#f43f5e"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {F1 > 0 ? F1.toFixed(0) : "?"} N
        </text>

        {/* Slack side F2 arrow */}
        <line
          x1={slackEnd.x}
          y1={slackEnd.y}
          x2={slackEnd.x + 55 * Math.cos(endAngle + 0.3)}
          y2={slackEnd.y + 55 * Math.sin(endAngle + 0.3)}
          stroke="#06b6d4"
          strokeWidth="2.5"
          markerEnd="url(#arrowSlack)"
        />
        <text
          x={slackEnd.x + 60 * Math.cos(endAngle + 0.3)}
          y={slackEnd.y + 60 * Math.sin(endAngle + 0.3)}
          fill="#06b6d4"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          F2 (Slack)
        </text>
        <text
          x={slackEnd.x + 60 * Math.cos(endAngle + 0.3)}
          y={slackEnd.y + 60 * Math.sin(endAngle + 0.3) + 10}
          fill="#06b6d4"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {F2 > 0 ? F2.toFixed(0) : "?"} N
        </text>

        {/* Band tension ratio label */}
        <text x={cx + drumR + 15} y={cy - 25} fill="#94a3b8" fontSize="9" fontFamily="monospace">
          F1/F2 = e^(μθ)
        </text>
        <text x={cx + drumR + 15} y={cy - 13} fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
          = {Math.exp(mu * theta_deg * Math.PI / 180).toFixed(3)}
        </text>

        {/* Band sizing info */}
        {h > 0 && b_prime > 0 && (
          <g>
            <text x={cx + drumR + 15} y={cy + 5} fill="#94a3b8" fontSize="9" fontFamily="monospace">
              h = {h.toFixed(1)} mm
            </text>
            <text x={cx + drumR + 15} y={cy + 17} fill="#94a3b8" fontSize="9" fontFamily="monospace">
              b&apos; = {b_prime.toFixed(1)} mm
            </text>
          </g>
        )}

        {/* Differential indicator */}
        {brakeType === "differential" && (
          <g>
            <rect x="8" y="8" width="110" height="20" rx="4" fill="#0c1a2e" stroke="#1e293b" />
            <text x="63" y="22" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">
              Differential Band (b1, b2)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
