"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculateBandBrake, BandBrakeInput } from "@/lib/engine/bandBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BandBrakeType, SimpleBandCase, RotationDirection } from "@/lib/engine/types";
import { BandBrakeDiagramSvg } from "./BandBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import {
  Disc,
  Sparkles,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Compass,
  AlertTriangle,
} from "lucide-react";

interface BandBrakeStudioProps {
  triggerPreset?: string;
  initialInputs?: Record<string, unknown> | null;
  onOpenAiModal?: () => void;
}

type BandBrakeGoal = "standard_force" | "stress_limited";

export const BandBrakeStudio: React.FC<BandBrakeStudioProps> = ({
  triggerPreset,
  initialInputs,
  onOpenAiModal,
}) => {
  const [brakeType, setBrakeType] = useState<BandBrakeType>("simple");
  const [simpleCase, setSimpleCase] = useState<SimpleBandCase>("case_e");
  const [rotation, setRotation] = useState<RotationDirection>("cw");
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [solveGoal, setSolveGoal] = useState<BandBrakeGoal>("standard_force");

  const [inputs, setInputs] = useState({
    D: "600",
    theta_deg: "270",
    mu: "0.25",
    a: "1500",
    b: "200",         // simple band
    b1: "38",         // differential
    b2: "150",        // differential
    h: "5",
    b_prime: "",
    band_width_ratio: "",
    sigma_d_band: "50",
    sigma_lever: "",
    lever_k: "2",
    Ft: "9000",
    T_Nm: "",
    P_kW: "",
    N_rpm: "",
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

  // Clear inputs to start fresh
  const handleClearAll = () => {
    setInputs({
      D: "",
      theta_deg: "270",
      mu: "0.25",
      a: "",
      b: "",
      b1: "",
      b2: "",
      h: "",
      b_prime: "",
      band_width_ratio: "",
      sigma_d_band: "",
      sigma_lever: "",
      lever_k: "2",
      Ft: "",
      T_Nm: "",
      P_kW: "",
      N_rpm: "",
    });
  };

  // Helper: auto compute h = 0.005 * D
  const handleAutoThickness = () => {
    const dia = evaluateExpression(inputs.D);
    if (dia && dia > 0) {
      handleInput("h", String(Number((0.005 * dia).toFixed(2))));
    }
  };

  // Helper: auto compute b' = 10 * h
  const handleAutoWidth = () => {
    const thk = evaluateExpression(inputs.h);
    if (thk && thk > 0) {
      handleInput("b_prime", String(Number((10 * thk).toFixed(1))));
    }
  };

  const parsedInputs: BandBrakeInput = useMemo(() => ({
    brakeType,
    simpleCase,
    rotation,
    D: evaluateExpression(inputs.D) || 600,
    theta_deg: evaluateExpression(inputs.theta_deg) || 270,
    mu: evaluateExpression(inputs.mu) || 0.25,
    a: evaluateExpression(inputs.a) || 1500,
    b: brakeType === "simple" ? (evaluateExpression(inputs.b) || undefined) : undefined,
    b1: brakeType === "differential" ? (evaluateExpression(inputs.b1) || undefined) : undefined,
    b2: brakeType === "differential" ? (evaluateExpression(inputs.b2) || undefined) : undefined,
    h: evaluateExpression(inputs.h) || undefined,
    b_prime: evaluateExpression(inputs.b_prime) || undefined,
    band_width_ratio: evaluateExpression(inputs.band_width_ratio) || undefined,
    sigma_d_band: evaluateExpression(inputs.sigma_d_band) || undefined,
    sigma_lever: evaluateExpression(inputs.sigma_lever) || undefined,
    lever_depth_ratio_k: evaluateExpression(inputs.lever_k) || 2,
    Ft: evaluateExpression(inputs.Ft) || undefined,
    T_Nm: evaluateExpression(inputs.T_Nm) || undefined,
    P_kW: evaluateExpression(inputs.P_kW) || undefined,
    N_rpm: evaluateExpression(inputs.N_rpm) || undefined,
  }), [inputs, brakeType, simpleCase, rotation]);

  const result = useMemo(() => {
    try {
      return calculateBandBrake(parsedInputs);
    } catch (e: any) {
      return { success: false, error: e.message, summary: null, steps: [], warnings: [] };
    }
  }, [parsedInputs]);

  // Load presets BB1–BB3
  const loadPreset = (p: "BB1" | "BB2" | "BB3") => {
    if (p === "BB1") {
      setSolveGoal("standard_force");
      setBrakeType("simple"); setSimpleCase("case_e"); setRotation("cw");
      setInputs({ D:"600", theta_deg:"270", mu:"0.25", a:"1500", b:"200", b1:"", b2:"", h:"5", b_prime:"", band_width_ratio:"", sigma_d_band:"50", sigma_lever:"", lever_k:"2", Ft:"9000", T_Nm:"", P_kW:"", N_rpm:"" });
    } else if (p === "BB2") {
      setSolveGoal("standard_force");
      setBrakeType("simple"); setSimpleCase("case_e"); setRotation("cw");
      setInputs({ D:"500", theta_deg:"225", mu:"0.25", a:"1000", b:"250", b1:"", b2:"", h:"2.5", b_prime:"25", band_width_ratio:"10", sigma_d_band:"55", sigma_lever:"80", lever_k:"2", Ft:"", T_Nm:"", P_kW:"30", N_rpm:"750" });
    } else if (p === "BB3") {
      setSolveGoal("stress_limited");
      setBrakeType("differential"); setRotation("cw");
      setInputs({ D:"600", theta_deg:"300", mu:"0.22", a:"225", b:"", b1:"38", b2:"150", h:"3", b_prime:"100", band_width_ratio:"", sigma_d_band:"56", sigma_lever:"", lever_k:"2", Ft:"", T_Nm:"", P_kW:"", N_rpm:"" });
    }
  };

  // Allow parent (gallery) to trigger a preset by name
  useEffect(() => {
    if (triggerPreset) {
      const code = triggerPreset.split("_")[0];
      if (["BB1","BB2","BB3"].includes(code)) {
        loadPreset(code as "BB1" | "BB2" | "BB3");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPreset]);

  const s = result.success && result.summary ? result.summary : null;

  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm transition-transform duration-300 hover:scale-105">
              <Disc className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                Band Brake Studio
              </h1>
              <p className="text-xs text-[#6a6f73] mt-0.5">
                Capstan tension ratio F1/F2 = e^(&mu;&theta;), simple &amp; differential fulcrums, band thickness and width sizing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Presets & Scenario */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#6a6f73] mr-1">
            Presets:
          </span>
          {(["BB1","BB2","BB3"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-lg border border-[#d1d7dc] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-mono font-black text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f6efff]/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-[#d1d7dc] mx-1.5" />
          <ScenarioControls
            module="band_brake"
            inputs={{ ...inputs, brakeType, simpleCase, rotation }}
            summaryLine={s ? `F1=${formatNum(s.F1)} N, F_cw=${formatNum(s.F_cw)} N` : undefined}
          />
        </div>
      </div>

      {/* Problem Goal Switcher */}
      <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-2.5 flex items-center space-x-2">
          <Compass className="h-4 w-4 text-[#a435f0]" />
          <span>What is given in your problem statement?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: "standard_force",
              label: "Given Braking Load / Torque / Power → Find Operating Effort F",
              desc: "Problems like BB1 & BB2 where torque, power, or tangential load is known.",
            },
            {
              id: "stress_limited",
              label: "Given Band Dimensions & Allowable Stress σ_d → Find Capacity & Force",
              desc: "Problems like BB3 where maximum tension F1 = σ_d · h · b' limits the design.",
            },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setSolveGoal(g.id as BandBrakeGoal)}
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

      {/* Type & Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
            Band Brake Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBrakeType("simple")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                brakeType === "simple"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                  : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
              }`}
            >
              Simple Band
            </button>
            <button
              onClick={() => setBrakeType("differential")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                brakeType === "differential"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                  : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
              }`}
            >
              Differential
            </button>
          </div>
        </div>

        {brakeType === "simple" ? (
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
              Simple Band Geometry
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSimpleCase("case_e")}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  simpleCase === "case_e"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                Case (e): Arm b
              </button>
              <button
                onClick={() => setSimpleCase("case_d")}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  simpleCase === "case_d"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                Case (d): Direct
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
              Differential Connections
            </label>
            <p className="text-xs text-[#6a6f73] mt-1 leading-relaxed">
              Two distinct moment arms: <strong>b1</strong> (tight side) and <strong>b2</strong> (slack side).
            </p>
          </div>
        )}

        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
            Rotation Direction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRotation("cw")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                rotation === "cw"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                  : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
              }`}
            >
              ↻ CW
            </button>
            <button
              onClick={() => setRotation("ccw")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                rotation === "ccw"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                  : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
              }`}
            >
              ↺ CCW
            </button>
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
                  <span>Band &amp; Lever Dimensions</span>
                </h3>
                <p className="text-[11px] text-[#6a6f73]">Fill given dimensions and loading conditions.</p>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#1c1d1f] font-black text-xs">Wrap Angle &theta; [&deg;]</label>
                    <div className="flex items-center space-x-1">
                      {["225", "270", "300"].map((ang) => (
                        <button
                          key={ang}
                          onClick={() => handleInput("theta_deg", ang)}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                        >
                          {ang}°
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={inputs.theta_deg}
                    onChange={(e) => handleInput("theta_deg", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
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

              {brakeType === "simple" ? (
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Lever Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Arm b1 [mm]</label>
                    <input
                      type="text"
                      value={inputs.b1}
                      onChange={(e) => handleInput("b1", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Arm b2 [mm]</label>
                    <input
                      type="text"
                      value={inputs.b2}
                      onChange={(e) => handleInput("b2", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Operating Loads */}
              <div className="pt-2 border-t border-[#e4e8eb] space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Tangential Ft [N]</label>
                    <input
                      type="text"
                      placeholder="e.g. 9000"
                      value={inputs.Ft}
                      onChange={(e) => handleInput("Ft", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Torque T [N·m]</label>
                    <input
                      type="text"
                      placeholder="e.g. 382"
                      value={inputs.T_Nm}
                      onChange={(e) => handleInput("T_Nm", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Power P [kW]</label>
                    <input
                      type="text"
                      placeholder="e.g. 30"
                      value={inputs.P_kW}
                      onChange={(e) => handleInput("P_kW", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Speed N [rpm]</label>
                    <input
                      type="text"
                      placeholder="e.g. 750"
                      value={inputs.N_rpm}
                      onChange={(e) => handleInput("N_rpm", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Band Sizing & Tensile Limits */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[#1c1d1f] font-black text-xs">Band Thickness h [mm]</label>
                      <button
                        onClick={handleAutoThickness}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                        title="Auto compute h = 0.005·D"
                      >
                        0.005·D
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={inputs.h}
                      onChange={(e) => handleInput("h", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[#1c1d1f] font-black text-xs">Band Width b&apos; [mm]</label>
                      <button
                        onClick={handleAutoWidth}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                        title="Auto compute b' = 10·h"
                      >
                        10·h
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 52 or 100"
                      value={inputs.b_prime}
                      onChange={(e) => handleInput("b_prime", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Band Tensile &sigma;_band [MPa]</label>
                    <input
                      type="text"
                      placeholder="e.g. 50 or 56"
                      value={inputs.sigma_d_band}
                      onChange={(e) => handleInput("sigma_d_band", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Lever Bending &sigma;_lever [MPa]</label>
                    <input
                      type="text"
                      placeholder="e.g. 80"
                      value={inputs.sigma_lever}
                      onChange={(e) => handleInput("sigma_lever", e.target.value)}
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
              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#b32d0f] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Tight Side F1</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#b32d0f] font-mono">
                  {formatNum(s.F1, 0)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  F2 = {formatNum(s.F2, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#5624d0] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Operating Force F</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#5624d0] font-mono">
                  {formatNum(s.F_operating, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  CW: {formatNum(s.F_cw, 1)} | CCW: {formatNum(s.F_ccw, 1)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1e6055] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Braking Torque T</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1e6055] font-mono">
                  {formatNum(s.T_Nm, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N·m</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  Ft = {formatNum(s.Ft, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#b4690e] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Band Width b&apos;</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#b4690e] font-mono">
                  {formatNum(s.b_prime, 1)} <span className="text-sm font-extrabold text-[#4b5563]">mm</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  h = {formatNum(s.h, 2)} mm
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization & Step Derivations */}
        <div className="lg:col-span-7 space-y-6">
          {s && (
            <div className="space-y-4 pt-2">
              <BandBrakeDiagramSvg
                D={s.D}
                theta_deg={parsedInputs.theta_deg}
                mu={parsedInputs.mu}
                F1={s.F1}
                F2={s.F2}
                brakeType={brakeType}
                isSelfLocking={s.isSelfLocking}
                h={s.h}
                b_prime={s.b_prime}
              />
            </div>
          )}

          {/* Self-Locking Analysis for Differential Brakes */}
          {s && brakeType === "differential" && (
            <div className={`rounded-xl border p-4 flex items-start space-x-3 ${
              s.isSelfLocking
                ? "border-rose-300 bg-rose-50 text-rose-900"
                : "border-emerald-300 bg-emerald-50 text-emerald-900"
            }`}>
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${s.isSelfLocking ? "text-rose-600" : "text-emerald-600"}`} />
              <div>
                <p className="font-black text-sm">
                  {s.isSelfLocking ? "Warning: Differential Self-Locking Condition Met" : "Differential Self-Locking Check: Safe"}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Tension ratio <strong>e^(&mu;&theta;) = {formatNum(s.exp_mu_theta, 4)}</strong> vs Lever ratio <strong>b2/b1 = {formatNum(s.selfLockingRatio || 0, 4)}</strong>.
                  {s.isSelfLocking
                    ? " Because e^(μθ) ≥ b2/b1, the brake will lock automatically without human effort."
                    : " Because e^(μθ) < b2/b1, external effort is always required to sustain braking torque."}
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
                <p className="mt-2 text-rose-600">Tip: Provide Drum Dia, Wrap Angle, Lever Arm(s), and either Tangential Force Ft or Torque.</p>
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
        onSelect={(mu) => {
          handleInput("mu", String(mu));
        }}
        filterCategory="brake"
      />
    </div>
  );
};
