"use client";

import React, { useState, useMemo, useEffect } from "react";
import { solveBlockBrake, BlockBrakeInputs } from "@/lib/engine/blockBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BlockBrakeCase, RotationDirection } from "@/lib/engine/types";
import { BlockBrakeDiagramSvg } from "./BlockBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import {
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Compass,
  AlertTriangle,
  Flame,
} from "lucide-react";

interface BlockBrakeStudioProps {
  triggerPreset?: string;
  initialInputs?: Record<string, unknown> | null;
  onOpenAiModal?: () => void;
}

type BlockBrakeGoal = "find_force" | "find_torque" | "find_from_pressure";

export const BlockBrakeStudio: React.FC<BlockBrakeStudioProps> = ({
  triggerPreset,
  initialInputs,
  onOpenAiModal,
}) => {
  const [brakeCase, setBrakeCase] = useState<BlockBrakeCase>("case2");
  const [rotation, setRotation] = useState<RotationDirection>("cw");
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [solveGoal, setSolveGoal] = useState<BlockBrakeGoal>("find_force");

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

  // Populate from AI parser if applied
  useEffect(() => {
    if (initialInputs) {
      setInputs((prev) => {
        const next = { ...prev };
        Object.entries(initialInputs).forEach(([k, v]) => {
          if (v !== null && v !== undefined && k in next) {
            (next as any)[k] = String(v);
          }
        });
        return next;
      });
    }
  }, [initialInputs]);

  // Clear inputs to start a fresh user problem
  const handleClearAll = () => {
    setInputs({
      D: "",
      a: "",
      b: "",
      c: "",
      contact2Theta: "60",
      mu: "0.25",
      pMax: "",
      faceWidth: "",
      torqueNm: "",
      speedRpm: "",
      timeSec: "",
      appliedForceN: "",
    });
  };

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
      setSolveGoal("find_force");
      setBrakeCase("case2"); setRotation("cw");
      setInputs({ D:"500", a:"250", b:"250", c:"75", contact2Theta:"60", mu:"0.25", pMax:"", faceWidth:"", torqueNm:"200", speedRpm:"750", timeSec:"", appliedForceN:"" });
    } else if (p === "B2") {
      setSolveGoal("find_force");
      setBrakeCase("case2"); setRotation("cw");
      setInputs({ D:"500", a:"750", b:"250", c:"50", contact2Theta:"60", mu:"0.25", pMax:"", faceWidth:"", torqueNm:"500", speedRpm:"1000", timeSec:"", appliedForceN:"" });
    } else if (p === "B3") {
      setSolveGoal("find_torque");
      setBrakeCase("case3"); setRotation("ccw");
      setInputs({ D:"200", a:"250", b:"200", c:"50", contact2Theta:"90", mu:"0.35", pMax:"", faceWidth:"", torqueNm:"", speedRpm:"", timeSec:"", appliedForceN:"700" });
    } else if (p === "B4") {
      setSolveGoal("find_from_pressure");
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
    <div className="space-y-6 animate-fade-in-scale">
      {/* Header & Preset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm transition-transform duration-300 hover:scale-105">
              <RotateCcw className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                Block (Shoe) Brake Studio
              </h1>
              <p className="text-xs text-[#6a6f73] mt-0.5">
                Moments about fulcrum, short shoe equivalent &mu;&apos;, self-locking threshold, and heat dissipation rate.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Presets & Scenario */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#6a6f73] mr-1">
            Presets:
          </span>
          {(["B1","B2","B3","B4"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-lg border border-[#d1d7dc] bg-white px-3 py-1.5 text-xs sm:text-sm font-mono font-black text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f6efff]/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-[#d1d7dc] mx-1" />
          <ScenarioControls
            module="block_brake"
            inputs={{ ...inputs, brakeCase, rotation }}
            summaryLine={s ? `F_cw=${formatNum(s.operatingForceCwN)} N, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Problem Goal Switcher */}
      <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-2.5 flex items-center space-x-2">
          <Compass className="h-4 w-4 text-[#a435f0]" />
          <span>What is given in your problem statement?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "find_force",
              label: "Given Torque T / Power → Find Operating Effort F",
              desc: "Problems like B1 & B2 where torque capacity is required.",
            },
            {
              id: "find_torque",
              label: "Given Applied Force F → Find Braking Torque T",
              desc: "Problems like B3 where lever effort is known.",
            },
            {
              id: "find_from_pressure",
              label: "Given Allowable Pressure p & Width b' → Sizing & Energy",
              desc: "Problems like B4 where shoe lining limits are specified.",
            },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setSolveGoal(g.id as BlockBrakeGoal)}
              className={`p-3 rounded-lg border text-left transition-all ${
                solveGoal === g.id
                  ? "border-[#a435f0] bg-[#f6efff]/50 shadow-sm ring-1 ring-[#a435f0]"
                  : "border-[#d1d7dc] bg-[#f7f9fa] hover:bg-white hover:border-[#a435f0]"
              }`}
            >
              <p className="text-xs font-black text-[#1c1d1f]">{g.label}</p>
              <p className="text-[11px] text-[#6a6f73] mt-0.5">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Case & Rotation Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
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
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 text-center hover:-translate-y-0.5 active:scale-95 ${
                  brakeCase === c.id
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
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
                className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  rotation === r.id
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
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
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-6 shadow-sm space-y-5 transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#1c1d1f] flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-[#a435f0]" />
                  <span>Brake Geometry &amp; Loads</span>
                </h3>
                <p className="text-[11px] text-[#6a6f73]">Enter values for your shoe brake problem.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAll}
                  className="flex items-center space-x-1 rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-2.5 py-1.5 text-xs font-bold text-[#6a6f73] hover:text-[#1c1d1f] hover:bg-white transition-all shadow-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={() => setIsMaterialModalOpen(true)}
                  className="flex items-center space-x-1.5 rounded-lg bg-[#f6efff] border border-[#d8b4fe] px-3 py-1.5 text-xs font-black text-[#5624d0] hover:bg-[#a435f0] hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pick Material</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Drum Dia D [mm]</label>
                  <input
                    type="text"
                    value={inputs.D}
                    onChange={(e) => handleInput("D", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Effort Arm a [mm]</label>
                  <input
                    type="text"
                    value={inputs.a}
                    onChange={(e) => handleInput("a", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Fulcrum Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Offset c [mm]</label>
                  <input
                    type="text"
                    value={inputs.c}
                    onChange={(e) => handleInput("c", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Contact Angle with quick presets */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#1c1d1f] font-black text-xs">Contact Angle 2&theta; [&deg;]</label>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleInput("contact2Theta", "60")}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                      >
                        60°
                      </button>
                      <button
                        onClick={() => handleInput("contact2Theta", "90")}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                      >
                        90°
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={inputs.contact2Theta}
                    onChange={(e) => handleInput("contact2Theta", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Torque vs Applied Force vs Pressure Fields */}
              <div className="pt-2 border-t border-[#e4e8eb] space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className={solveGoal === "find_torque" ? "opacity-60" : ""}>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      Braking Torque T [N·m]
                    </label>
                    <input
                      type="text"
                      placeholder={solveGoal === "find_torque" ? "Computed from F" : "e.g. 200"}
                      value={inputs.torqueNm}
                      onChange={(e) => handleInput("torqueNm", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div className={solveGoal === "find_force" ? "opacity-60" : ""}>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      Applied Effort F [N]
                    </label>
                    <input
                      type="text"
                      placeholder={solveGoal === "find_force" ? "Computed from T" : "e.g. 700"}
                      value={inputs.appliedForceN}
                      onChange={(e) => handleInput("appliedForceN", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      Allowable Pressure p [MPa]
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0.5"
                      value={inputs.pMax}
                      onChange={(e) => handleInput("pMax", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      Shoe Face Width b&apos; [mm]
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50"
                      value={inputs.faceWidth}
                      onChange={(e) => handleInput("faceWidth", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Speed N [rpm]</label>
                    <input
                      type="text"
                      placeholder="e.g. 750 or 1500"
                      value={inputs.speedRpm}
                      onChange={(e) => handleInput("speedRpm", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Braking Time t [s]</label>
                    <input
                      type="text"
                      placeholder="e.g. 10"
                      value={inputs.timeSec}
                      onChange={(e) => handleInput("timeSec", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges */}
          {s && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#5624d0] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Operating Force F</span>
                <p className={`mt-1 text-2xl sm:text-3xl font-black font-mono ${s.isSelfLocking ? "text-rose-600" : "text-[#5624d0]"}`}>
                  {formatNum(s.operatingForceN, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  CW: {formatNum(s.operatingForceCwN, 0)} N | CCW: {formatNum(s.operatingForceCcwN, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1e6055] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Tangential Force Ft</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1e6055] font-mono">
                  {formatNum(s.tangentialForceN, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  Fn = {formatNum(s.normalForceN, 1)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#b4690e] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Heat Rate H</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#b4690e] font-mono">
                  {formatNum(s.heatRateKw, 2)} <span className="text-sm font-extrabold text-[#4b5563]">kW</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  v = {formatNum(s.surfaceSpeedMs, 2)} m/s
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1c1d1f] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Equivalent &mu;&apos;</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1c1d1f] font-mono">
                  {formatNum(s.muPrime, 4)}
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  c_crit = {formatNum(s.criticalOffsetMm, 1)} mm
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization & Mathematical Step Derivations */}
        <div className="lg:col-span-7 space-y-6">
          {s && (
            <div className="space-y-4 pt-2">
              <BlockBrakeDiagramSvg
                D={s.drumDiaMm}
                a={s.leverA}
                b={s.leverB}
                c={s.leverC}
                twoThetaDeg={s.contactAngleDeg}
                brakeCase={s.caseType}
                rotation={s.rotation}
                F_operating={s.operatingForceN}
                Fn={s.normalForceN}
                Ft={s.tangentialForceN}
                isSelfLocking={s.isSelfLocking}
                isSelfEnergizing={s.isSelfEnergizing}
              />
            </div>
          )}

          {/* Self-Locking Analysis Card */}
          {s && (
            <div className={`rounded-xl border p-4 flex items-start space-x-3 ${
              s.isSelfLocking
                ? "border-rose-300 bg-rose-50 text-rose-900"
                : "border-emerald-300 bg-emerald-50 text-emerald-900"
            }`}>
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${s.isSelfLocking ? "text-rose-600" : "text-emerald-600"}`} />
              <div>
                <p className="font-black text-sm">
                  {s.isSelfLocking ? "Warning: Self-Locking Detected (F ≤ 0)" : "Safe Operation: Not Self-Locking"}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Critical fulcrum offset: <strong>c_crit = b / &mu;&apos; = {formatNum(s.criticalOffsetMm, 1)} mm</strong>.
                  Current offset is <strong>c = {s.leverC} mm</strong>.
                  {s.isSelfLocking
                    ? " The brake will engage automatically without human effort. To prevent locking, reduce c below c_crit."
                    : " External operating force is always required to maintain braking torque."}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Mathematical Derivation */}
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-6 shadow-sm transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
            <h3 className="text-base sm:text-lg font-black text-[#1c1d1f] mb-4 flex items-center space-x-2 border-b border-[#e4e8eb] pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span>Complete Step-by-Step Mathematical Derivation</span>
            </h3>

            {!result.success ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                <p className="font-bold">Computation Error:</p>
                <p className="mt-1">{(result as any).error || "Calculation parameters are incomplete or invalid."}</p>
                <p className="mt-2 text-rose-600">Tip: Ensure positive lever lengths and either Torque or Applied Force are provided.</p>
              </div>
            ) : (
              <StepDisplay
                steps={result.steps}
                warnings={result.warnings}
              />
            )}
          </div>
        </div>
      </div>

      <MaterialSelectorModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(mu, pMax) => {
          handleInput("mu", String(mu));
          if (pMax) handleInput("pMax", String(pMax));
        }}
        filterCategory="brake"
      />
    </div>
  );
};
