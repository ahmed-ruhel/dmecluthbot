"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculateBandBrake, BandBrakeInput } from "@/lib/engine/bandBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BandBrakeType, SimpleBandCase, RotationDirection } from "@/lib/engine/types";
import { BandBrakeDiagramSvg } from "./BandBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { Disc, Sparkles, Sliders, CheckCircle2, Gauge, Scale } from "lucide-react";

interface BandBrakeStudioProps {
  triggerPreset?: string;
}

export const BandBrakeStudio: React.FC<BandBrakeStudioProps> = ({ triggerPreset }) => {
  const [brakeType, setBrakeType] = useState<BandBrakeType>("simple");
  const [simpleCase, setSimpleCase] = useState<SimpleBandCase>("case_e");
  const [rotation, setRotation] = useState<RotationDirection>("cw");
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

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
      setBrakeType("simple"); setSimpleCase("case_e"); setRotation("cw");
      setInputs({ D:"600", theta_deg:"270", mu:"0.25", a:"1500", b:"200", b1:"38", b2:"150", h:"5", b_prime:"", band_width_ratio:"", sigma_d_band:"50", sigma_lever:"", lever_k:"2", Ft:"9000", T_Nm:"", P_kW:"", N_rpm:"" });
    } else if (p === "BB2") {
      setBrakeType("simple"); setSimpleCase("case_e"); setRotation("cw");
      setInputs({ D:"500", theta_deg:"225", mu:"0.25", a:"1000", b:"250", b1:"38", b2:"150", h:"", b_prime:"", band_width_ratio:"10", sigma_d_band:"", sigma_lever:"80", lever_k:"2", Ft:"", T_Nm:"", P_kW:"30", N_rpm:"750" });
    } else {
      setBrakeType("differential"); setRotation("cw");
      setInputs({ D:"600", theta_deg:"300", mu:"0.22", a:"225", b:"200", b1:"38", b2:"150", h:"3", b_prime:"100", band_width_ratio:"", sigma_d_band:"56", sigma_lever:"", lever_k:"2", Ft:"", T_Nm:"", P_kW:"", N_rpm:"" });
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f172a] text-[#38bdf8] border border-[#1e293b] shadow-sm">
              <Disc className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
                  Band Brake Studio
                </h1>
                <span className="rounded bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                  MODULE: BAND BRAKE &bull; Eq 13.18–19
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-[#64748b]">
                Capstan tension ratio F1/F2 = e^(μθ), band thickness/width sizing, and differential lever moment equilibrium.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b] mr-1">
            Presets:
          </span>
          {(["BB1","BB2","BB3"] as const).map((p) => (
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
            module="band_brake"
            inputs={{ ...inputs, brakeType, simpleCase, rotation }}
            summaryLine={s ? `F1=${formatNum(s.F1)} N, F_cw=${formatNum(s.F_cw)} N` : undefined}
          />
        </div>
      </div>

      {/* Type & Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Band Brake Topology</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBrakeType("simple")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                brakeType === "simple"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              Simple Band
            </button>
            <button
              onClick={() => setBrakeType("differential")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                brakeType === "differential"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              Differential
            </button>
          </div>
        </div>

        {brakeType === "simple" && (
          <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
                <Scale className="h-3.5 w-3.5 text-[#0284c7]" />
                <span>Simple Band Fulcrum</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSimpleCase("case_e")}
                className={`rounded-md px-2 py-2 text-xs font-bold transition-all border ${
                  simpleCase === "case_e"
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                    : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
                }`}
              >
                Case (e): Arm b
              </button>
              <button
                onClick={() => setSimpleCase("case_d")}
                className={`rounded-md px-2 py-2 text-xs font-bold transition-all border ${
                  simpleCase === "case_d"
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                    : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
                }`}
              >
                Case (d): Direct
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <Disc className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Rotation Direction</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRotation("cw")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                rotation === "cw"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              ↻ CW
            </button>
            <button
              onClick={() => setRotation("ccw")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                rotation === "ccw"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              ↺ CCW
            </button>
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
                  <span>Band &amp; Lever Dimensions</span>
                </h3>
                <span className="text-[11px] text-[#64748b]">Tension geometry and structural limits</span>
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
                    Wrap Angle &theta; <span className="font-mono text-[#64748b]">[&deg;]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.theta_deg}
                    onChange={(e) => handleInput("theta_deg", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              {brakeType === "simple" ? (
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Lever Arm b <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#334155] font-bold text-xs block mb-1">
                      Arm b1 <span className="font-mono text-[#64748b]">[mm]</span>
                    </label>
                    <input
                      type="text"
                      value={inputs.b1}
                      onChange={(e) => handleInput("b1", e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#334155] font-bold text-xs block mb-1">
                      Arm b2 <span className="font-mono text-[#64748b]">[mm]</span>
                    </label>
                    <input
                      type="text"
                      value={inputs.b2}
                      onChange={(e) => handleInput("b2", e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Tangential Ft <span className="font-mono text-[#64748b]">[N]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9000"
                    value={inputs.Ft}
                    onChange={(e) => handleInput("Ft", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Torque T <span className="font-mono text-[#64748b]">[N·m]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="or Power/RPM"
                    value={inputs.T_Nm}
                    onChange={(e) => handleInput("T_Nm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Band Thick h <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={inputs.h}
                    onChange={(e) => handleInput("h", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Band Width b&apos; <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="or calculated"
                    value={inputs.b_prime}
                    onChange={(e) => handleInput("b_prime", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Band Tensile &sigma;_band <span className="font-mono text-[#64748b]">[MPa]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.sigma_d_band}
                    onChange={(e) => handleInput("sigma_d_band", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Lever Bending &sigma;_lever <span className="font-mono text-[#64748b]">[MPa]</span>
                  </label>
                  <input
                    type="text"
                    value={inputs.sigma_lever}
                    onChange={(e) => handleInput("sigma_lever", e.target.value)}
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
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Tight Side Tension F1</span>
                <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#0f172a] font-mono">
                  {formatNum(s.F1, 0)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  Slack Side F2 = {formatNum(s.F2, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#059669]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Operating Force F</span>
                <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#0f172a] font-mono">
                  {formatNum(s.F_operating, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N</span>
                </p>
                <span className="text-[11px] text-[#059669] font-mono font-bold">
                  CW: {formatNum(s.F_cw, 0)} N | CCW: {formatNum(s.F_ccw, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#0284c7]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Band Cross-Section</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {formatNum(s.b_prime, 1)} &times; {formatNum(s.h, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">mm</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  p_avg = {formatNum(s.p_avg, 3)} MPa
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#d97706]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Lever Section (k=2)</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {s.lever_bl && s.lever_hl ? `${formatNum(s.lever_bl, 1)} × ${formatNum(s.lever_hl, 1)} mm` : "N/A"}
                </p>
                <span className={`text-[11px] font-mono font-bold ${s.isSelfLocking ? "text-rose-600" : "text-[#059669]"}`}>
                  {s.isSelfLocking ? "Self-Locking Detected" : "Non-Locking Design"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-5">
          {s && (
            <BandBrakeDiagramSvg
              D={s.D}
              theta_deg={parsedInputs.theta_deg}
              mu={s.exp_mu_theta > 0 ? parsedInputs.mu : 0.25}
              F1={s.F1}
              F2={s.F2}
              brakeType={s.brakeType}
              isSelfLocking={s.isSelfLocking}
              h={s.h}
              b_prime={s.b_prime}
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
                    Belt formula F1/F2 = e^(μθ), band thickness/width sizing, and lever bending derivations.
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
        onSelect={(muVal) => {
          handleInput("mu", muVal.toString());
        }}
      />
    </div>
  );
};
