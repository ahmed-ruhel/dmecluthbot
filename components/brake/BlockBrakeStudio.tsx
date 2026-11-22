"use client";

import React, { useState, useMemo, useEffect } from "react";
import { solveBlockBrake, BlockBrakeInputs } from "@/lib/engine/blockBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BlockBrakeCase, RotationDirection } from "@/lib/engine/types";
import { BlockBrakeDiagramSvg } from "./BlockBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { RotateCcw, Sparkles, Sliders, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header & Preset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm">
              <RotateCcw className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                  Block (Shoe) Brake Studio
                </h1>
                <span className="rounded-md bg-[#f6efff] px-3 py-1 text-xs font-black text-[#5624d0] border border-[#d8b4fe]">
                  CO6 &bull; Eq 13.17
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#4b5563]">
                Short shoe brake analysis: Cases 1–3, CW/CCW moment balance, self-locking boundary, heat &amp; energy.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#4b5563] mr-1">Exam Presets:</span>
          {(["B1","B2","B3","B4"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-1.5 text-xs sm:text-sm font-mono font-black text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f6efff]/40 transition-all shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-6 w-[1.5px] bg-[#d1d7dc] mx-1.5" />
          <ScenarioControls
            module="block_brake"
            inputs={{ ...inputs, brakeCase, rotation }}
            summaryLine={s ? `F_cw=${formatNum(s.operatingForceCwN)} N, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Case & Rotation Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-5 shadow-sm">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
            Geometry Case (Pivot &amp; Ft Line)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "case1", label: "Case 1: c = 0" },
              { id: "case2", label: "Case 2: Ft between O & center" },
              { id: "case3", label: "Case 3: O between center & Ft" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setBrakeCase(c.id as BlockBrakeCase)}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-extrabold transition-all text-center ${
                  brakeCase === c.id
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-5 shadow-sm">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
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
                className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                  rotation === r.id
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (5 cols) & Diagrams/Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#e4e8eb] pb-3.5">
              <h3 className="text-sm sm:text-base font-black text-[#1c1d1f] flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-[#a435f0]" />
                <span>Brake Geometry &amp; Loads</span>
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-lg bg-[#f6efff] border border-[#d8b4fe] px-3 py-1.5 text-xs font-black text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pick Material</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Drum Dia D [mm]</label>
                  <input
                    type="text"
                    value={inputs.D}
                    onChange={(e) => handleInput("D", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Effort Arm a [mm]</label>
                  <input
                    type="text"
                    value={inputs.a}
                    onChange={(e) => handleInput("a", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Fulcrum Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Offset c [mm]</label>
                  <input
                    type="text"
                    value={inputs.c}
                    onChange={(e) => handleInput("c", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Contact Angle 2&theta; [&deg;]</label>
                  <input
                    type="text"
                    value={inputs.contact2Theta}
                    onChange={(e) => handleInput("contact2Theta", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Torque T [N·m]</label>
                  <input
                    type="text"
                    placeholder="or F applied"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInput("torqueNm", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Applied Effort F [N]</label>
                  <input
                    type="text"
                    placeholder="or T"
                    value={inputs.appliedForceN}
                    onChange={(e) => handleInput("appliedForceN", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Speed N [rpm]</label>
                  <input
                    type="text"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInput("speedRpm", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Braking Time t [s]</label>
                  <input
                    type="text"
                    value={inputs.timeSec}
                    onChange={(e) => handleInput("timeSec", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges (Punchy & Bold) */}
          {s && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center shadow-sm hover:border-[#5624d0]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Operating Force F</span>
                <p className={`mt-1 text-2xl sm:text-3xl font-black font-mono ${s.isSelfLocking ? "text-rose-600" : "text-[#5624d0]"}`}>
                  {formatNum(s.operatingForceN, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  CW: {formatNum(s.operatingForceCwN, 0)} N | CCW: {formatNum(s.operatingForceCcwN, 0)} N
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center shadow-sm hover:border-[#1e6055]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Tangential Force Ft</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1e6055] font-mono">
                  {formatNum(s.tangentialForceN, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  Fn = {formatNum(s.normalForceN, 1)} N
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center shadow-sm hover:border-[#b4690e]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Heat Rate H</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#b4690e] font-mono">
                  {formatNum(s.heatRateKw, 2)} <span className="text-sm font-extrabold text-[#4b5563]">kW</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  v = {formatNum(s.surfaceSpeedMs, 2)} m/s
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-4 text-center shadow-sm hover:border-[#1c1d1f]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Critical Offset c_crit</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1c1d1f] font-mono">
                  {formatNum(s.criticalOffsetMm, 1)} <span className="text-sm font-extrabold text-[#4b5563]">mm</span>
                </p>
                <span className={`text-xs font-black ${s.isSelfLocking ? "text-rose-600" : "text-[#1e6055]"}`}>
                  {s.isSelfLocking ? "Self-Locking Active!" : "Safe (c < c_crit)"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
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
            <div className="rounded-2xl border-2 border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-[#e4e8eb] pb-3.5 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1c1d1f] flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-xs font-semibold text-[#6b7280]">
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
