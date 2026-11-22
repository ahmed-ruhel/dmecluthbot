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
    if (triggerPreset && ["B1","B2","B3","B4"].includes(triggerPreset)) {
      loadPreset(triggerPreset as "B1" | "B2" | "B3" | "B4");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPreset]);

  const s = result.success && result.summary ? result.summary : null;

  return (
    <div className="space-y-6">
      {/* Header & Preset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#070c16] p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 border border-amber-700/50">
              <RotateCcw className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Block (Shoe) Brake Studio</h2>
            <span className="rounded bg-amber-950 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300 border border-amber-800/60">
              CO6 &bull; Eq 13.17
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Short shoe brake analysis: Cases 1–3, CW/CCW moment balance, self-locking detection, heat &amp; energy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase text-slate-400 mr-1">Exam Presets:</span>
          {(["B1","B2","B3","B4"] as const).map((p) => (
            <button key={p} onClick={() => loadPreset(p)}
              className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 hover:border-amber-500 hover:bg-amber-950/40 hover:text-amber-300 transition-all">
              {p}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <ScenarioControls
            module="block_brake"
            inputs={{ ...inputs, brakeCase, rotation }}
            summaryLine={s ? `F_cw=${formatNum(s.operatingForceCwN)} N, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Geometry Case Selector + Rotation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">
            Geometry Case (Fulcrum Position)
          </label>
          <div className="space-y-1.5">
            {[
              { id:"case1", label:"Case 1 — c=0 (Ft line passes through fulcrum)", eq:"Eq 13.17(a)" },
              { id:"case2", label:"Case 2 — Ft line between drum centre & fulcrum", eq:"Eq 13.17(b,c)" },
              { id:"case3", label:"Case 3 — Fulcrum between drum centre & Ft line", eq:"Eq 13.17(d,e)" },
            ].map((cs) => (
              <button key={cs.id} onClick={() => setBrakeCase(cs.id as BlockBrakeCase)}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-all flex items-center justify-between ${
                  brakeCase === cs.id ? "bg-amber-600/20 border border-amber-600/60 text-white" : "bg-slate-950 border border-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}>
                <span>{cs.label}</span>
                <span className="text-[10px] font-mono text-amber-400">{cs.eq}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">
            Drum Rotation Direction
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(["cw","ccw"] as const).map((dir) => (
              <button key={dir} onClick={() => setRotation(dir)}
                className={`rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                  rotation === dir ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}>
                {dir === "cw" ? "↻ Clockwise (CW)" : "↺ Counter-CW (CCW)"}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-slate-950/60 border border-slate-800/50 p-2 text-[11px] text-slate-400">
            <p><span className="text-amber-400 font-semibold">Self-Energizing:</span> Ft assists shoe application (F reduced).</p>
            <p className="mt-0.5"><span className="text-rose-400 font-semibold">Self-Locking:</span> Occurs when c ≥ b/μ&apos; → F ≤ 0.</p>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                <span>Brake Geometry &amp; Load Inputs</span>
              </h3>
              <button onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1 rounded-lg bg-amber-950/60 border border-amber-800/60 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-900/60">
                <Sparkles className="h-3 w-3" />
                <span>Pick Material</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { key:"D", label:"Drum Dia D [mm]", ph:"e.g. 500" },
                { key:"contact2Theta", label:"Contact Angle 2θ [°]", ph:"60 (default if blank)" },
                { key:"a", label:"Force Arm a [mm]", ph:"e.g. 250" },
                { key:"b", label:"Fulcrum Arm b [mm]", ph:"e.g. 250" },
                { key:"c", label:"Offset c [mm]", ph:"0 for Case 1" },
                { key:"mu", label:"Friction Coeff μ", ph:"0.25" },
                { key:"torqueNm", label:"Braking Torque T [N·m]", ph:"or use AppliedForce F" },
                { key:"appliedForceN", label:"Applied Force F [N]", ph:"for reverse solve" },
                { key:"speedRpm", label:"Speed N [rpm]", ph:"for heat/energy" },
                { key:"pMax", label:"Max Pressure p [MPa]", ph:"for allowable pressure mode" },
                { key:"faceWidth", label:"Face Width b&apos; [mm]", ph:"for pressure calc" },
                { key:"timeSec", label:"Braking Duration t [s]", ph:"for energy calc" },
              ].map(({key, label, ph}) => (
                <div key={key}>
                  <label className="text-slate-400 font-medium">{label}</label>
                  <input
                    type="text"
                    placeholder={ph}
                    value={(inputs as any)[key]}
                    onChange={(e) => handleInput(key as keyof typeof inputs, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Result Cards */}
          {s && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Braking Torque</span>
                <p className="mt-1 text-lg font-bold text-amber-400 font-mono">
                  {formatNum(s.torqueNm, 2)} <span className="text-xs font-normal text-slate-400">N·m</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Applied Force F</span>
                <p className={`mt-1 text-lg font-bold font-mono ${s.isSelfLocking ? "text-rose-400" : "text-cyan-400"}`}>
                  {formatNum(s.operatingForceN, 1)} <span className="text-xs font-normal text-slate-400">N</span>
                </p>
                <span className="text-[10px]">
                  {s.isSelfLocking ? "⚠ SELF-LOCKING" : s.isSelfEnergizing ? "✓ Self-Energizing" : ""}
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Normal Force Fn</span>
                <p className="mt-1 text-sm font-bold text-white font-mono">
                  {formatNum(s.normalForceN, 0)} N
                </p>
                <span className="text-[10px] text-slate-400">μ&apos; = {formatNum(s.muPrime, 3)}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-center space-x-1">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span>Heat Rate H</span>
                </span>
                <p className="mt-1 text-sm font-bold text-orange-400 font-mono">
                  {formatNum(s.heatRateKw, 2)} kW
                </p>
                {s.heatEnergyKj > 0 && (
                  <span className="text-[10px] text-slate-400">{formatNum(s.heatEnergyKj, 1)} kJ in {inputs.timeSec}s</span>
                )}
              </div>
              <div className="col-span-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 text-xs font-mono text-slate-400 flex justify-between">
                <span>c_crit = {formatNum(s.criticalOffsetMm, 1)} mm</span>
                <span>v = {formatNum(s.surfaceSpeedMs, 2)} m/s</span>
                <span>CW: {formatNum(s.operatingForceCwN, 1)} N</span>
                <span>CCW: {formatNum(s.operatingForceCcwN, 1)} N</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagram + KaTeX Steps */}
        <div className="lg:col-span-7 space-y-6">
          <BlockBrakeDiagramSvg
            D={parsedInputs.drumDiaMm}
            a={parsedInputs.leverArmForceMm}
            b={parsedInputs.leverArmFulcrumMm}
            c={parsedInputs.fulcrumOffsetMm}
            brakeCase={brakeCase}
            rotation={rotation}
            Ft={s?.tangentialForceN ?? 0}
            Fn={s?.normalForceN ?? 0}
            F_operating={s?.operatingForceN ?? 0}
            isSelfLocking={s?.isSelfLocking ?? false}
            isSelfEnergizing={s?.isSelfEnergizing ?? false}
            twoThetaDeg={parsedInputs.contactAngleDeg ?? 60}
          />

          {result.success && (
            <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-5 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">Step-by-Step Mathematical Derivation</h3>
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
        onSelect={(muVal) => handleInput("mu", muVal.toString())}
      />
    </div>
  );
};
