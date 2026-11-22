"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculateBandBrake, BandBrakeInput } from "@/lib/engine/bandBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BandBrakeType, SimpleBandCase, RotationDirection } from "@/lib/engine/types";
import { BandBrakeDiagramSvg } from "./BandBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { Disc, Sparkles, Sliders, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border-2 border-[#d1d7dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm">
              <Disc className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                  Band Brake Studio
                </h1>
                <span className="rounded-md bg-[#f6efff] px-3 py-1 text-xs font-black text-[#5624d0] border border-[#d8b4fe]">
                  CO6 &bull; Eq 13.18–19
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#4b5563]">
                Simple and differential band brakes: tension ratio, band sizing, lever design, and self-locking boundary.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#4b5563] mr-1">Exam Presets:</span>
          {(["BB1","BB2","BB3"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-mono font-black text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f6efff]/40 transition-all shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-6 w-[1.5px] bg-[#d1d7dc] mx-1.5" />
          <ScenarioControls
            module="band_brake"
            inputs={{ ...inputs, brakeType, simpleCase, rotation }}
            summaryLine={s ? `F1=${formatNum(s.F1)} N, F_cw=${formatNum(s.F_cw)} N` : undefined}
          />
        </div>
      </div>

      {/* Type & Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-5 shadow-sm">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
            Band Brake Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBrakeType("simple")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                brakeType === "simple"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                  : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
              }`}
            >
              Simple Band
            </button>
            <button
              onClick={() => setBrakeType("differential")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                brakeType === "differential"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                  : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
              }`}
            >
              Differential
            </button>
          </div>
        </div>

        {brakeType === "simple" && (
          <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-5 shadow-sm">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
              Simple Band Geometry
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSimpleCase("case_e")}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                  simpleCase === "case_e"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                    : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
                }`}
              >
                Case (e): Arm b
              </button>
              <button
                onClick={() => setSimpleCase("case_d")}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                  simpleCase === "case_d"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                    : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
                }`}
              >
                Case (d): Direct
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-5 shadow-sm">
          <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] mb-3 block">
            Rotation Direction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRotation("cw")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                rotation === "cw"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                  : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
              }`}
            >
              ↻ CW
            </button>
            <button
              onClick={() => setRotation("ccw")}
              className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                rotation === "ccw"
                  ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 border-2 border-[#a435f0] scale-[1.02]"
                  : "bg-white text-[#2d2f31] border-2 border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#1c1d1f]"
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
          <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#e4e8eb] pb-3.5">
              <h3 className="text-sm sm:text-base font-black text-[#1c1d1f] flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-[#a435f0]" />
                <span>Band &amp; Lever Dimensions</span>
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
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Wrap Angle &theta; [&deg;]</label>
                  <input
                    type="text"
                    value={inputs.theta_deg}
                    onChange={(e) => handleInput("theta_deg", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Effort Arm a [mm]</label>
                  <input
                    type="text"
                    value={inputs.a}
                    onChange={(e) => handleInput("a", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              {brakeType === "simple" ? (
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Attachment Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Arm b1 (short) [mm]</label>
                    <input
                      type="text"
                      value={inputs.b1}
                      onChange={(e) => handleInput("b1", e.target.value)}
                      className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Arm b2 (long) [mm]</label>
                    <input
                      type="text"
                      value={inputs.b2}
                      onChange={(e) => handleInput("b2", e.target.value)}
                      className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Tangential Force Ft [N]</label>
                  <input
                    type="text"
                    placeholder="e.g. 9000 or from P/N"
                    value={inputs.Ft}
                    onChange={(e) => handleInput("Ft", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Power P [kW]</label>
                  <input
                    type="text"
                    placeholder="e.g. 30"
                    value={inputs.P_kW}
                    onChange={(e) => handleInput("P_kW", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Band Tensile &sigma;_band [MPa]</label>
                  <input
                    type="text"
                    value={inputs.sigma_d_band}
                    onChange={(e) => handleInput("sigma_d_band", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1f2937] font-extrabold text-xs block mb-1.5">Lever Bending &sigma;_lever [MPa]</label>
                  <input
                    type="text"
                    value={inputs.sigma_lever}
                    onChange={(e) => handleInput("sigma_lever", e.target.value)}
                    className="w-full rounded-lg border-2 border-[#d1d7dc] bg-white px-3.5 py-2.5 text-[#111827] font-mono text-sm font-bold focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges (Punchy & Bold) */}
          {s && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#b32d0f]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Tight Side F1</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#b32d0f] font-mono">
                  {formatNum(s.F1, 0)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  Slack F2 = {formatNum(s.F2, 0)} N
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#5624d0]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Operating Force F</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#5624d0] font-mono">
                  {formatNum(s.F_operating, 1)} <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  CW: {formatNum(s.F_cw, 0)} N | CCW: {formatNum(s.F_ccw, 0)} N
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1c1d1f]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Band Cross-Section</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1c1d1f] font-mono">
                  {formatNum(s.b_prime, 1)} &times; {formatNum(s.h, 1)}{" "}
                  <span className="text-sm font-extrabold text-[#4b5563]">mm</span>
                </p>
                <span className="text-xs text-[#6b7280] font-mono font-bold">
                  p_avg = {formatNum(s.p_avg, 3)} MPa
                </span>
              </div>

              <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1e6055]/50 transition-all">
                <span className="text-xs font-mono uppercase font-black text-[#6b7280]">Lever Section (k=2)</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1e6055] font-mono">
                  {s.lever_bl && s.lever_hl ? `${formatNum(s.lever_bl, 1)} × ${formatNum(s.lever_hl, 1)} mm` : "N/A"}
                </p>
                <span className={`text-xs font-black ${s.isSelfLocking ? "text-rose-600" : "text-[#1e6055]"}`}>
                  {s.isSelfLocking ? "Self-Locking Active!" : "Non-Locking"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
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
            <div className="rounded-2xl border-2 border-[#d1d7dc] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-[#e4e8eb] pb-3.5 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1c1d1f] flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-xs font-semibold text-[#6b7280]">
                    Belt formula F1/F2 = e^(μθ), band sizing, and lever bending calculations per Chapter 13.
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
