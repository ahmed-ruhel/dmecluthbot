"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculateClutch, ClutchInputs } from "@/lib/engine/clutch";
import { ClutchSolveMode, ClutchTheory } from "@/lib/engine/types";
import { evaluateExpression, formatNum } from "@/lib/engine/units";
import { ClutchDiagramSvg } from "./ClutchDiagramSvg";
import { ClutchWhatIfCurve } from "./ClutchWhatIfCurve";
import { StepDisplay } from "@/components/common/StepDisplay";
import { MaterialSelectorModal } from "@/components/common/MaterialSelectorModal";
import { ScenarioControls } from "@/components/common/ScenarioControls";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Scale,
  Gauge,
  Activity,
  Maximize2,
} from "lucide-react";

interface ClutchStudioProps {
  triggerPreset?: string;
}

export const ClutchStudio: React.FC<ClutchStudioProps> = ({ triggerPreset }) => {
  // Solve mode and theory
  const [mode, setMode] = useState<ClutchSolveMode>("sizing");
  const [theory, setTheory] = useState<ClutchTheory>("uniform_wear");
  const [compareBoth, setCompareBoth] = useState<boolean>(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Form input strings
  const [inputs, setInputs] = useState({
    powerKw: "",
    speedRpm: "1440",
    torqueNm: "240",
    fos: "2.5",
    mu: "0.25",
    pAllowableMpa: "0.35",
    diaOuterMm: "",
    diaInnerMm: "",
    diameterRatio: "0.5",
    radialWidthFraction: "",
    axialForceLimitN: "",
    numDrivingDiscs: "5",
    numDrivenDiscs: "4",
    numFrictionSurfaces: "",
  });

  const handleInputChange = (field: keyof typeof inputs, val: string) => {
    setInputs((prev) => ({ ...prev, [field]: val }));
  };

  // Convert raw string inputs to parsed numbers
  const parsedInputs: ClutchInputs = useMemo(() => {
    return {
      mode,
      theory,
      powerKw: evaluateExpression(inputs.powerKw) || undefined,
      speedRpm: evaluateExpression(inputs.speedRpm) || undefined,
      torqueNm: evaluateExpression(inputs.torqueNm) || undefined,
      fos: evaluateExpression(inputs.fos) || undefined,
      mu: evaluateExpression(inputs.mu) || 0.25,
      pAllowableMpa: evaluateExpression(inputs.pAllowableMpa) || 0.35,
      diaOuterMm: evaluateExpression(inputs.diaOuterMm) || undefined,
      diaInnerMm: evaluateExpression(inputs.diaInnerMm) || undefined,
      diameterRatio: evaluateExpression(inputs.diameterRatio) || undefined,
      radialWidthFraction: evaluateExpression(inputs.radialWidthFraction) || undefined,
      axialForceLimitN: evaluateExpression(inputs.axialForceLimitN) || undefined,
      numDrivingDiscs: evaluateExpression(inputs.numDrivingDiscs) || undefined,
      numDrivenDiscs: evaluateExpression(inputs.numDrivenDiscs) || undefined,
      numFrictionSurfaces: evaluateExpression(inputs.numFrictionSurfaces) || undefined,
    };
  }, [inputs, mode, theory]);

  // Primary calculation
  const result = useMemo(() => {
    try {
      return calculateClutch(parsedInputs);
    } catch (e: any) {
      return {
        success: false,
        error: e.message || "Calculation failed",
        summary: null,
        steps: [],
        warnings: [],
      };
    }
  }, [parsedInputs]);

  // Secondary calculation for comparison mode
  const compResult = useMemo(() => {
    if (!compareBoth) return null;
    const altTheory: ClutchTheory = theory === "uniform_wear" ? "uniform_pressure" : "uniform_wear";
    try {
      return calculateClutch({ ...parsedInputs, theory: altTheory });
    } catch {
      return null;
    }
  }, [compareBoth, parsedInputs, theory]);

  // Presets C1–C5
  const loadPreset = (preset: "C1" | "C2" | "C3" | "C4" | "C5") => {
    if (preset === "C1") {
      setMode("sizing");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "",
        speedRpm: "1440",
        torqueNm: "240",
        fos: "2.5",
        mu: "0.25",
        pAllowableMpa: "0.35",
        diaOuterMm: "",
        diaInnerMm: "",
        diameterRatio: "0.5",
        radialWidthFraction: "",
        axialForceLimitN: "",
        numDrivingDiscs: "5",
        numDrivenDiscs: "4",
        numFrictionSurfaces: "",
      });
    } else if (preset === "C2") {
      setMode("plate_count");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "8",
        speedRpm: "1000",
        torqueNm: "",
        fos: "1.0",
        mu: "0.25",
        pAllowableMpa: "0.35",
        diaOuterMm: "140",
        diaInnerMm: "80",
        diameterRatio: "",
        radialWidthFraction: "",
        axialForceLimitN: "600",
        numDrivingDiscs: "",
        numDrivenDiscs: "",
        numFrictionSurfaces: "",
      });
    } else if (preset === "C3") {
      setMode("sizing");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "60",
        speedRpm: "2000",
        torqueNm: "",
        fos: "1.0",
        mu: "0.25",
        pAllowableMpa: "0.35",
        diaOuterMm: "250",
        diaInnerMm: "",
        diameterRatio: "",
        radialWidthFraction: "0.2",
        axialForceLimitN: "600",
        numDrivingDiscs: "",
        numDrivenDiscs: "",
        numFrictionSurfaces: "",
      });
    } else if (preset === "C4") {
      setMode("capacity");
      setTheory("uniform_wear");
      setCompareBoth(true);
      setInputs({
        powerKw: "",
        speedRpm: "1000",
        torqueNm: "",
        fos: "1.0",
        mu: "0.15",
        pAllowableMpa: "0.1",
        diaOuterMm: "200",
        diaInnerMm: "120",
        diameterRatio: "",
        radialWidthFraction: "",
        axialForceLimitN: "",
        numDrivingDiscs: "1",
        numDrivenDiscs: "1",
        numFrictionSurfaces: "2",
      });
    } else if (preset === "C5") {
      setMode("capacity");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "",
        speedRpm: "500",
        torqueNm: "",
        fos: "1.0",
        mu: "0.3",
        pAllowableMpa: "0.127",
        diaOuterMm: "250",
        diaInnerMm: "150",
        diameterRatio: "",
        radialWidthFraction: "",
        axialForceLimitN: "",
        numDrivingDiscs: "",
        numDrivenDiscs: "",
        numFrictionSurfaces: "4",
      });
    }
  };

  // Allow parent (gallery) to trigger a preset by name
  useEffect(() => {
    if (triggerPreset) {
      const code = triggerPreset.split("_")[0];
      if (["C1","C2","C3","C4","C5"].includes(code)) {
        loadPreset(code as "C1" | "C2" | "C3" | "C4" | "C5");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPreset]);

  const s = result.success && result.summary ? result.summary : null;

  return (
    <div className="space-y-5">
      {/* Module Title & Preset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f172a] text-[#38bdf8] border border-[#1e293b] shadow-sm">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
                  Clutch Design &amp; Sizing Studio
                </h1>
                <span className="rounded bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                  MODULE: CLUTCH &bull; CO3 / CO6
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-[#64748b]">
                Deterministic sizing, torque capacity, and clamping force for single &amp; multi-plate friction clutches.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Quick-Buttons & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b] mr-1">
            Presets:
          </span>
          {(["C1", "C2", "C3", "C4", "C5"] as const).map((p) => (
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
            module="clutch"
            inputs={{ ...inputs, mode, theory }}
            summaryLine={s ? `Do=${formatNum(s.diaOuterMm)} mm, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Control Bar: Mode & Theory Switchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode Selector */}
        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Calculation Objective</span>
            </label>
            <span className="text-[10px] font-mono text-[#64748b]">DME Section 13.9</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: "sizing", label: "B: Sizing (Do, Di)" },
              { id: "plate_count", label: "C: Plate Count" },
              { id: "capacity", label: "A: Capacity (T, P)" },
              { id: "force_limited", label: "D: Fa-Limited" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as ClutchSolveMode)}
                className={`rounded-md px-2 py-2 text-xs font-bold transition-all text-center border ${
                  mode === m.id
                    ? "bg-[#0f172a] text-[#ffffff] border-[#0f172a] shadow-sm"
                    : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theory Selector */}
        <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] flex items-center space-x-1.5">
              <Scale className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Pressure Distribution Theory</span>
            </label>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-[#0f172a] cursor-pointer">
              <input
                type="checkbox"
                checked={compareBoth}
                onChange={(e) => setCompareBoth(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#cbd5e1] text-[#0284c7] focus:ring-[#0284c7]"
              />
              <span className="text-[11px] font-mono font-bold text-[#0369a1]">Compare Both Theories</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheory("uniform_wear")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                theory === "uniform_wear"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              Uniform Wear (Standard &bull; Eq 13.9d)
            </button>
            <button
              onClick={() => setTheory("uniform_pressure")}
              className={`rounded-md px-2.5 py-2 text-xs font-bold transition-all border ${
                theory === "uniform_pressure"
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:bg-[#ffffff] hover:border-[#0284c7]"
              }`}
            >
              Uniform Pressure (New &bull; Eq 13.9a)
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Inputs (Left) and Interactive Diagram / Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-[#0284c7]" />
                  <span>Engineering Design Parameters</span>
                </h3>
                <span className="text-[11px] text-[#64748b]">Supports numerical values &amp; expressions</span>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] px-2.5 py-1 text-xs font-mono font-bold text-[#0369a1] border border-[#cbd5e1] transition-all"
              >
                <Sparkles className="h-3 w-3 text-[#0284c7]" />
                <span>Handbook Materials</span>
              </button>
            </div>

            {/* Input Grid */}
            <div className="space-y-3.5">
              {/* Power / Speed / Torque Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Power P <span className="font-mono text-[#64748b]">[kW]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8 or 60"
                    value={inputs.powerKw}
                    onChange={(e) => handleInputChange("powerKw", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Speed N <span className="font-mono text-[#64748b]">[rpm]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1440 or 1000"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInputChange("speedRpm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
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
                    placeholder="e.g. 240"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInputChange("torqueNm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Design Factor <span className="font-mono text-[#64748b]">(FoS)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1.0 or 2.5"
                    value={inputs.fos}
                    onChange={(e) => handleInputChange("fos", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Friction & Pressure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Friction Coeff &mu;
                  </label>
                  <input
                    type="text"
                    placeholder="0.25"
                    value={inputs.mu}
                    onChange={(e) => handleInputChange("mu", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Allowable Press p <span className="font-mono text-[#64748b]">[MPa]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0.35"
                    value={inputs.pAllowableMpa}
                    onChange={(e) => handleInputChange("pAllowableMpa", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Diameters or Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Outer Dia Do <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 250 or solved"
                    value={inputs.diaOuterMm}
                    onChange={(e) => handleInputChange("diaOuterMm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Inner Dia Di <span className="font-mono text-[#64748b]">[mm]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150 or solved"
                    value={inputs.diaInnerMm}
                    onChange={(e) => handleInputChange("diaInnerMm", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Ratios & Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Diameter Ratio <span className="font-mono text-[#64748b]">Di/Do</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5 or 0.6"
                    value={inputs.diameterRatio}
                    onChange={(e) => handleInputChange("diameterRatio", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#334155] font-bold text-xs block mb-1">
                    Axial Limit Fa <span className="font-mono text-[#64748b]">[N]</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 600"
                    value={inputs.axialForceLimitN}
                    onChange={(e) => handleInputChange("axialForceLimitN", e.target.value)}
                    className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[#0f172a] font-mono text-xs font-bold placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Plate Discs Configuration */}
              <div className="pt-2 border-t border-[#f1f5f9]">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-2">
                  Multi-Plate Configuration
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[#475569] font-bold text-[11px] block mb-1">Driving n1</label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={inputs.numDrivingDiscs}
                      onChange={(e) => handleInputChange("numDrivingDiscs", e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2 py-1.5 text-[#0f172a] font-mono text-xs font-bold text-center focus:border-[#0284c7] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#475569] font-bold text-[11px] block mb-1">Driven n2</label>
                    <input
                      type="text"
                      placeholder="e.g. 4"
                      value={inputs.numDrivenDiscs}
                      onChange={(e) => handleInputChange("numDrivenDiscs", e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2 py-1.5 text-[#0f172a] font-mono text-xs font-bold text-center focus:border-[#0284c7] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#475569] font-bold text-[11px] block mb-1">Surfaces n&apos;</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={inputs.numFrictionSurfaces}
                      onChange={(e) => handleInputChange("numFrictionSurfaces", e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2 py-1.5 text-[#0f172a] font-mono text-xs font-bold text-center focus:border-[#0284c7] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges (Engineering Telemetry Cards) */}
          {result.success && result.summary && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#2563eb]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Torque Capacity T</span>
                <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#0f172a] font-mono">
                  {formatNum(result.summary.torqueNm, 2)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N·m</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  {formatNum(result.summary.torqueNmm, 0)} N·mm
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#059669]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Axial Clamping Fa</span>
                <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#0f172a] font-mono">
                  {formatNum(result.summary.actualAxialForceN || result.summary.axialForceN, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">N</span>
                </p>
                <span className="text-[11px] text-[#059669] font-mono font-bold">
                  n&apos; = {result.summary.numFrictionSurfaces} friction pairs
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#0284c7]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Dimensions (Do &times; Di)</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {formatNum(result.summary.diaOuterMm, 1)} &times; {formatNum(result.summary.diaInnerMm, 1)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">mm</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  Dm = {formatNum(result.summary.meanDiaMm, 1)} mm
                </span>
              </div>

              <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm border-l-4 border-l-[#d97706]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">Working Pressure</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-[#0f172a] font-mono">
                  {formatNum(result.summary.maxPressureMpa, 4)}{" "}
                  <span className="text-xs font-bold text-[#64748b]">MPa</span>
                </p>
                <span className="text-[11px] text-[#64748b] font-mono">
                  p_mean = {formatNum(result.summary.meanPressureMpa, 4)} MPa
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualizations & KaTeX Step Workings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive SVG Diagram */}
          {result.success && result.summary && (
            <ClutchDiagramSvg
              Do={result.summary.diaOuterMm}
              Di={result.summary.diaInnerMm}
              Dm={result.summary.meanDiaMm}
              n1={result.summary.numDrivingDiscs}
              n2={result.summary.numDrivenDiscs}
              nPrime={result.summary.numFrictionSurfaces}
              Fa={result.summary.actualAxialForceN || result.summary.axialForceN}
              theory={theory}
            />
          )}

          {/* Side-by-Side Comparison Card if toggled */}
          {compareBoth && result.success && result.summary && compResult && compResult.success && compResult.summary && (
            <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#f1f5f9] pb-2.5 mb-3">
                <Scale className="h-4 w-4 text-[#0284c7]" />
                <h4 className="text-xs font-mono font-bold text-[#0f172a] uppercase tracking-wider">
                  Side-by-Side Theory Variance (Uniform Wear vs. Uniform Pressure)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#cbd5e1] text-[#64748b]">
                      <th className="py-2 font-bold">Parameter</th>
                      <th className="py-2 text-[#0369a1] font-bold">Uniform Wear</th>
                      <th className="py-2 text-[#d97706] font-bold">Uniform Pressure</th>
                      <th className="py-2 text-[#059669] font-bold">Delta %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-[#0f172a]">
                    <tr>
                      <td className="py-2 text-[#475569] font-sans font-bold">Torque Capacity T</td>
                      <td className="py-2 font-bold text-[#0369a1]">
                        {formatNum(theory === "uniform_wear" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-2 font-bold text-[#d97706]">
                        {formatNum(theory === "uniform_pressure" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-2 text-[#059669] font-bold">
                        +
                        {formatNum(
                          Math.abs(
                            ((compResult.summary.torqueNm - result.summary.torqueNm) /
                              Math.min(compResult.summary.torqueNm, result.summary.torqueNm)) *
                              100
                          ),
                          1
                        )}
                        %
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#475569] font-sans font-bold">Clamping Force Fa</td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_wear" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_pressure" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 text-[#64748b] font-bold">
                        +
                        {formatNum(
                          Math.abs(
                            ((compResult.summary.axialForceN - result.summary.axialForceN) /
                              Math.min(compResult.summary.axialForceN, result.summary.axialForceN)) *
                              100
                          ),
                          1
                        )}
                        %
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#475569] font-sans font-bold">Mean Diameter Dm</td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_wear" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_pressure" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 text-[#64748b] font-bold">
                        +
                        {formatNum(
                          Math.abs(
                            ((compResult.summary.meanDiaMm - result.summary.meanDiaMm) /
                              Math.min(compResult.summary.meanDiaMm, result.summary.meanDiaMm)) *
                              100
                          ),
                          1
                        )}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* What-If Sensitivity Curve */}
          {result.success && result.summary && (
            <ClutchWhatIfCurve
              Do={result.summary.diaOuterMm}
              mu={parsedInputs.mu}
              pMax={parsedInputs.pAllowableMpa || 0.35}
              nPrime={result.summary.numFrictionSurfaces}
              currentRatio={result.summary.diaOuterMm > 0 ? result.summary.diaInnerMm / result.summary.diaOuterMm : 0.5}
              onSelectRatio={(r) => handleInputChange("diameterRatio", r.toString())}
            />
          )}

          {/* Step-by-Step KaTeX Derivation Panel */}
          {result.success && (
            <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 mb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                    <span>Deterministic Mathematical Calculations</span>
                  </h3>
                  <p className="text-[11px] font-medium text-[#64748b]">
                    Derived per Mahadevan &amp; Reddy (4th Ed) standard equations with step-by-step substitution.
                  </p>
                </div>
              </div>

              <StepDisplay steps={result.steps} warnings={result.warnings} />
            </div>
          )}
        </div>
      </div>

      {/* Friction Material Selector Modal */}
      <MaterialSelectorModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        filterCategory="clutch"
        onSelect={(muVal, pVal) => {
          handleInputChange("mu", muVal.toString());
          handleInputChange("pAllowableMpa", pVal.toString());
        }}
      />
    </div>
  );
};
