"use client";

import React, { useState } from "react";
import { StepDetail, EngineWarning } from "@/lib/engine/types";
import { KatexMath } from "./KatexMath";
import { Copy, Check, BookOpen, AlertTriangle, Info, AlertOctagon } from "lucide-react";

interface StepDisplayProps {
  steps: StepDetail[];
  warnings?: EngineWarning[];
}

export const StepDisplay: React.FC<StepDisplayProps> = ({ steps, warnings = [] }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyStepLatex = (step: StepDetail, idx: number) => {
    const text = `% Step ${step.stepNumber}: ${step.title} (${step.citation})
Formula: ${step.formulaLatex}
Substitution: ${step.substitutionLatex}
Result: ${step.resultLatex}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Engine Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 rounded-lg p-3 border text-xs ${
                w.severity === "danger"
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : w.severity === "warning"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-blue-50 border-blue-300 text-blue-900"
              }`}
            >
              {w.severity === "danger" ? (
                <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              ) : w.severity === "warning" ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{w.message}</p>
                {w.recommendation && (
                  <p className="mt-1 text-slate-700 font-mono text-[11px]">{w.recommendation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step by Step Working Accordion / List */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] p-4 shadow-sm transition-all hover:border-[#a435f0]/50"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e4e8eb]">
              <div className="flex items-center space-x-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f6efff] text-[11px] font-bold text-[#5624d0]">
                  {step.stepNumber}
                </span>
                <h4 className="text-xs font-bold text-[#2d2f31]">{step.title}</h4>
              </div>

              <div className="flex items-center space-x-2">
                {step.citation && (
                  <span className="flex items-center space-x-1 rounded bg-[#f7f9fa] border border-[#d1d7dc] px-2 py-0.5 text-[10px] font-mono font-medium text-[#6a6f73]">
                    <BookOpen className="h-3 w-3 text-[#a435f0]" />
                    <span>{step.citation}</span>
                  </span>
                )}
                <button
                  onClick={() => copyStepLatex(step, idx)}
                  title="Copy step LaTeX derivation"
                  className="rounded p-1 text-[#6a6f73] hover:bg-[#f7f9fa] hover:text-[#a435f0] transition-colors"
                >
                  {copiedIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* LaTeX Renderings */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a6f73]">Formula</span>
                <div className="bg-[#f7f9fa] rounded-md px-3 py-1.5 border border-[#e4e8eb] overflow-x-auto text-[#2d2f31]">
                  <KatexMath math={step.formulaLatex} block />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a6f73]">Substitution</span>
                <div className="bg-[#f7f9fa] rounded-md px-3 py-1.5 border border-[#e4e8eb] overflow-x-auto text-[#2d2f31]">
                  <KatexMath math={step.substitutionLatex} block />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a6f73]">Result</span>
                <div className="font-mono text-xs font-bold text-[#5624d0]">
                  <KatexMath math={step.resultLatex} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
