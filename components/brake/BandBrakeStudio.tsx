"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculateBandBrake, BandBrakeInput } from "@/lib/engine/bandBrake";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { BandBrakeType, SimpleBandCase, RotationDirection } from "@/lib/engine/types";
import { BandBrakeDiagramSvg } from "./BandBrakeDiagramSvg";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import { Disc, Sparkles, Sliders, CheckCircle2, Zap } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]">
              <Disc className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#2d2f31]">Band Brake Studio</h2>
            <span className="rounded bg-[#f6efff] px-2.5 py-0.5 text-xs font-bold text-[#5624d0] border border-[#d8b4fe]">
              CO6 &bull; Eq 13.18–19
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Simple and differential band brakes: tension ratio, band sizing, lever design, and self-locking detection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mr-1">Exam Presets:</span>
          {(["BB1","BB2","BB3"] as const).map((p) => (
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
            module="band_brake"
            inputs={{ ...inputs, brakeType, simpleCase, rotation }}
            summaryLine={s ? `F1=${formatNum(s.F1)} N, F_cw=${formatNum(s.F_cw)} N` : undefined}
          />
        </div>
      </div>

      {/* Type & Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">Band Brake Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setBrakeType("simple")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                brakeType === "simple"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
              }`}
            >
              Simple Band
            </button>
            <button
              onClick={() => setBrakeType("differential")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                brakeType === "differential"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
              }`}
            >
              Differential
            </button>
          </div>
        </div>

        {brakeType === "simple" && (
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">Simple Band Geometry</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSimpleCase("case_e")}
                className={`rounded-md px-2 py-1.5 text-xs font-bold transition-all ${
                  simpleCase === "case_e"
                    ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                    : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
                }`}
              >
                Case (e): Arm b
              </button>
              <button
                onClick={() => setSimpleCase("case_d")}
                className={`rounded-md px-2 py-1.5 text-xs font-bold transition-all ${
                  simpleCase === "case_d"
                    ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                    : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
                }`}
              >
                Case (d): Direct
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">Rotation Direction</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setRotation("cw")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                rotation === "cw"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
              }`}
            >
              ↻ CW
            </button>
            <button
              onClick={() => setRotation("ccw")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                rotation === "ccw"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
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
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3">
              <h3 className="text-xs font-bold text-[#2d2f31] flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-[#a435f0]" />
                <span>Band &amp; Lever Dimensions</span>
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
                  <label className="text-[#6a6f73] font-bold text-[11px]">Wrap Angle &theta; [&deg;]</label>
                  <input
                    type="text"
                    value={inputs.theta_deg}
                    onChange={(e) => handleInput("theta_deg", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    value={inputs.mu}
                    onChange={(e) => handleInput("mu", e.target.value)}
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

              {brakeType === "simple" ? (
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Attachment Arm b [mm]</label>
                  <input
                    type="text"
                    value={inputs.b}
                    onChange={(e) => handleInput("b", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#6a6f73] font-bold text-[11px]">Arm b1 (short) [mm]</label>
                    <input
                      type="text"
                      value={inputs.b1}
                      onChange={(e) => handleInput("b1", e.target.value)}
                      className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                    />
                  </div>
                  <div>
                    <label className="text-[#6a6f73] font-bold text-[11px]">Arm b2 (long) [mm]</label>
                    <input
                      type="text"
                      value={inputs.b2}
                      onChange={(e) => handleInput("b2", e.target.value)}
                      className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Tangential Force Ft [N]</label>
                  <input
                    type="text"
                    placeholder="e.g. 9000 or from P/N"
                    value={inputs.Ft}
                    onChange={(e) => handleInput("Ft", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Power P [kW]</label>
                  <input
                    type="text"
                    placeholder="e.g. 30"
                    value={inputs.P_kW}
                    onChange={(e) => handleInput("P_kW", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Band Tensile &sigma;_band [MPa]</label>
                  <input
                    type="text"
                    value={inputs.sigma_d_band}
                    onChange={(e) => handleInput("sigma_d_band", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Lever Bending &sigma;_lever [MPa]</label>
                  <input
                    type="text"
                    value={inputs.sigma_lever}
                    onChange={(e) => handleInput("sigma_lever", e.target.value)}
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
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Tight Side F1</span>
                <p className="mt-1 text-lg font-bold text-[#b32d0f] font-mono">
                  {formatNum(s.F1, 0)} <span className="text-xs font-normal text-[#6a6f73]">N</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  Slack F2 = {formatNum(s.F2, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Operating Force F</span>
                <p className="mt-1 text-lg font-bold text-[#5624d0] font-mono">
                  {formatNum(s.F_operating, 1)} <span className="text-xs font-normal text-[#6a6f73]">N</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  CW: {formatNum(s.F_cw, 0)} N | CCW: {formatNum(s.F_ccw, 0)} N
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Band Cross-Section</span>
                <p className="mt-1 text-sm font-bold text-[#2d2f31] font-mono">
                  {formatNum(s.b_prime, 1)} &times; {formatNum(s.h, 1)}{" "}
                  <span className="text-xs font-normal text-[#6a6f73]">mm</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  p_avg = {formatNum(s.p_avg, 3)} MPa
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Lever Section (k=2)</span>
                <p className="mt-1 text-sm font-bold text-[#1e6055] font-mono">
                  {s.lever_bl && s.lever_hl ? `${formatNum(s.lever_bl, 1)} × ${formatNum(s.lever_hl, 1)} mm` : "N/A"}
                </p>
                <span className={`text-[10px] font-bold ${s.isSelfLocking ? "text-rose-600" : "text-[#1e6055]"}`}>
                  {s.isSelfLocking ? "Self-Locking Active!" : "Non-Locking"}
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
            <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2f31] flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-[11px] text-[#6a6f73]">
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
