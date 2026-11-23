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
    <div className="space-y-3.5">
      {/* Engine Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 rounded-lg p-3 border text-xs ${
                w.severity === "danger"
                  ? "bg-rose-50/70 border-rose-300 text-rose-900"
                  : w.severity === "warning"
                  ? "bg-amber-50/70 border-amber-300 text-amber-900"
                  : "bg-sky-50/70 border-sky-300 text-sky-900"
              }`}
            >
              {w.severity === "danger" ? (
                <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              ) : w.severity === "warning" ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{w.message}</p>
                {w.recommendation && (
                  <p className="mt-0.5 text-slate-700 font-mono text-[11px]">{w.recommendation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step by Step Working Accordion / List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-3.5 shadow-sm transition-all hover:border-[#0284c7]"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f1f5f9]">
              <div className="flex items-center space-x-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#f1f5f9] text-[10px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                  {step.stepNumber}
                </span>
                <h4 className="text-xs font-bold text-[#0f172a]">{step.title}</h4>
              </div>

              <div className="flex items-center space-x-2">
                {step.citation && (
                  <span className="flex items-center space-x-1 rounded bg-[#f8fafc] border border-[#cbd5e1] px-2 py-0.5 text-[10px] font-mono font-medium text-[#475569]">
                    <BookOpen className="h-3 w-3 text-[#0284c7]" />
                    <span>{step.citation}</span>
                  </span>
                )}
                <button
                  onClick={() => copyStepLatex(step, idx)}
                  title="Copy step LaTeX derivation"
                  className="rounded p-1 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0284c7] transition-colors"
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
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b]">Analytical Formula</span>
                <div className="bg-[#f8fafc] rounded-md px-3 py-1.5 border border-[#e2e8f0] overflow-x-auto text-[#0f172a]">
                  <KatexMath math={step.formulaLatex} block />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b]">Numerical Substitution</span>
                <div className="bg-[#f8fafc] rounded-md px-3 py-1.5 border border-[#e2e8f0] overflow-x-auto text-[#0f172a]">
                  <KatexMath math={step.substitutionLatex} block />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b]">Calculated Result</span>
                <div className="font-mono text-xs font-bold text-[#0284c7]">
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
