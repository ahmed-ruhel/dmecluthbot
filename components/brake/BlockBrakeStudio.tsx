"use client";

import React, { useState, useMemo, useEffect } from "react";
import { solveBlockBrake, BlockBrakeInputs } from "@/lib/engine/blockBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BlockBrakeCase, RotationDirection } from "@/lib/engine/types";
import { BlockBrakeDiagramSvg } from "./BlockBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { RotateCcw, Sparkles, Sliders, CheckCircle2, Flame } from "lucide-react";

interface BlockBrakeStudioProps {
  triggerPreset?: string;
}

export const BlockBrakeStudio: React.FC<BlockBrakeStudioProps> = ({ triggerPreset }) => {
  const [brakeCase, setBrakeCase] = useState<BlockBrakeCase>("case2");
  const [rotation, setRotation] = useState<RotationDirection>("cw");
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  const [inputs, setInputs] = useState({
    D: "500",
    a: "250",
    b: "250",
    c: "75",
    contact2Theta: "60",
    mu: "0.25",
    pMax: "",
    faceWidth: "",
    torqueNm: "200",
    speedRpm: "750",
    timeSec: "",
    appliedForceN: "",
  });

  const handleInput = (k: keyof typeof inputs, v: string) =>
    setInputs((p) => ({ ...p, [k]: v }));

  const parsedInputs: BlockBrakeInputs = useMemo(() => ({
    drumDiaMm: evaluateExpression(inputs.D) || 500,
    leverArmForceMm: evaluateExpression(inputs.a) || 250,
    leverArmFulcrumMm: evaluateExpression(inputs.b) || 250,
    fulcrumOffsetMm: evaluateExpression(inputs.c) || 0,
    contactAngleDeg: evaluateExpression(inputs.contact2Theta) || undefined,
    mu: evaluateExpression(inputs.mu) || 0.25,
    pMaxMpa: evaluateExpression(inputs.pMax) || undefined,
    faceWidthMm: evaluateExpression(inputs.faceWidth) || undefined,
    torqueNm: evaluateExpression(inputs.torqueNm) || undefined,
    appliedForceN: evaluateExpression(inputs.appliedForceN) || undefined,
    speedRpm: evaluateExpression(inputs.speedRpm) || undefined,
    timeSec: evaluateExpression(inputs.timeSec) || undefined,
    caseType: brakeCase,
    rotation,
  }), [inputs, brakeCase, rotation]);

  const result = useMemo(() => {
    try {
      return solveBlockBrake(parsedInputs);
    } catch (e: any) {
      return { success: false, error: e.message, summary: null, steps: [], warnings: [] };
    }
  }, [parsedInputs]);

  // Presets B1–B4
  const loadPreset = (p: "B1" | "B2" | "B3" | "B4") => {
    if (p === "B1") {
      setBrakeCase("case2"); setRotation("cw");
      setInputs({ D:"500", a:"250", b:"250", c:"75", contact2Theta:"60", mu:"0.25", pMax:"", faceWidth:"", torqueNm:"200", speedRpm:"750", timeSec:"", appliedForceN:"" });
    } else if (p === "B2") {
      setBrakeCase("case2"); setRotation("cw");
      setInputs({ D:"500", a:"750", b:"250", c:"50", contact2Theta:"60", mu:"0.25", pMax:"", faceWidth:"", torqueNm:"500", speedRpm:"1000", timeSec:"", appliedForceN:"" });
    } else if (p === "B3") {
      setBrakeCase("case3"); setRotation("ccw");
      setInputs({ D:"200", a:"250", b:"200", c:"50", contact2Theta:"90", mu:"0.35", pMax:"", faceWidth:"", torqueNm:"", speedRpm:"", timeSec:"", appliedForceN:"700" });
    } else if (p === "B4") {
      setBrakeCase("case1"); setRotation("cw");
      setInputs({ D:"400", a:"250", b:"250", c:"0", contact2Theta:"90", mu:"0.25", pMax:"0.5", faceWidth:"50", torqueNm:"", speedRpm:"1500", timeSec:"10", appliedForceN:"" });
    }
  };

  // Allow parent (gallery) to trigger a preset by name
  useEffect(() => {
    if (triggerPreset) {
      const code = triggerPreset.split("_")[0];
      if (["B1","B2","B3","B4"].includes(code)) {
        loadPreset(code as "B1" | "B2" | "B3" | "B4");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPreset]);

  const s = result.success && result.summary ? result.summary : null;

  return (
    <div className="space-y-5">
      {/* Header & Preset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]">
              <RotateCcw className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#2d2f31]">Block (Shoe) Brake Studio</h2>
            <span className="rounded bg-[#f6efff] px-2.5 py-0.5 text-xs font-bold text-[#5624d0] border border-[#d8b4fe]">
              CO6 &bull; Eq 13.17
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Short shoe brake analysis: Cases 1–3, CW/CCW moment balance, self-locking detection, heat &amp; energy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mr-1">Exam Presets:</span>
          {(["B1","B2","B3","B4"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-md border border-[#d1d7dc] bg-white px-2.5 py-1 text-xs font-mono font-bold text-[#2d2f31] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f7f9fa] transition-all shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-[#d1d7dc] mx-1" />
          <ScenarioControls
            module="block_brake"
            inputs={{ ...inputs, brakeCase, rotation }}
            summaryLine={s ? `F_cw=${formatNum(s.operatingForceCwN)} N, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Case & Rotation Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">
            Geometry Case (Pivot &amp; Ft Line)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "case1", label: "Case 1: c = 0" },
              { id: "case2", label: "Case 2: Ft between O & center" },
              { id: "case3", label: "Case 3: O between center & Ft" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setBrakeCase(c.id as BlockBrakeCase)}
                className={`rounded-md px-2 py-1.5 text-xs font-bold transition-all text-center ${
                  brakeCase === c.id
                    ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                    : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">
            Drum Rotation Direction
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "cw", label: "↻ Clockwise (CW)" },
              { id: "ccw", label: "↺ Counter-Clockwise (CCW)" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRotation(r.id as RotationDirection)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  rotation === r.id
                    ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                    : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (5 cols) & Diagrams/Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3">
              <h3 className="text-xs font-bold text-[#2d2f31] flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-[#a435f0]" />
                <span>Brake Geometry &amp; Loads</span>
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1 rounded-md bg-[#f6efff] border border-[#d8b4fe] px-2.5 py-1 text-[11px] font-bold text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                <span>Pick Material</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Drum Dia D [mm]</label>
                  <input
                    type="text"
                    value={inputs.D}
                    onChange={(e) => handleInput("D", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Effort Arm a [mm]</label>
                  <input
                    type="text"
                    value={inputs.a}
                    onChange={(e) => handleInput("a", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Fulcrum Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Offset c [mm]</label>
                  <input
                    type="text"
                    value={inputs.c}
                    onChange={(e) => handleInput("c", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Contact Angle 2&theta; [&deg;]</label>
                  <input
                    type="text"
                    value={inputs.contact2Theta}
                    onChange={(e) => handleInput("contact2Theta", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Torque T [N·m]</label>
                  <input
                    type="text"
                    placeholder="or F applied"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInput("torqueNm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Applied Effort F [N]</label>
                  <input
                    type="text"
                    placeholder="or T"
                    value={inputs.appliedForceN}
                    onChange={(e) => handleInput("appliedForceN", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Speed N [rpm]</label>
                  <input
                    type="text"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInput("speedRpm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Braking Time t [s]</label>
                  <input
                    type="text"
                    value={inputs.timeSec}
                    onChange={(e) => handleInput("timeSec", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges */}
          {s && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Operating Force F</span>
                <p className={`mt-1 text-lg font-bold font-mono ${s.isSelfLocking ? "text-rose-600" : "text-[#5624d0]"}`}>
                  {formatNum(s.operatingForceN, 1)} <span className="text-xs font-normal text-[#6a6f73]">N</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  CW: {formatNum(s.operatingForceCwN, 0)} N | CCW: {formatNum(s.operatingForceCcwN, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Tangential Force Ft</span>
                <p className="mt-1 text-lg font-bold text-[#1e6055] font-mono">
                  {formatNum(s.tangentialForceN, 1)} <span className="text-xs font-normal text-[#6a6f73]">N</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  Fn = {formatNum(s.normalForceN, 1)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Heat Rate H</span>
                <p className="mt-1 text-sm font-bold text-[#b4690e] font-mono">
                  {formatNum(s.heatRateKw, 2)} <span className="text-xs font-normal text-[#6a6f73]">kW</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  v = {formatNum(s.surfaceSpeedMs, 2)} m/s
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Critical Offset c_crit</span>
                <p className="mt-1 text-sm font-bold text-[#2d2f31] font-mono">
                  {formatNum(s.criticalOffsetMm, 1)} <span className="text-xs font-normal text-[#6a6f73]">mm</span>
                </p>
                <span className={`text-[10px] font-bold ${s.isSelfLocking ? "text-rose-600" : "text-[#1e6055]"}`}>
                  {s.isSelfLocking ? "Self-Locking Active!" : "Safe (c < c_crit)"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-5">
          {s && (
            <BlockBrakeDiagramSvg
              D={s.drumDiaMm}
              a={s.leverA}
              b={s.leverB}
              c={s.leverC}
              brakeCase={s.caseType}
              rotation={s.rotation}
              Ft={s.tangentialForceN}
              Fn={s.normalForceN}
              F_operating={s.operatingForceN}
              isSelfLocking={s.isSelfLocking}
              isSelfEnergizing={s.isSelfEnergizing}
              twoThetaDeg={s.contactAngleDeg}
            />
          )}

          {result.success && (
            <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2f31] flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-[11px] text-[#6a6f73]">
                    Moment equilibrium about fulcrum O, equivalent μ&apos;, and thermal power calculations.
                  </p>
                </div>
              </div>

              <StepDisplay steps={result.steps} warnings={result.warnings} />
            </div>
          )}
        </div>
      </div>

      <MaterialSelectorModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        filterCategory="brake"
        onSelect={(muVal, pVal) => {
          handleInput("mu", muVal.toString());
          handleInput("pMax", pVal.toString());
        }}
      />
    </div>
  );
};
