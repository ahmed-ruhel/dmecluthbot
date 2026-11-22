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

  return (
    <div className="rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-2 mb-2">
        <span className="text-xs font-bold text-[#2d2f31] flex items-center space-x-1.5">
          <span className={`h-2 w-2 rounded-full ${isHot ? "bg-amber-500 animate-pulse" : "bg-[#a435f0]"}`} />
          <span>
            {brakeCase.toUpperCase()} &bull; {rotation.toUpperCase()} &bull; 2θ = {twoThetaDeg}°
          </span>
        </span>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          {isSelfLocking && (
            <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 font-bold text-rose-800">
              SELF-LOCKING (F &le; 0)
            </span>
          )}
          {isSelfEnergizing && !isSelfLocking && (
            <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-bold text-emerald-800">
              Self-Energizing
            </span>
          )}
          {!isSelfEnergizing && !isSelfLocking && (
            <span className="rounded bg-[#f7f9fa] border border-[#d1d7dc] px-2 py-0.5 font-bold text-[#6a6f73]">
              Non-Energizing
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none font-sans">
        <defs>
          <pattern id="block-grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f2f5" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#block-grid-light)" rx="8" />

        {/* Rotating Drum */}
        <circle
          cx={cx}
          cy={cy}
          r={drumR}
          fill="#2d2f31"
          stroke="#1c1d1f"
          strokeWidth="3"
        />

        {/* Inner Hub */}
        <circle cx={cx} cy={cy} r="25" fill="#f7f9fa" stroke="#6a6f73" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="8" fill="#a435f0" />

        {/* Center lines */}
        <line x1={cx - 15} y1={cy} x2={cx + 15} y2={cy} stroke="#6a6f73" strokeWidth="1" />
        <line x1={cx} y1={cy - 15} x2={cx} y2={cy + 15} stroke="#6a6f73" strokeWidth="1" />

        {/* Rotation Direction Arrow */}
        {rotation === "cw" ? (
          <g transform={`translate(${cx}, ${cy})`}>
            <path
              d="M -40,-40 A 55 55 0 0 1 40,-40"
              fill="none"
              stroke="#a435f0"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <polygon points="40,-46 50,-38 40,-32" fill="#a435f0" />
            <text x="0" y="-62" fill="#a435f0" fontSize="10" fontWeight="bold" textAnchor="middle">
              CW Rotation
            </text>
          </g>
        ) : (
          <g transform={`translate(${cx}, ${cy})`}>
            <path
              d="M 40,-40 A 55 55 0 0 0 -40,-40"
              fill="none"
              stroke="#a435f0"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <polygon points="-40,-46 -50,-38 -40,-32" fill="#a435f0" />
            <text x="0" y="-62" fill="#a435f0" fontSize="10" fontWeight="bold" textAnchor="middle">
              CCW Rotation
            </text>
          </g>
        )}

        {/* Brake Shoe (Friction Arc) */}
        <path
          d={`M ${sx1} ${sy1} A ${shoeOuter} ${shoeOuter} 0 0 1 ${sx2} ${sy2} L ${si3} ${si4_y} A ${drumR} ${drumR} 0 0 0 ${si1} ${si2_y} Z`}
          fill="#f6efff"
          stroke="#a435f0"
          strokeWidth="2"
        />

        {/* Lever Body */}
        <rect
          x={cx - 60}
          y={cy + drumR + 10}
          width={pivotX - (cx - 60) + 40}
          height="14"
          fill="#e4e8eb"
          stroke="#6a6f73"
          strokeWidth="1.5"
          rx="3"
        />

        {/* Fulcrum Pin */}
        <circle cx={pivotX} cy={cy + drumR + 17} r="7" fill="#ffffff" stroke="#2d2f31" strokeWidth="2" />
        <circle cx={pivotX} cy={cy + drumR + 17} r="3" fill="#2d2f31" />
        <polygon
          points={`${pivotX},${cy + drumR + 24} ${pivotX - 10},${cy + drumR + 42} ${pivotX + 10},${cy + drumR + 42}`}
          fill="#2d2f31"
        />
        <text x={pivotX} y={cy + drumR + 54} fill="#6a6f73" fontSize="9" textAnchor="middle" fontWeight="bold">
          Fulcrum O
        </text>

        {/* Applied Effort Force F Arrow */}
        <g transform={`translate(${cx - 50}, ${cy + drumR + 17})`}>
          <line x1="0" y1="50" x2="0" y2="10" stroke="#5624d0" strokeWidth="3" />
          <polygon points="0,0 -5,12 5,12" fill="#5624d0" />
          <text x="-8" y="32" fill="#5624d0" fontSize="10" fontWeight="bold" textAnchor="end">
            F = {Math.round(F_operating)} N
          </text>
        </g>

        {/* Dimension Labels */}
        <text x={cx} y={cy + 5} fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          D = {D} mm
        </text>
        <text x={(cx + pivotX) / 2} y={cy + drumR + 32} fill="#6a6f73" fontSize="9" textAnchor="middle" fontFamily="monospace">
          b = {b} mm
        </text>
        <text x={cx - 40} y={cy + drumR + 32} fill="#6a6f73" fontSize="9" textAnchor="middle" fontFamily="monospace">
          a = {a} mm
        </text>
      </svg>
    </div>
  );
};
