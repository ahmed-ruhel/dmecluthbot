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
    if (triggerPreset && ["BB1","BB2","BB3"].includes(triggerPreset)) {
      loadPreset(triggerPreset as "BB1" | "BB2" | "BB3");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPreset]);

  const s = result.success && result.summary ? result.summary : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#070c16] p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-700/50">
              <Disc className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Band Brake Studio</h2>
            <span className="rounded bg-emerald-950 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-300 border border-emerald-800/60">
              CO6 &bull; Eq 13.18–19
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Simple and differential band brakes: tension ratio, band sizing, lever design, and self-locking detection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase text-slate-400 mr-1">Exam Presets:</span>
          {(["BB1","BB2","BB3"] as const).map((p) => (
            <button key={p} onClick={() => loadPreset(p)}
              className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 hover:border-emerald-500 hover:bg-emerald-950/40 hover:text-emerald-300 transition-all">
              {p}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <ScenarioControls
            module="band_brake"
            inputs={{ ...inputs, brakeType, simpleCase, rotation }}
            summaryLine={s ? `F1=${formatNum(s.F1)} N, F_cw=${formatNum(s.F_cw)} N` : undefined}
          />
        </div>
      </div>

      {/* Type & Case Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">Band Brake Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["simple","differential"] as const).map((t) => (
              <button key={t} onClick={() => setBrakeType(t)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${brakeType === t ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                {t === "simple" ? "Simple Band" : "Differential Band"}
              </button>
            ))}
          </div>
        </div>

        {brakeType === "simple" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">Simple Band Case</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["case_e","case_d"] as const).map((cs) => (
                <button key={cs} onClick={() => setSimpleCase(cs)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${simpleCase === cs ? "bg-emerald-600 text-white" : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                  {cs === "case_e" ? "Case (e) — Eq 13.19(c,d)" : "Case (d) — Eq 13.19(a,b)"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">Rotation Direction</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["cw","ccw"] as const).map((dir) => (
              <button key={dir} onClick={() => setRotation(dir)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${rotation === dir ? "bg-emerald-600 text-white" : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                {dir === "cw" ? "↻ CW" : "↺ CCW"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Band Brake Inputs</span>
              </h3>
              <button onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60">
                <Sparkles className="h-3 w-3" />
                <span>Pick Material</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { key:"D", label:"Drum Dia D [mm]", ph:"e.g. 600" },
                { key:"theta_deg", label:"Wrap Angle θ [°]", ph:"270" },
                { key:"mu", label:"Friction Coeff μ", ph:"0.25" },
                { key:"a", label:"Lever Effort Arm a [mm]", ph:"1500" },
                ...(brakeType === "simple" ? [
                  { key:"b", label:"Band Attach Arm b [mm]", ph:"200" },
                ] : [
                  { key:"b1", label:"Tight Arm b1 [mm]", ph:"38" },
                  { key:"b2", label:"Slack Arm b2 [mm]", ph:"150" },
                ]),
                { key:"Ft", label:"Tangential Force Ft [N]", ph:"e.g. 9000" },
                { key:"T_Nm", label:"Torque T [N·m]", ph:"or use P & N" },
                { key:"P_kW", label:"Power P [kW]", ph:"e.g. 30" },
                { key:"N_rpm", label:"Speed N [rpm]", ph:"e.g. 750" },
                { key:"h", label:"Band Thickness h [mm]", ph:"auto: 0.005D" },
                { key:"b_prime", label:"Band Width b' [mm]", ph:"or use ratio" },
                { key:"band_width_ratio", label:"Width Ratio b'/h", ph:"e.g. 10" },
                { key:"sigma_d_band", label:"Band Tensile Stress σ [MPa]", ph:"50" },
                { key:"sigma_lever", label:"Lever Bending Stress [MPa]", ph:"80 for design" },
                { key:"lever_k", label:"Lever Depth Ratio k (hl/bl)", ph:"2" },
              ].map(({key, label, ph}) => (
                <div key={key}>
                  <label className="text-slate-400 font-medium">{label}</label>
                  <input
                    type="text"
                    placeholder={ph}
                    value={(inputs as any)[key]}
                    onChange={(e) => handleInput(key as keyof typeof inputs, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-100 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Result Cards */}
          {s && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Tight Side F1</span>
                <p className="mt-1 text-lg font-bold text-rose-400 font-mono">{formatNum(s.F1, 1)} <span className="text-xs text-slate-400">N</span></p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Slack Side F2</span>
                <p className="mt-1 text-lg font-bold text-cyan-400 font-mono">{formatNum(s.F2, 1)} <span className="text-xs text-slate-400">N</span></p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#070c16] p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">Braking Torque</span>
                <p className="mt-1 text-sm font-bold text-emerald-400 font-mono">{formatNum(s.T_Nm, 2)} N·m</p>
              </div>
              <div className={`rounded-xl border p-3 text-center ${s.isSelfLocking ? "border-rose-800 bg-rose-950/20" : "border-slate-800 bg-[#070c16]"}`}>
                <span className="text-[10px] font-mono uppercase text-slate-400">Applied Force F</span>
                <p className={`mt-1 text-sm font-bold font-mono ${s.isSelfLocking ? "text-rose-400" : "text-white"}`}>
                  {formatNum(s.F_operating, 2)} N
                </p>
                {s.isSelfLocking && <span className="text-[10px] text-rose-400 font-bold">SELF-LOCKING</span>}
              </div>
              <div className="col-span-2 rounded-xl border border-slate-800 bg-[#070c16] p-2.5 text-xs font-mono space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Band h × b':</span>
                  <span className="text-white">{formatNum(s.h, 2)} × {formatNum(s.b_prime, 2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">p1 (tight) / p2 (slack):</span>
                  <span className="text-white">{formatNum(s.p1, 3)} / {formatNum(s.p2, 3)} MPa</span>
                </div>
                {s.lever_bl && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lever section bl × hl:</span>
                    <span className="text-white">{formatNum(s.lever_bl, 1)} × {s.lever_hl ? formatNum(s.lever_hl, 1) : "—"} mm</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">F_cw / F_ccw:</span>
                  <span className="text-white">{formatNum(s.F_cw, 1)} / {formatNum(s.F_ccw, 1)} N</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Diagram + Steps */}
        <div className="lg:col-span-7 space-y-6">
          <BandBrakeDiagramSvg
            D={parsedInputs.D}
            theta_deg={parsedInputs.theta_deg}
            mu={parsedInputs.mu}
            F1={s?.F1 ?? 0}
            F2={s?.F2 ?? 0}
            brakeType={brakeType}
            isSelfLocking={s?.isSelfLocking ?? false}
            h={s?.h}
            b_prime={s?.b_prime}
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
