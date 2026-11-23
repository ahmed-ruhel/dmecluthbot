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
  RotateCcw,
  FileText,
  Disc,
} from "lucide-react";

interface ClutchStudioProps {
  triggerPreset?: string;
  initialInputs?: Record<string, unknown> | null;
  onOpenAiModal?: () => void;
}

type ClutchPlateType = "multi" | "single_both" | "single_one";
type DimensionUnitMode = "diameters" | "radii";

export const ClutchStudio: React.FC<ClutchStudioProps> = ({
  triggerPreset,
  initialInputs,
  onOpenAiModal,
}) => {
  // Solve mode and theory
  const [mode, setMode] = useState<ClutchSolveMode>("sizing");
  const [theory, setTheory] = useState<ClutchTheory>("uniform_wear");
  const [compareBoth, setCompareBoth] = useState<boolean>(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // User input assistance modes
  const [clutchType, setClutchType] = useState<ClutchPlateType>("multi");
  const [dimensionMode, setDimensionMode] = useState<DimensionUnitMode>("diameters");

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

  // Handle Clutch Construction Type Switch
  const handleClutchTypeChange = (type: ClutchPlateType) => {
    setClutchType(type);
    if (type === "single_both") {
      setInputs((p) => ({
        ...p,
        numDrivingDiscs: "1",
        numDrivenDiscs: "2",
        numFrictionSurfaces: "2",
      }));
    } else if (type === "single_one") {
      setInputs((p) => ({
        ...p,
        numDrivingDiscs: "1",
        numDrivenDiscs: "1",
        numFrictionSurfaces: "1",
      }));
    } else {
      // multi-plate default
      if (inputs.numFrictionSurfaces === "1" || inputs.numFrictionSurfaces === "2") {
        setInputs((p) => ({
          ...p,
          numDrivingDiscs: "5",
          numDrivenDiscs: "4",
          numFrictionSurfaces: "8",
        }));
      }
    }
  };

  // Clear all inputs for solving custom user problem
  const handleClearAll = () => {
    setInputs({
      powerKw: "",
      speedRpm: "",
      torqueNm: "",
      fos: "1.0",
      mu: "0.25",
      pAllowableMpa: "",
      diaOuterMm: "",
      diaInnerMm: "",
      diameterRatio: "",
      radialWidthFraction: "",
      axialForceLimitN: "",
      numDrivingDiscs: "",
      numDrivenDiscs: "",
      numFrictionSurfaces: "",
    });
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
      setClutchType("multi");
      setDimensionMode("diameters");
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
      setClutchType("multi");
      setDimensionMode("diameters");
      setCompareBoth(false);
      setInputs({
        powerKw: "8",
        speedRpm: "1000",
        torqueNm: "",
        fos: "1.0",
        mu: "0.25",
        pAllowableMpa: "0.35",
        diaOuterMm: "250",
        diaInnerMm: "150",
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
      setClutchType("multi");
      setDimensionMode("diameters");
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
      setClutchType("single_both");
      setDimensionMode("diameters");
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
      setClutchType("multi");
      setDimensionMode("diameters");
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

  // Calculation mode titles
  const modeTitles: Record<ClutchSolveMode, string> = {
    sizing: "Design Dimensions (Do, Di)",
    plate_count: "Find Required Plates (n1, n2)",
    capacity: "Torque & Power Capacity",
    force_limited: "Spring Force Limited",
  };

  // Helper for radius values displayed when in radius mode
  const displayedOuter = useMemo(() => {
    if (dimensionMode === "radii") {
      const val = evaluateExpression(inputs.diaOuterMm);
      return val ? String(val / 2) : "";
    }
    return inputs.diaOuterMm;
  }, [dimensionMode, inputs.diaOuterMm]);

  const displayedInner = useMemo(() => {
    if (dimensionMode === "radii") {
      const val = evaluateExpression(inputs.diaInnerMm);
      return val ? String(val / 2) : "";
    }
    return inputs.diaInnerMm;
  }, [dimensionMode, inputs.diaInnerMm]);

  const handleDimensionChange = (isOuter: boolean, val: string) => {
    const num = evaluateExpression(val);
    if (dimensionMode === "radii") {
      const diaVal = num !== null ? String(num * 2) : val;
      handleInputChange(isOuter ? "diaOuterMm" : "diaInnerMm", diaVal);
    } else {
      handleInputChange(isOuter ? "diaOuterMm" : "diaInnerMm", val);
    }
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
                Calculate dimensions, plate count, torque capacity, and clamping forces for single and multi-plate clutches.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Presets & Scenario */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#6a6f73] mr-1">
            Presets:
          </span>
          {(["C1", "C2", "C3", "C4", "C5"] as const).map((p) => (
            <button
              key={p}
              onClick={() => loadPreset(p)}
              className="rounded-lg border border-[#d1d7dc] bg-white px-3 py-1.5 text-xs font-mono font-black text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f6efff]/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
            >
              {p}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-[#d1d7dc] mx-1" />
          <ScenarioControls
            module="clutch"
            inputs={{ ...inputs, mode, theory }}
            summaryLine={s ? `Do=${formatNum(s.diaOuterMm)} mm, T=${formatNum(s.torqueNm)} N·m` : undefined}
          />
        </div>
      </div>

      {/* Control Bar: Mode & Theory Switchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mode Selector */}
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm transition-all hover:border-[#1c1d1f]/40">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1c1d1f] flex items-center space-x-1.5">
              <Compass className="h-4 w-4 text-[#a435f0]" />
              <span>Calculation Mode</span>
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

          {/* Mode Title Card */}
          <div className="bg-[#f6efff]/50 border border-[#d8b4fe] rounded-lg p-2.5 text-xs text-[#2d2f31] flex items-start space-x-2">
            <Info className="h-4 w-4 text-[#a435f0] shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-[#5624d0]">{modeTitles[mode]}</p>
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
            <strong>Uniform Wear:</strong> Conservative design default (p·r = const). <strong>Uniform Pressure:</strong> High-precision brand new friction plates.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Inputs (Left) and Interactive Diagram / Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-[#d1d7dc] bg-white p-6 shadow-sm space-y-5 transition-all hover:border-[#1c1d1f]/40 hover:shadow-md">
            {/* Header: Title + Clear + Material Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4e8eb] pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#1c1d1f] flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-[#a435f0]" />
                  <span>Input Parameters</span>
                </h3>
                <p className="text-[11px] text-[#6a6f73]">Fill given problem values. All mathematical steps update automatically.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAll}
                  title="Clear all fields to enter custom problem"
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

            {/* Clutch Construction Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#6a6f73] block">
                Clutch Construction Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "multi", label: "Multi-Plate Disc" },
                  { id: "single_both", label: "Single Plate (Both Sides, n'=2)" },
                  { id: "single_one", label: "Single Plate (1 Side, n'=1)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleClutchTypeChange(t.id as ClutchPlateType)}
                    className={`rounded-lg px-2.5 py-2 text-xs font-bold text-center transition-all ${
                      clutchType === t.id
                        ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/20 scale-[1.02]"
                        : "bg-[#f7f9fa] text-[#4b5563] border border-[#d1d7dc] hover:bg-white hover:border-[#a435f0] hover:text-[#a435f0]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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

              {/* Dimension Mode Toggle (Diameters vs Radii) */}
              <div className="pt-2 border-t border-[#e4e8eb]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#6a6f73]">
                    Friction Lining Dimensions
                  </label>
                  <div className="flex items-center space-x-1 text-[11px] font-bold">
                    <button
                      onClick={() => setDimensionMode("diameters")}
                      className={`px-2 py-0.5 rounded transition-all ${
                        dimensionMode === "diameters"
                          ? "bg-[#a435f0] text-white"
                          : "bg-[#f7f9fa] text-[#6a6f73] hover:text-[#1c1d1f]"
                      }`}
                    >
                      Do, Di [mm]
                    </button>
                    <button
                      onClick={() => setDimensionMode("radii")}
                      className={`px-2 py-0.5 rounded transition-all ${
                        dimensionMode === "radii"
                          ? "bg-[#a435f0] text-white"
                          : "bg-[#f7f9fa] text-[#6a6f73] hover:text-[#1c1d1f]"
                      }`}
                    >
                      Ro, Ri [mm]
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      {dimensionMode === "diameters" ? "Outer Dia Do [mm]" : "Outer Radius Ro [mm]"}
                    </label>
                    <input
                      type="text"
                      placeholder={mode === "sizing" ? "Solved automatically" : dimensionMode === "diameters" ? "e.g. 250" : "e.g. 125"}
                      value={displayedOuter}
                      onChange={(e) => handleDimensionChange(true, e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                      {dimensionMode === "diameters" ? "Inner Dia Di [mm]" : "Inner Radius Ri [mm]"}
                    </label>
                    <input
                      type="text"
                      placeholder={mode === "sizing" ? "Solved automatically" : dimensionMode === "diameters" ? "e.g. 150" : "e.g. 75"}
                      value={displayedInner}
                      onChange={(e) => handleDimensionChange(false, e.target.value)}
                      className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ratios & Direct Force Limits */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#1c1d1f] font-black text-xs">Diameter Ratio (Di/Do)</label>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleInputChange("diameterRatio", "0.5")}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                      >
                        0.5
                      </button>
                      <button
                        onClick={() => handleInputChange("diameterRatio", "0.577")}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f6efff] text-[#5624d0] hover:bg-[#a435f0] hover:text-white transition-colors"
                        title="Analytical optimum for max torque (1/√3)"
                      >
                        0.577
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 0.5 or 0.577"
                    value={inputs.diameterRatio}
                    onChange={(e) => handleInputChange("diameterRatio", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                    {mode === "force_limited" ? "Max Axial Spring Limit [N]" : "Axial Clamping Force Fa [N]"}
                  </label>
                  <input
                    type="text"
                    placeholder={mode === "force_limited" ? "e.g. 600" : "Optional (e.g. 2500)"}
                    value={inputs.axialForceLimitN}
                    onChange={(e) => handleInputChange("axialForceLimitN", e.target.value)}
                    className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Radial width fraction if given as b = k * Ro */}
              <div>
                <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">
                  Radial Width Fraction b/Ro (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0.2 (where b = 0.2·Ro)"
                  value={inputs.radialWidthFraction}
                  onChange={(e) => handleInputChange("radialWidthFraction", e.target.value)}
                  className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3.5 py-2.5 text-[#1c1d1f] font-mono text-sm font-bold placeholder-[#9ca3af] focus:border-[#a435f0] focus:ring-2 focus:ring-[#a435f0]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Multi-plate Discs Configuration (Visible in multi mode or custom) */}
              <div className="pt-2 border-t border-[#e4e8eb]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#6a6f73]">
                    Plate Stack &amp; Active Contact Surfaces
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#5624d0]">
                    n&apos; = n1 + n2 - 1
                  </span>
                </div>
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
                    <label className="text-[#1c1d1f] font-black text-xs block mb-1.5">Active Pairs n&apos;</label>
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
                  n&apos; = {result.summary.numFrictionSurfaces} active pairs
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
          {/* Interactive SVG Diagram */}
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
                        {formatNum(theory === "uniform_wear" ? compResult.summary.torqueNm : result.summary.torqueNm, 2)} N·m
                      </td>
                      <td className="py-2 font-black text-[#1e6055]">
                        +{formatNum(
                          Math.abs(
                            ((compResult.summary.torqueNm - result.summary.torqueNm) /
                              Math.min(compResult.summary.torqueNm, result.summary.torqueNm)) *
                              100
                          ),
                          1
                        )}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#4b5563] font-sans font-bold">Axial Force Fa</td>
                      <td className="py-2 font-bold text-[#5624d0]">
                        {formatNum(theory === "uniform_wear" ? result.summary.axialForceN : compResult.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 font-bold text-[#b4690e]">
                        {formatNum(theory === "uniform_wear" ? compResult.summary.axialForceN : result.summary.axialForceN, 1)} N
                      </td>
                      <td className="py-2 text-[#6a6f73]">
                        {formatNum(
                          ((compResult.summary.axialForceN - result.summary.axialForceN) /
                            result.summary.axialForceN) *
                            100,
                          1
                        )}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#4b5563] font-sans font-bold">Mean Diameter Dm</td>
                      <td className="py-2 text-[#5624d0]">
                        {formatNum(theory === "uniform_wear" ? result.summary.meanDiaMm : compResult.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 text-[#b4690e]">
                        {formatNum(theory === "uniform_wear" ? compResult.summary.meanDiaMm : result.summary.meanDiaMm, 2)} mm
                      </td>
                      <td className="py-2 text-[#6a6f73]">
                        {formatNum(
                          ((compResult.summary.meanDiaMm - result.summary.meanDiaMm) /
                            result.summary.meanDiaMm) *
                            100,
                          2
                        )}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interactive What-If Sensitivity Graph */}
          {result.success && result.summary && (
            <ClutchWhatIfCurve
              Do={result.summary.diaOuterMm}
              mu={parsedInputs.mu}
              pMax={result.summary.maxPressureMpa}
              nPrime={result.summary.numFrictionSurfaces}
              currentRatio={result.summary.diaOuterMm > 0 ? result.summary.diaInnerMm / result.summary.diaOuterMm : 0.5}
              onSelectRatio={(ratio) => handleInputChange("diameterRatio", ratio.toFixed(3))}
            />
          )}

          {/* Mathematical Step Workings Display */}
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
                <p className="mt-1">{result.error}</p>
                <p className="mt-2 text-rose-600">
                  Tip: Provide either (Power + Speed), (Torque), or select a Preset above to get valid results.
                </p>
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

      {/* Material Selector Modal */}
      <MaterialSelectorModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(mu, pMax) => {
          handleInputChange("mu", String(mu));
          handleInputChange("pAllowableMpa", String(pMax));
        }}
        filterCategory="clutch"
      />
    </div>
  );
};
