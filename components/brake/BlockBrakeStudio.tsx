"use client";

import React, { useState, useMemo, useEffect } from "react";
import { solveBlockBrake, BlockBrakeInputs } from "@/lib/engine/blockBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BlockBrakeCase, RotationDirection } from "@/lib/engine/types";
import { BlockBrakeDiagramSvg } from "./BlockBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { RotateCcw, Sparkles, Sliders, CheckCircle2, Gauge } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f172a] text-[#38bdf8] border border-[#1e293b] shadow-sm">
              <RotateCcw className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
                  Block (Shoe) Brake Studio
                </h1>
                <span className="rounded bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                  MODULE: BLOCK BRAKE &bull; Eq 13.17
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-[#64748b]">
                Fulcrum moment equilibrium, self-energizing / self-locking boundary criteria, and thermal energy dissipation.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b] mr-1">
            Presets:
          </span>
          {(["B1","B2","B3","B4"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1 text-xs font-mono font-bold text-[#0f172a] hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-[#e0f2fe]/40 transition-all shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-5 w-[1px] bg-[#cbd5e1] mx-1.5" />
          <ScenarioControls
            module="block_brake"
            inputs={{ ...inputs, brakeCase, rotation }}
            summaryLine={s ? `F_cw=${formatNum(s.operatingForceCwN)} N, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Case & Rotation Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Fulcrum Offset Case</span>
            </label>
            <span className="text-[10px] font-mono text-[#64748b]">Pivot Line vs Center</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "case1", label: "Case 1: c = 0" },
              { id: "case2", label: "Case 2: Ft between O & center" },
              { id: "case3", label: "Case 3: O between center & Ft" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setBrakeCase(c.id as BlockBrakeCase)}
                className={`rounded-md px-2 py-2 text-xs font-bold transition-all text-center border ${
                  brakeCase === c.id
                    ? "bg-[#0f172a] text-[#ffffff] border-[#0f172a] shadow-sm"
                    : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Drum Rotation Sense</span>
            </label>
            <span className="text-[10px] font-mono text-[#64748b]">Affects Ft Moment Sign</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "cw", label: "↻ Clockwise (CW)" },
              { id: "ccw", label: "↺ Counter-Clockwise (CCW)" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRotation(r.id as RotationDirection)}
                className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                  rotation === r.id
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                    : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
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
          <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-[#0284c7]" />
                  <span>Geometry &amp; Moment Arms</span>
                </h3>
                <span className="text-[11px] text-[#64748b]">Distances relative to fulcrum pivot O</span>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] px-2.5 py-1 text-xs font-mono font-bold text-[#0369a1] border border-[#cbd5e1] transition-all"
              >
                <Sparkles className="h-3 w-3 text-[#0284c7]" />
                <span>Lining Material</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Drum Dia D <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.D}
                    onChange={(e) => handleInput("D", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Effort Arm a <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.a}
                    onChange={(e) => handleInput("a", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Fulcrum Arm b <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Offset c <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.c}
                    onChange={(e) => handleInput("c", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Contact 2&theta; <span className="font-mono text-[#64748b]">[&deg;]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.contact2Theta}
                    onChange={(e) => handleInput("contact2Theta", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Friction Coeff &mu;
                  </label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Torque T <span className="font-mono text-[#64748b]">[N·m]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="or F applied"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInput("torqueNm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Applied Force F <span className="font-mono text-[#64748b]">[N]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="or T"
                    value={inputs.appliedForceN}
                    onChange={(e) => handleInput("appliedForceN", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Speed N <span className="font-mono text-[#64748b]">[rpm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInput("speedRpm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Braking Time t <span className="font-mono text-[#64748b]">[s]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.timeSec}
                    onChange={(e) => handleInput("timeSec", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges */}
          {s && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#2563eb]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Operating Effort F</span>
                <p className={`mt-0.5 text-xl sm:text-2xl font-black font-mono ${s.isSelfLocking ? "text-rose-600" : "text-[#0f172a]"}`}>
                  {formatNum(s.operatingForceN, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  CW: {formatNum(s.operatingForceCwN, 0)} N | CCW: {formatNum(s.operatingForceCcwN, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#059669]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Tangential Force Ft</span>
                <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#0f172a] font-mono">
                  {formatNum(s.tangentialForceN, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N</span>
                </p>
                <span className="text-[11px] text-[#059669] font-mono font-bold">
                  Fn = {formatNum(s.normalForceN, 1)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#d97706]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Thermal Rate H</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {formatNum(s.heatRateKw, 2)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">kW</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  v = {formatNum(s.surfaceSpeedMs, 2)} m/s
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#0284c7]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Offset Limit c_crit</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {formatNum(s.criticalOffsetMm, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">mm</span>
                </p>
                <span className={`text-[11px] font-mono font-bold ${s.isSelfLocking ? "text-rose-600" : "text-[#059669]"}`}>
                  {s.isSelfLocking ? "Self-Locking Detected" : "Stable (c < c_crit)"}
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
            <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 mb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                    <span>Deterministic Mathematical Calculations</span>
                  </h3>
                  <p className="text-[11px] font-medium text-[#64748b]">
                    Fulcrum O moment equilibrium, equivalent friction &mu;&apos;, and energy balance.
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
