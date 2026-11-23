"use client";

import React from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { BookOpen, Layers, RotateCcw, Disc, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleTheme = {
  clutch: {
    name: "Clutch Design",
    codeBg: "bg-[#0f172a] text-[#38bdf8] border-[#334155]",
    tagBg: "bg-[#f1f5f9] text-[#0369a1] border-[#cbd5e1]",
    icon: <Layers className="h-4 w-4 text-[#0284c7]" />,
  },
  block_brake: {
    name: "Block Brake",
    codeBg: "bg-[#0f172a] text-[#fcd34d] border-[#334155]",
    tagBg: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
    icon: <RotateCcw className="h-4 w-4 text-[#d97706]" />,
  },
  band_brake: {
    name: "Band Brake",
    codeBg: "bg-[#0f172a] text-[#6ee7b7] border-[#334155]",
    tagBg: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
    icon: <Disc className="h-4 w-4 text-[#059669]" />,
  },
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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#cbd5e1]">
        <div className="flex items-center space-x-2">
          {moduleTheme[module].icon}
          <h2 className="text-base font-bold text-[#0f172a] tracking-tight">{title}</h2>
          <span className="text-xs font-mono font-semibold text-[#64748b]">({problems.length} problems)</span>
        </div>
        <span className="text-[11px] font-mono text-[#0369a1] font-semibold">Deterministic Benchmark Suite</span>
      </div>

      {/* Problem Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {problems.map((p) => {
          const isErrata = p.code === "B3" || p.code === "B4" || p.code === "C4" || p.code === "BB3";
          return (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-4 cursor-pointer shadow-sm hover:shadow-md transition-all hover:border-[#0284c7]"
              onClick={() => onSelectProblem(p.module, p.id)}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`rounded px-2 py-0.5 text-xs font-mono font-bold border ${moduleTheme[module].codeBg}`}>
                    {p.code}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-[#64748b]">
                    <span>{p.source}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#94a3b8] group-hover:text-[#0284c7] transition-colors" />
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] group-hover:text-[#0284c7] line-clamp-2 leading-snug mb-1 transition-colors">
                  {p.title}
                </h3>
                <p className="text-[11px] font-normal text-[#475569] line-clamp-2 leading-relaxed mb-3">
                  {p.description}
                </p>
              </div>

              {/* Badges & Key Result */}
              <div className="pt-2.5 border-t border-[#f1f5f9] mt-1 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  {isErrata ? (
                    <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Errata Corrected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 rounded bg-slate-50 px-2 py-0.5 text-slate-700 border border-slate-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Verified Solution</span>
                    </span>
                  )}
                  <span className="text-[#64748b]">23EMEC301</span>
                </div>

                <div className="text-[11px] font-mono font-semibold text-[#0f172a] bg-[#f8fafc] px-2.5 py-1.5 rounded-md border border-[#e2e8f0] truncate">
                  <span className="text-[#64748b] mr-1">Target:</span>
                  {p.keyResults}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Gallery Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f172a] text-[#38bdf8] border border-[#1e293b] shadow-sm">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
                  Engineering Problem Bank
                </h1>
                <span className="rounded bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                  12 Canonical Test Cases
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-[#64748b]">
                Standard exam scenarios and textbook review cases per KLE Tech 23EMEC301 curriculum.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono font-bold text-[#475569]">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
            <span>Clutch (5)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d97706]" />
            <span>Block Brake (4)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            <span>Band Brake (3)</span>
          </span>
        </div>
      </div>

      {/* 3 Categories: Clutch, Block Brake, Band Brake */}
      {renderGroup("Disc Clutch Review & Exam Questions", "clutch", clutchProblems)}
      {renderGroup("Block (Shoe) Brake Equilibrium Problems", "block_brake", blockProblems)}
      {renderGroup("Band Brake Design & Analysis Problems", "band_brake", bandProblems)}
    </div>
  );
};
