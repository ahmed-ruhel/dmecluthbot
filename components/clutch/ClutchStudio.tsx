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
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Scale,
  Zap,
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

  // Presets loaders for C1-C5
  const loadPreset = (preset: "C1" | "C2" | "C3" | "C4" | "C5") => {
    if (preset === "C1") {
      setMode("sizing");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "",
        speedRpm: "1000",
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
        speedRpm: "1440",
        torqueNm: "",
        fos: "1.0",
        mu: "0.1",
        pAllowableMpa: "0.35",
        diaOuterMm: "140",
        diaInnerMm: "80",
        diameterRatio: "",
        radialWidthFraction: "",
        axialForceLimitN: "",
        numDrivingDiscs: "",
        numDrivenDiscs: "",
        numFrictionSurfaces: "",
      });
    } else if (preset === "C3") {
      setMode("force_limited");
      setTheory("uniform_wear");
      setCompareBoth(false);
      setInputs({
        powerKw: "60",
        speedRpm: "3000",
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]">
              <Layers className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#2d2f31]">Clutch Studio</h2>
            <span className="rounded bg-[#f6efff] px-2.5 py-0.5 text-xs font-bold text-[#5624d0] border border-[#d8b4fe]">
              CO3 &bull; CO6
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Single and multi-plate clutch force, torque, and sizing under Uniform Wear and Uniform Pressure theories.
          </p>
        </div>

        {/* Preset Quick-Buttons & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mr-1">Exam Presets:</span>
          {(["C1", "C2", "C3", "C4", "C5"] as const).map((p) => (
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
            module="clutch"
            inputs={{ ...inputs, mode, theory }}
            summaryLine={s ? `Do=${formatNum(s.diaOuterMm)} mm, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Control Bar: Mode & Theory Switchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode Selector */}
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-2 block">
            Calculation Mode
          </label>
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
                className={`rounded-md px-2 py-1.5 text-xs font-bold transition-all text-center ${
                  mode === m.id
                    ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                    : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa] hover:border-[#2d2f31]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theory Selector */}
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73]">
              Theory Model
            </label>
            <label className="flex items-center space-x-1.5 text-xs text-[#2d2f31] cursor-pointer">
              <input
                type="checkbox"
                checked={compareBoth}
                onChange={(e) => setCompareBoth(e.target.checked)}
                className="rounded border-[#d1d7dc] text-[#a435f0] focus:ring-[#a435f0]"
              />
              <span className="text-[11px] font-bold text-[#5624d0]">Compare Wear vs. Pressure</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setTheory("uniform_wear")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                theory === "uniform_wear"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
              }`}
            >
              Uniform Wear (Standard &bull; Eq 13.9d)
            </button>
            <button
              onClick={() => setTheory("uniform_pressure")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                theory === "uniform_pressure"
                  ? "bg-[#a435f0] text-white shadow-sm border border-[#a435f0]"
                  : "bg-white text-[#2d2f31] border border-[#d1d7dc] hover:bg-[#f7f9fa]"
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
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3">
              <h3 className="text-xs font-bold text-[#2d2f31] flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-[#a435f0]" />
                <span>Parameter Inputs</span>
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1 rounded-md bg-[#f6efff] border border-[#d8b4fe] px-2.5 py-1 text-[11px] font-bold text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                <span>Pick Material</span>
              </button>
            </div>

            {/* Input Grid */}
            <div className="space-y-3 text-xs">
              {/* Power / Speed / Torque Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Power P [kW]</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 or 60"
                    value={inputs.powerKw}
                    onChange={(e) => handleInputChange("powerKw", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Speed N [rpm]</label>
                  <input
                    type="text"
                    placeholder="e.g. 1440 or 1000"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInputChange("speedRpm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Nominal Torque T [N·m]</label>
                  <input
                    type="text"
                    placeholder="e.g. 240"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInputChange("torqueNm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Factor of Safety (FoS)</label>
                  <input
                    type="text"
                    placeholder="1.0 or 2.5"
                    value={inputs.fos}
                    onChange={(e) => handleInputChange("fos", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              {/* Friction & Pressure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    placeholder="0.25"
                    value={inputs.mu}
                    onChange={(e) => handleInputChange("mu", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Allowable Press p [MPa]</label>
                  <input
                    type="text"
                    placeholder="0.35"
                    value={inputs.pAllowableMpa}
                    onChange={(e) => handleInputChange("pAllowableMpa", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              {/* Diameters or Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Outer Dia Do [mm]</label>
                  <input
                    type="text"
                    placeholder="e.g. 250 or solved"
                    value={inputs.diaOuterMm}
                    onChange={(e) => handleInputChange("diaOuterMm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Inner Dia Di [mm]</label>
                  <input
                    type="text"
                    placeholder="e.g. 150 or solved"
                    value={inputs.diaInnerMm}
                    onChange={(e) => handleInputChange("diaInnerMm", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              {/* Diameter Ratio & Radial Width */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Ratio c = Di / Do</label>
                  <input
                    type="text"
                    placeholder="0.5 or 0.577"
                    value={inputs.diameterRatio}
                    onChange={(e) => handleInputChange("diameterRatio", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Radial Width (b / Ro)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.2 (b=0.2Ro)"
                    value={inputs.radialWidthFraction}
                    onChange={(e) => handleInputChange("radialWidthFraction", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>

              {/* Force Limit for Mode D */}
              {mode === "force_limited" && (
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Clamping Force Limit Fa [N]</label>
                  <input
                    type="text"
                    placeholder="e.g. 600"
                    value={inputs.axialForceLimitN}
                    onChange={(e) => handleInputChange("axialForceLimitN", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d8b4fe] bg-[#f6efff]/40 px-3 py-1.5 text-[#2d2f31] font-mono text-xs focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              )}

              {/* Disc Stack: n1, n2, n' */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e4e8eb]">
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Driving n1</label>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={inputs.numDrivingDiscs}
                    onChange={(e) => handleInputChange("numDrivingDiscs", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-1.5 text-[#2d2f31] font-mono text-xs text-center focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Driven n2</label>
                  <input
                    type="text"
                    placeholder="e.g. 4"
                    value={inputs.numDrivenDiscs}
                    onChange={(e) => handleInputChange("numDrivenDiscs", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-1.5 text-[#2d2f31] font-mono text-xs text-center focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div>
                  <label className="text-[#6a6f73] font-bold text-[11px]">Surfaces n&apos;</label>
                  <input
                    type="text"
                    placeholder="Auto or n1+n2-1"
                    value={inputs.numFrictionSurfaces}
                    onChange={(e) => handleInputChange("numFrictionSurfaces", e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-1.5 text-[#2d2f31] font-mono text-xs text-center focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges */}
          {result.success && result.summary && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Torque Capacity</span>
                <p className="mt-1 text-lg font-bold text-[#a435f0] font-mono">
                  {formatNum(result.summary.torqueNm, 2)} <span className="text-xs font-normal text-[#6a6f73]">N·m</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  ({formatNum(result.summary.torqueNmm, 0)} N·mm)
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Axial Clamping Fa</span>
                <p className="mt-1 text-lg font-bold text-[#1e6055] font-mono">
                  {formatNum(result.summary.actualAxialForceN || result.summary.axialForceN, 1)}{" "}
                  <span className="text-xs font-normal text-[#6a6f73]">N</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  n&apos; = {result.summary.numFrictionSurfaces} pairs
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Dimensions (Do &times; Di)</span>
                <p className="mt-1 text-sm font-bold text-[#2d2f31] font-mono">
                  {formatNum(result.summary.diaOuterMm, 1)} &times; {formatNum(result.summary.diaInnerMm, 1)}{" "}
                  <span className="text-xs font-normal text-[#6a6f73]">mm</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
                  Dm = {formatNum(result.summary.meanDiaMm, 1)} mm
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-3.5 text-center shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6a6f73]">Working Pressure</span>
                <p className="mt-1 text-sm font-bold text-[#b4690e] font-mono">
                  {formatNum(result.summary.maxPressureMpa, 4)}{" "}
                  <span className="text-xs font-normal text-[#6a6f73]">MPa</span>
                </p>
                <span className="text-[10px] text-[#6a6f73] font-mono">
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
            <div className="rounded-xl border border-[#d8b4fe] bg-[#f6efff]/40 p-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#d8b4fe]/60 pb-2 mb-3">
                <Scale className="h-4 w-4 text-[#a435f0]" />
                <h4 className="text-xs font-bold text-[#2d2f31] uppercase tracking-wider">
                  Side-by-Side Theory Comparison (Uniform Wear vs. Uniform Pressure)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#d8b4fe]/60 text-[#6a6f73]">
                      <th className="py-1.5 font-bold">Parameter</th>
                      <th className="py-1.5 text-[#5624d0] font-bold">Uniform Wear</th>
                      <th className="py-1.5 text-[#b4690e] font-bold">Uniform Pressure</th>
                      <th className="py-1.5 text-[#1e6055] font-bold">Delta %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e8eb] text-[#2d2f31]">
                    <tr>
                      <td className="py-1.5 text-[#6a6f73] font-sans">Torque Capacity T</td>
                      <td className="py-1.5 font-bold text-[#5624d0]">
                        {formatNum(theory === "uniform_wear" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-1.5 font-bold text-[#b4690e]">
                        {formatNum(theory === "uniform_pressure" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-1.5 text-[#1e6055] font-bold">
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
                      <td className="py-1.5 text-[#6a6f73] font-sans">Clamping Force Fa</td>
                      <td className="py-1.5">
                        {formatNum(theory === "uniform_wear" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-1.5">
                        {formatNum(theory === "uniform_pressure" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-1.5 text-[#6a6f73]">
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
                      <td className="py-1.5 text-[#6a6f73] font-sans">Mean Diameter Dm</td>
                      <td className="py-1.5">
                        {formatNum(theory === "uniform_wear" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-1.5">
                        {formatNum(theory === "uniform_pressure" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-1.5 text-[#6a6f73]">
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
            <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2f31] flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-[11px] text-[#6a6f73]">
                    Formulas and step-by-step substitutions cited from Mahadevan &amp; Reddy (4th Ed) and class lectures.
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
