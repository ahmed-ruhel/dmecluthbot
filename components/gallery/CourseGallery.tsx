"use client";

import React from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { BookOpen, Layers, RotateCcw, Disc, Star, AlertTriangle } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleTheme = {
  clutch: {
    name: "Clutch Design",
    gradient: "from-[#5624d0] to-[#a435f0]",
    badge: "bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]",
    icon: <Layers className="h-5 w-5 text-[#a435f0]" />,
  },
  block_brake: {
    name: "Block Brake",
    gradient: "from-[#b4690e] to-[#f59e0b]",
    badge: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
    icon: <RotateCcw className="h-5 w-5 text-[#b4690e]" />,
  },
  band_brake: {
    name: "Band Brake",
    gradient: "from-[#1e6055] to-[#10b981]",
    badge: "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]",
    icon: <Disc className="h-5 w-5 text-[#1e6055]" />,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#e4e8eb]">
        <div className="flex items-center space-x-2.5">
          {moduleTheme[module].icon}
          <h2 className="text-lg sm:text-xl font-black text-[#1c1d1f] tracking-tight">{title}</h2>
          <span className="text-xs font-bold text-[#6b7280]">({problems.length} problems)</span>
        </div>
        <span className="text-xs font-black text-[#a435f0]">1-Click Solve &bull; Step-by-Step Derivations</span>
      </div>

      {/* Course Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {problems.map((p) => {
          const isErrata = p.code === "B3" || p.code === "B4" || p.code === "C4" || p.code === "BB3";
          return (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-xl border-2 border-[#d1d7dc] bg-white p-4 cursor-pointer hover:shadow-lg transition-all hover:border-[#a435f0] hover:scale-[1.01]"
              onClick={() => onSelectProblem(p.module, p.id)}
            >
              <div>
                {/* Course Banner */}
                <div className={`h-24 rounded-lg bg-gradient-to-tr ${moduleTheme[module].gradient} p-3 text-white flex flex-col justify-between shadow-sm mb-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-black/40 backdrop-blur-sm px-2.5 py-0.5 text-xs font-mono font-black tracking-wider uppercase text-white">
                      {p.code}
                    </span>
                    <span className="text-xs font-black text-white/95">23EMEC301</span>
                  </div>
                  <div>
                    <span className="text-sm font-black leading-tight line-clamp-1 text-white">{p.title}</span>
                    <span className="text-xs font-bold text-white/80 block mt-0.5">{moduleTheme[module].name}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-black text-[#1c1d1f] group-hover:text-[#a435f0] line-clamp-2 leading-snug mb-1.5">
                  {p.title}
                </h3>
                <p className="text-xs font-medium text-[#4b5563] line-clamp-2 leading-relaxed mb-3">
                  {p.description}
                </p>

                {/* Source & Rating */}
                <div className="flex items-center space-x-1.5 text-xs text-[#4b5563] mb-2.5">
                  <span className="font-black text-[#b4690e]">4.9</span>
                  <div className="flex items-center text-[#e59819]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#6b7280] font-mono">({p.source})</span>
                </div>
              </div>

              {/* Badges & Key Result */}
              <div className="pt-2.5 border-t-2 border-[#f0f2f5] mt-2">
                <div className="flex items-center justify-between gap-1 mb-2">
                  {isErrata ? (
                    <span className="inline-flex items-center space-x-1 rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-black text-[#3d3c0a]">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Errata Corrected</span>
                    </span>
                  ) : (
                    <span className="rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-black text-[#3d3c0a]">
                      Bestseller Exam Q
                    </span>
                  )}
                  <span className={`rounded px-2 py-0.5 text-[10px] font-black font-mono ${moduleTheme[module].badge}`}>
                    {p.code}
                  </span>
                </div>

                <div className="text-xs font-mono font-black text-[#111827] bg-[#f7f9fa] p-2 rounded-lg border border-[#e4e8eb] truncate">
                  🎯 {p.keyResults}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border-2 border-[#d1d7dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe] shadow-sm">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1d1f]">
                  Course Question Gallery
                </h1>
                <span className="rounded bg-[#eceb98] px-2.5 py-0.5 text-xs font-black text-[#3d3c0a]">
                  12 Canonical Problems
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#4b5563]">
                Curated examination &amp; review problems from course 23EMEC301. Click any card to instantly load and solve.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs font-black text-[#4b5563]">
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#a435f0]" />
            <span>Clutch (5)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#b4690e]" />
            <span>Block Brake (4)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1e6055]" />
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
