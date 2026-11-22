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
              className={`flex items-start space-x-3 rounded-xl p-3 border text-xs ${
                w.severity === "danger"
                  ? "bg-rose-950/40 border-rose-800 text-rose-200"
                  : w.severity === "warning"
                  ? "bg-amber-950/40 border-amber-800 text-amber-200"
                  : "bg-blue-950/40 border-blue-800 text-blue-200"
              }`}
            >
              {w.severity === "danger" ? (
                <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              ) : w.severity === "warning" ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{w.message}</p>
                {w.recommendation && (
                  <p className="mt-1 text-slate-400 font-mono text-[11px]">{w.recommendation}</p>
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
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700/80"
          >
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-[11px] font-bold text-cyan-400 border border-cyan-800/60">
                  {step.stepNumber}
                </span>
                <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
              </div>

              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 font-mono">
                  <BookOpen className="h-3 w-3 text-cyan-400" />
                  <span>{step.citation}</span>
                </span>
                <button
                  onClick={() => copyStepLatex(step, idx)}
                  title="Copy step KaTeX to clipboard"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  {copiedIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Formula Block */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/50">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Governing Formula
                </span>
                <div className="mt-1 text-cyan-200 overflow-x-auto">
                  <KatexMath math={step.formulaLatex} block />
                </div>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/50">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Numerical Substitution
                </span>
                <div className="mt-1 text-slate-200 overflow-x-auto">
                  <KatexMath math={step.substitutionLatex} block />
                </div>
              </div>
            </div>

            {/* Computed Output */}
            <div className="mt-3 flex items-center justify-between rounded-lg bg-cyan-950/20 border border-cyan-900/30 px-3 py-2">
              <span className="text-[11px] text-slate-400">Step Result:</span>
              <div className="text-right font-medium text-cyan-300 text-sm">
                <KatexMath math={step.resultLatex} />
              </div>
            </div>

            {step.notes && (
              <p className="mt-2 text-[11px] text-slate-400 italic font-sans pl-1">
                Note: {step.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
