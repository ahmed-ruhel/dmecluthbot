"use client";

import React from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { BookOpen, Layers, RotateCcw, Disc, ChevronRight, AlertTriangle } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleIcons = {
  clutch: <Layers className="h-4 w-4 text-cyan-400" />,
  block_brake: <RotateCcw className="h-4 w-4 text-amber-400" />,
  band_brake: <Disc className="h-4 w-4 text-emerald-400" />,
};

const moduleColors = {
  clutch: { badge: "bg-cyan-950/80 border-cyan-800 text-cyan-300", hover: "hover:border-cyan-600/60" },
  block_brake: { badge: "bg-amber-950/80 border-amber-800 text-amber-300", hover: "hover:border-amber-600/60" },
  band_brake: { badge: "bg-emerald-950/80 border-emerald-800 text-emerald-300", hover: "hover:border-emerald-600/60" },
};

export const CourseGallery: React.FC<CourseGalleryProps> = ({ onSelectProblem }) => {
  const clutchProblems = GALLERY_PROBLEMS.filter((p) => p.module === "clutch");
  const blockProblems = GALLERY_PROBLEMS.filter((p) => p.module === "block_brake");
  const bandProblems = GALLERY_PROBLEMS.filter((p) => p.module === "band_brake");

  const renderGroup = (
    title: string,
    module: "clutch" | "block_brake" | "band_brake",
    problems: typeof GALLERY_PROBLEMS
  ) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 pb-1 border-b border-slate-800/80">
        {moduleIcons[module]}
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-xs text-slate-500">({problems.length} problems)</span>
      </div>
      {problems.map((p) => (
        <div
          key={p.id}
          className={`group rounded-xl border border-slate-800 bg-[#070c16] p-4 cursor-pointer transition-all ${moduleColors[module].hover} hover:bg-slate-900/60`}
          onClick={() => onSelectProblem(p.module, p.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold font-mono ${moduleColors[module].badge}`}>
                  {p.code}
                </span>
                <h4 className="text-sm font-semibold text-slate-100">{p.title}</h4>
              </div>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">📚 {p.source}</span>
                {(p.code === "B3" || p.code === "B4" || p.code === "C4" || p.code === "BB3") && (
                  <span className="flex items-center space-x-0.5 text-[10px] text-amber-400 font-semibold">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Errata Example</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] font-mono text-slate-500 mb-1.5">Expected:</div>
              <div className="text-[11px] font-mono text-emerald-400 max-w-[180px] text-right">{p.keyResults}</div>
              <div className="mt-2 flex items-center justify-end space-x-1 text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span className="text-xs">Load →</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-700/50">
            <BookOpen className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-white">Course Question Gallery</h2>
          <span className="rounded bg-purple-950 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-300 border border-purple-800/60">
            12 Exam Problems
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          All 12 problems from course review sessions, Minor II, and End Semester Assessments (ESA). Click any problem to load it
          instantly into the corresponding studio with 1-click preset application. Errata examples demonstrate how GripLab corrects known
          errors from the handwritten class notes.
        </p>
      </div>

      {/* Problem groups */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div>
          {renderGroup("Disc Clutch Problems (C1–C5)", "clutch", clutchProblems)}
        </div>
        <div>
          {renderGroup("Block Brake Problems (B1–B4)", "block_brake", blockProblems)}
        </div>
        <div>
          {renderGroup("Band Brake Problems (BB1–BB3)", "band_brake", bandProblems)}
        </div>
      </div>
    </div>
  );
};
