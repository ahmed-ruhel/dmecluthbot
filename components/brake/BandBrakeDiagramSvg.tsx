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
  const startAngle = -Math.PI / 2 - theta_rad / 2;
  const endAngle = -Math.PI / 2 + theta_rad / 2;
  const bandR = drumR + 10;

  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const bandStart = toXY(startAngle, bandR);
  const bandEnd = toXY(endAngle, bandR);
  const largeArc = theta_deg > 180 ? 1 : 0;

  const tightEnd = toXY(startAngle, bandR + 5);
  const slackEnd = toXY(endAngle, bandR + 5);

  return (
    <div className="rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-2 mb-2">
        <span className="text-xs font-bold text-[#2d2f31] flex items-center space-x-1.5">
          <span className={`h-2 w-2 rounded-full ${isSelfLocking ? "bg-rose-500 animate-pulse" : "bg-[#a435f0]"}`} />
          <span>
            {brakeType === "simple" ? "Simple" : "Differential"} Band Brake &bull; θ = {theta_deg}&deg; wrap
          </span>
        </span>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          {isSelfLocking && (
            <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 font-bold text-rose-800">
              SELF-LOCKING
            </span>
          )}
          <span className="rounded bg-[#f6efff] px-2 py-0.5 font-bold text-[#5624d0] border border-[#d8b4fe]">
            F1/F2 = {Math.exp(mu * ((theta_deg * Math.PI) / 180)).toFixed(2)}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none font-sans">
        <defs>
          <pattern id="band-grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f2f5" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#band-grid-light)" rx="8" />

        {/* Rotating Drum */}
        <circle cx={cx} cy={cy} r={drumR} fill="#2d2f31" stroke="#1c1d1f" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="20" fill="#f7f9fa" stroke="#6a6f73" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="7" fill="#a435f0" />

        {/* Center lines */}
        <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#6a6f73" strokeWidth="1" />
        <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="#6a6f73" strokeWidth="1" />

        {/* Flexible Friction Band Arc */}
        <path
          d={`M ${bandStart.x} ${bandStart.y} A ${bandR} ${bandR} 0 ${largeArc} 1 ${bandEnd.x} ${bandEnd.y}`}
          fill="none"
          stroke="#a435f0"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Wrap Angle Dimension Arc */}
        <path
          d={`M ${cx} ${cy - drumR + 20} A ${drumR - 20} ${drumR - 20} 0 ${largeArc} 1 ${toXY(endAngle, drumR - 20).x} ${toXY(endAngle, drumR - 20).y}`}
          fill="none"
          stroke="#b4690e"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <text x={cx} y={cy - 35} fill="#b4690e" fontSize="10" fontWeight="bold" textAnchor="middle">
          &theta; = {theta_deg}&deg;
        </text>

        {/* Tight Side Force Vector F1 */}
        <line x1={tightEnd.x} y1={tightEnd.y} x2={tightEnd.x + 35} y2={tightEnd.y - 20} stroke="#b32d0f" strokeWidth="3" />
        <polygon points={`${tightEnd.x + 40},${tightEnd.y - 23} ${tightEnd.x + 28},${tightEnd.y - 26} ${tightEnd.x + 32},${tightEnd.y - 14}`} fill="#b32d0f" />
        <text x={tightEnd.x + 46} y={tightEnd.y - 22} fill="#b32d0f" fontSize="10" fontWeight="bold">
          F1 = {Math.round(F1)} N (tight)
        </text>

        {/* Slack Side Force Vector F2 */}
        <line x1={slackEnd.x} y1={slackEnd.y} x2={slackEnd.x + 25} y2={slackEnd.y + 20} stroke="#5624d0" strokeWidth="2.5" />
        <polygon points={`${slackEnd.x + 30},${slackEnd.y + 24} ${slackEnd.x + 18},${slackEnd.y + 24} ${slackEnd.x + 24},${slackEnd.y + 12}`} fill="#5624d0" />
        <text x={slackEnd.x + 35} y={slackEnd.y + 28} fill="#5624d0" fontSize="10" fontWeight="bold">
          F2 = {Math.round(F2)} N (slack)
        </text>

        {/* Drum Diameter Label */}
        <text x={cx} y={cy + 5} fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          D = {D} mm
        </text>

        {/* Band Sizing Info Box */}
        {h > 0 && b_prime > 0 && (
          <g transform={`translate(${W - 140}, ${H - 60})`}>
            <rect width="130" height="50" fill="#f7f9fa" stroke="#d1d7dc" strokeWidth="1" rx="4" />
            <text x="8" y="16" fill="#6a6f73" fontSize="9" fontWeight="bold">Band Section:</text>
            <text x="8" y="30" fill="#2d2f31" fontSize="10" fontFamily="monospace" fontWeight="bold">
              h = {h.toFixed(1)} mm
            </text>
            <text x="8" y="44" fill="#2d2f31" fontSize="10" fontFamily="monospace" fontWeight="bold">
              b&apos; = {b_prime.toFixed(1)} mm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
