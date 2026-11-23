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
  Compass,
  Info,
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

  // Calculation mode descriptions
  const modeDescriptions: Record<ClutchSolveMode, { title: string; desc: string; inputsHighlight: string; solves: string }> = {
    sizing: {
      title: "Design Dimensions (Do, Di)",
      desc: "Finds the required outer diameter (Do) and inner diameter (Di) of the clutch plate needed to transmit the target torque without exceeding allowable friction pressure.",
      inputsHighlight: "Power/Torque, Diameter ratio (Di/Do), and Allowable pressure",
      solves: "Outer diameter (Do), Inner diameter (Di), and Clamping force (Fa)",
    },
    plate_count: {
      title: "Find Required Plates (n1, n2)",
      desc: "For fixed clutch dimensions (Do, Di), computes how many friction pairs (n') and discs (n1 driving + n2 driven) are required to safely handle the torque.",
      inputsHighlight: "Fixed Outer/Inner diameters and Target torque",
      solves: "Active friction pairs (n') rounded to standard discs, and actual required clamping force",
    },
    capacity: {
      title: "Torque & Power Capacity",
      desc: "Calculates the maximum torque (T) and power (P) that an existing clutch of known dimensions and plate count can transmit.",
      inputsHighlight: "Known Do, Di, number of plates, and friction coefficient",
      solves: "Maximum transmissible Torque T [N·m] and Power P [kW]",
    },
    force_limited: {
      title: "Spring Force Limited",
      desc: "When the maximum axial clamping force (Fa) is constrained by human effort or spring capacity, calculates the plate count and working pressures.",
      inputsHighlight: "Maximum axial spring limit [N] and Outer diameter",
      solves: "Required friction pairs (n') and resulting working surface pressure",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-6 shadow-sm transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm transition-transform duration-300 hover:scale-105">
              <Layers className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                Clutch Design &amp; Sizing Studio
              </h1>
              <p className="text-xs text-[#6a6f73] mt-0.5">
                Calculate dimensions, plate count, torque capacity, and clamping forces.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Quick-Buttons & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#6a6f73] mr-1">
            Presets:
          </span>
          {(["C1", "C2", "C3", "C4", "C5"] as const).map((p) => (
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
            module="clutch"
            inputs={{ ...inputs, mode, theory }}
            summaryLine={s ? `Do=${formatNum(s.diaOuterMm)} mm, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Control Bar: Mode & Theory Switchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mode Selector with Clear Visual Clarification */}
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] flex items-center space-x-1.5">
              <Compass className="h-4 w-4 text-[#a435f0]" />
              <span>What do you want to calculate?</span>
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { id: "sizing", label: "Plate Sizing (Do, Di)" },
              { id: "plate_count", label: "Plate Count (n)" },
              { id: "capacity", label: "Torque Capacity (T)" },
              { id: "force_limited", label: "Force Limited (Fa)" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as ClutchSolveMode)}
                className={`rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 text-center hover:-translate-y-0.5 active:scale-95 ${
                  mode === m.id
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode Explanatory Card */}
          <div className="bg-[#f6efff]/50 border border-[#d8b4fe] rounded-lg p-2.5 text-xs text-[#2d2f31] flex items-start space-x-2">
            <Info className="h-4 w-4 text-[#a435f0] shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-[#5624d0]">{modeDescriptions[mode].title}</p>
            </div>
          </div>
        </div>

        {/* Theory Selector */}
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f]">
                Pressure Distribution Theory
              </label>
              <label className="flex items-center space-x-2 text-xs font-bold text-[#1c1d1f] cursor-pointer">
                <input
                  type="checkbox"
                  checked={compareBoth}
                  onChange={(e) => setCompareBoth(e.target.checked)}
                  className="h-4 w-4 rounded border-[#d1d7dc] text-[#a435f0] focus:ring-[#a435f0]"
                />
                <span className="text-xs font-black text-[#5624d0]">Compare Wear vs. Pressure</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheory("uniform_wear")}
                className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  theory === "uniform_wear"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                Uniform Wear (Standard)
              </button>
              <button
                onClick={() => setTheory("uniform_pressure")}
                className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  theory === "uniform_pressure"
                    ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                    : "bg-[#f7f9fa] text-[#2d2f31] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0]"
                }`}
              >
                Uniform Pressure (New)
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#6a6f73] mt-2">
            <strong>Uniform Wear:</strong> Standard for worn/running clutches (pr = const). <strong>Uniform Pressure:</strong> Applies to brand-new clutches with rigid flat discs.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Inputs (Left) and Interactive Diagram / Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-6 shadow-sm space-y-5 transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#1c1d1f] flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-[#a435f0]" />
                  <span>Input Parameters</span>
                </h3>
                <p className="text-[11px] text-[#6a6f73]">Fill relevant inputs; solved variables update dynamically.</p>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-lg bg-[#f6efff] border border-[#d8b4fe] px-3 py-1.5 text-xs font-black text-[#5624d0] hover:bg-[#a435f0] hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pick Material</span>
              </button>
            </div>

            {/* Input Grid */}
            <div className="space-y-4">
              {/* Power / Speed / Torque Inputs */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Power P [kW]</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 or 60"
                    value={inputs.powerKw}
                    onChange={(e) => handleInputChange("powerKw", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Speed N [rpm]</label>
                  <input
                    type="text"
                    placeholder="e.g. 1440 or 1000"
                    value={inputs.speedRpm}
                    onChange={(e) => handleInputChange("speedRpm", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Nominal Torque T [N·m]</label>
                  <input
                    type="text"
                    placeholder="e.g. 240"
                    value={inputs.torqueNm}
                    onChange={(e) => handleInputChange("torqueNm", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Factor of Safety (FoS)</label>
                  <input
                    type="text"
                    placeholder="1.0 or 2.5"
                    value={inputs.fos}
                    onChange={(e) => handleInputChange("fos", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Friction & Pressure */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Friction Coeff &mu;</label>
                  <input
                    type="text"
                    placeholder="0.25"
                    value={inputs.mu}
                    onChange={(e) => handleInputChange("mu", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Allowable Press p [MPa]</label>
                  <input
                    type="text"
                    placeholder="0.35"
                    value={inputs.pAllowableMpa}
                    onChange={(e) => handleInputChange("pAllowableMpa", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Diameters or Ratio */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Outer Dia Do [mm]</label>
                  <input
                    type="text"
                    placeholder={mode === "sizing" ? "Solved automatically" : "e.g. 250"}
                    value={inputs.diaOuterMm}
                    onChange={(e) => handleInputChange("diaOuterMm", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Inner Dia Di [mm]</label>
                  <input
                    type="text"
                    placeholder={mode === "sizing" ? "Solved automatically" : "e.g. 150"}
                    value={inputs.diaInnerMm}
                    onChange={(e) => handleInputChange("diaInnerMm", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Ratios & Limits */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Diameter Ratio (Di/Do)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5 or 0.6"
                    value={inputs.diameterRatio}
                    onChange={(e) => handleInputChange("diameterRatio", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Axial Force Limit [N]</label>
                  <input
                    type="text"
                    placeholder="e.g. 600"
                    value={inputs.axialForceLimitN}
                    onChange={(e) => handleInputChange("axialForceLimitN", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Multi-plate Discs Configuration */}
              <div className="pt-2 border-t border-[#e4e8eb]">
                <label className="text-xs font-black uppercase tracking-wider text-[#6a6f73] block mb-2">
                  Multi-Plate Discs (n1 driving + n2 driven)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Driving n1</label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={inputs.numDrivingDiscs}
                      onChange={(e) => handleInputChange("numDrivingDiscs", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-2 text-[#1c1d1f] font-mono text-sm font-bold text-center focus:border-[#a435f0] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Driven n2</label>
                    <input
                      type="text"
                      placeholder="e.g. 4"
                      value={inputs.numDrivenDiscs}
                      onChange={(e) => handleInputChange("numDrivenDiscs", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-2 text-[#1c1d1f] font-mono text-sm font-bold text-center focus:border-[#a435f0] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Surfaces n&apos;</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={inputs.numFrictionSurfaces}
                      onChange={(e) => handleInputChange("numFrictionSurfaces", e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-2 py-2 text-[#1c1d1f] font-mono text-sm font-bold text-center focus:border-[#a435f0] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Results Badges */}
          {result.success && result.summary && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#a435f0] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Torque Capacity</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#a435f0] font-mono">
                  {formatNum(result.summary.torqueNm, 2)} <span className="text-sm font-extrabold text-[#4b5563]">N·m</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  ({formatNum(result.summary.torqueNmm, 0)} N·mm)
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1e6055] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Axial Clamping Fa</span>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1e6055] font-mono">
                  {formatNum(result.summary.actualAxialForceN || result.summary.axialForceN, 1)}{" "}
                  <span className="text-sm font-extrabold text-[#4b5563]">N</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  n&apos; = {result.summary.numFrictionSurfaces} pairs
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#1c1d1f] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Dimensions (Do &times; Di)</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#1c1d1f] font-mono">
                  {formatNum(result.summary.diaOuterMm, 1)} &times; {formatNum(result.summary.diaInnerMm, 1)}{" "}
                  <span className="text-sm font-extrabold text-[#4b5563]">mm</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  Dm = {formatNum(result.summary.meanDiaMm, 1)} mm
                </span>
              </div>

              <div className="rounded-xl border border-[#d1d7dc] bg-white p-4 text-center shadow-sm hover:border-[#b4690e] hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-mono uppercase font-black text-[#6a6f73]">Working Pressure</span>
                <p className="mt-1 text-lg sm:text-xl font-black text-[#b4690e] font-mono">
                  {formatNum(result.summary.maxPressureMpa, 4)}{" "}
                  <span className="text-sm font-extrabold text-[#4b5563]">MPa</span>
                </p>
                <span className="text-xs text-[#6a6f73] font-mono font-bold">
                  p_mean = {formatNum(result.summary.meanPressureMpa, 4)} MPa
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualizations & KaTeX Step Workings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive SVG Diagram with Explanation */}
          {result.success && result.summary && (
            <div className="space-y-4 pt-2">
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
            </div>
          )}

          {/* Side-by-Side Comparison Card if toggled */}
          {compareBoth && result.success && result.summary && compResult && compResult.success && compResult.summary && (
            <div className="rounded-xl border border-[#d8b4fe] bg-[#f6efff]/40 p-5 shadow-sm transition-all hover:border-[#a435f0]">
              <div className="flex items-center space-x-2 border-b border-[#d8b4fe]/60 pb-3 mb-3.5">
                <Scale className="h-5 w-5 text-[#a435f0]" />
                <h4 className="text-sm font-black text-[#1c1d1f] uppercase tracking-wider">
                  Side-by-Side Theory Comparison (Uniform Wear vs. Uniform Pressure)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead>
                    <tr className="border-b border-[#d8b4fe]/60 text-[#4b5563]">
                      <th className="py-2 font-black">Parameter</th>
                      <th className="py-2 text-[#5624d0] font-black">Uniform Wear</th>
                      <th className="py-2 text-[#b4690e] font-black">Uniform Pressure</th>
                      <th className="py-2 text-[#1e6055] font-black">Delta %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e8eb] text-[#1c1d1f]">
                    <tr>
                      <td className="py-2 text-[#4b5563] font-sans font-bold">Torque Capacity T</td>
                      <td className="py-2 font-black text-[#5624d0]">
                        {formatNum(theory === "uniform_wear" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-2 font-black text-[#b4690e]">
                        {formatNum(theory === "uniform_pressure" ? result.summary.torqueNm : compResult.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-2 text-[#1e6055] font-black">
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
                      <td className="py-2 text-[#4b5563] font-sans font-bold">Clamping Force Fa</td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_wear" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_pressure" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 text-[#6a6f73] font-bold">
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
                      <td className="py-2 text-[#4b5563] font-sans font-bold">Mean Diameter Dm</td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_wear" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 font-bold">
                        {formatNum(theory === "uniform_pressure" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 text-[#6a6f73] font-bold">
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
            <div className="rounded-xl border border-[#d1d7dc] bg-white p-6 shadow-sm transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
              <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3.5 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1c1d1f] flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-[#1e6055]" />
                    <span>Deterministic Mathematical Derivations</span>
                  </h3>
                  <p className="text-xs font-semibold text-[#6a6f73]">
                    Step-by-step analytical equations and substitutions for {modeDescriptions[mode].title}.
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
