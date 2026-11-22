"use client";

import React from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { BookOpen, Layers, RotateCcw, Disc, ChevronRight, AlertTriangle, Star } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleTheme = {
  clutch: {
    name: "Clutch Design",
    gradient: "from-[#5624d0] to-[#a435f0]",
    badge: "bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]",
    icon: <Layers className="h-4 w-4 text-[#a435f0]" />,
  },
  block_brake: {
    name: "Block Brake",
    gradient: "from-[#b4690e] to-[#f59e0b]",
    badge: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
    icon: <RotateCcw className="h-4 w-4 text-[#b4690e]" />,
  },
  band_brake: {
    name: "Band Brake",
    gradient: "from-[#1e6055] to-[#10b981]",
    badge: "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]",
    icon: <Disc className="h-4 w-4 text-[#1e6055]" />,
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
      <div className="flex items-center justify-between pb-2 border-b border-[#e4e8eb]">
        <div className="flex items-center space-x-2">
          {moduleTheme[module].icon}
          <h3 className="text-base font-bold text-[#2d2f31]">{title}</h3>
          <span className="text-xs text-[#6a6f73]">({problems.length} problems)</span>
        </div>
        <span className="text-xs font-semibold text-[#a435f0]">1-Click Solve &bull; Full Working</span>
      </div>

      {/* Udemy-style Card Grid (matching uploaded screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {problems.map((p) => {
          const isErrata = p.code === "B3" || p.code === "B4" || p.code === "C4" || p.code === "BB3";
          return (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-lg border border-[#d1d7dc] bg-white p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#a435f0]"
              onClick={() => onSelectProblem(p.module, p.id)}
            >
              <div>
                {/* Course Thumbnail Banner */}
                <div className={`h-24 rounded-md bg-gradient-to-tr ${moduleTheme[module].gradient} p-3 text-white flex flex-col justify-between shadow-sm mb-3`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-black/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase text-white">
                      {p.code}
                    </span>
                    <span className="text-[10px] font-semibold text-white/90">23EMEC301</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold leading-tight line-clamp-1 text-white">{p.title}</span>
                    <span className="text-[10px] text-white/80 block mt-0.5">{moduleTheme[module].name}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-sm font-bold text-[#2d2f31] group-hover:text-[#a435f0] line-clamp-2 leading-snug mb-1">
                  {p.title}
                </h4>
                <p className="text-[11px] text-[#6a6f73] line-clamp-2 leading-relaxed mb-2.5">
                  {p.description}
                </p>

                {/* Source & Rating */}
                <div className="flex items-center space-x-1.5 text-[11px] text-[#6a6f73] mb-2">
                  <span className="font-semibold text-[#b4690e]">4.9</span>
                  <div className="flex items-center text-[#e59819]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#919496] font-mono">({p.source})</span>
                </div>
              </div>

              {/* Badges & Key Result (Udemy Price Tag Style) */}
              <div className="pt-2 border-t border-[#f0f2f5] mt-2">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  {isErrata ? (
                    <span className="inline-flex items-center space-x-1 rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-bold text-[#3d3c0a]">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Errata Corrected</span>
                    </span>
                  ) : (
                    <span className="rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-bold text-[#3d3c0a]">
                      Bestseller Exam Q
                    </span>
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono ${moduleTheme[module].badge}`}>
                    {p.code}
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-[#2d2f31] bg-[#f7f9fa] p-1.5 rounded border border-[#e4e8eb] truncate">
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-[#d1d7dc] bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0] border border-[#d8b4fe]">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#2d2f31]">Course Question Gallery</h2>
            <span className="rounded bg-[#eceb98] px-2 py-0.5 text-[11px] font-bold text-[#3d3c0a]">
              12 Canonical Problems
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Curated examination and review problems from course 23EMEC301. Click any card to load inputs into the studio.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-[#6a6f73]">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#a435f0]" />
            <span>Clutch (5)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#b4690e]" />
            <span>Block Brake (4)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#1e6055]" />
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
