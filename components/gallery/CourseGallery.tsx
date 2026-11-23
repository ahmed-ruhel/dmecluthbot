"use client";

import React, { useState } from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { Layers, RotateCcw, Disc, ArrowRight, BookOpen } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleTheme = {
  clutch: {
    name: "Clutch Design",
    gradient: "from-[#a435f0] to-[#5624d0]",
    icon: <Layers className="h-5 w-5 text-[#a435f0]" />,
  },
  block_brake: {
    name: "Block Brake",
    gradient: "from-[#2d2f31] to-[#0f172a]",
    icon: <RotateCcw className="h-5 w-5 text-[#a435f0]" />,
  },
  band_brake: {
    name: "Band Brake",
    gradient: "from-[#1e6055] to-[#0f4037]",
    icon: <Disc className="h-5 w-5 text-[#a435f0]" />,
  },
};

type FilterCategory = "all" | "clutch" | "block_brake" | "band_brake";

export const CourseGallery: React.FC<CourseGalleryProps> = ({ onSelectProblem }) => {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const clutchProblems = GALLERY_PROBLEMS.filter((p) => p.module === "clutch");
  const blockProblems = GALLERY_PROBLEMS.filter((p) => p.module === "block_brake");
  const bandProblems = GALLERY_PROBLEMS.filter((p) => p.module === "band_brake");

  const renderGroup = (
    title: string,
    subtitle: string,
    module: "clutch" | "block_brake" | "band_brake",
    problems: typeof GALLERY_PROBLEMS
  ) => {
    const theme = moduleTheme[module];
    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-[#d1d7dc]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1c1d1f] tracking-tight">{title}</h2>
            <p className="text-xs sm:text-sm text-[#6a6f73] mt-0.5">{subtitle}</p>
          </div>
          <span className="text-xs font-black text-[#5624d0] hover:text-[#a435f0] transition-colors cursor-pointer group flex items-center space-x-1">
            <span>Explore all {problems.length} problems</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </span>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {problems.map((p) => {
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-lg border border-[#d1d7dc] bg-[#ffffff] p-3 cursor-pointer shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1c1d1f]"
                onClick={() => onSelectProblem(p.module, p.id)}
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className={`relative h-28 rounded-md bg-gradient-to-tr ${theme.gradient} p-3 text-white flex flex-col justify-between shadow-sm mb-3 overflow-hidden transition-all duration-300`}>
                    <div className="flex items-center justify-between z-10">
                      <span className="rounded bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-xs font-mono font-black tracking-wider uppercase text-white shadow-sm">
                        {p.code}
                      </span>
                    </div>

                    <div className="z-10">
                      <span className="text-sm font-black leading-tight line-clamp-1 text-white group-hover:underline">{p.title}</span>
                      <span className="text-[11px] font-medium text-white/80 block mt-0.5">{theme.name} Masterclass</span>
                    </div>

                    <Disc className="absolute -bottom-6 -right-6 h-28 w-28 text-white/10 transition-transform duration-700 ease-out group-hover:rotate-45 pointer-events-none" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-[#1c1d1f] group-hover:text-[#5624d0] line-clamp-2 leading-snug mb-3 transition-colors">
                    {p.title}
                  </h3>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-[#e4e8eb] space-y-2">
                  <button className="w-full rounded border border-[#a435f0] text-[#a435f0] hover:bg-[#a435f0] hover:text-white active:scale-95 py-2 text-xs font-black transition-all duration-200 flex items-center justify-center space-x-1.5 group-hover:bg-[#a435f0] group-hover:text-white shadow-sm hover:shadow">
                    <span>Solve in Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#d1d7dc] pb-3">
        {[
          { id: "all", label: `All Problems (${GALLERY_PROBLEMS.length})` },
          { id: "clutch", label: `Clutch (${clutchProblems.length})` },
          { id: "block_brake", label: `Block Brake (${blockProblems.length})` },
          { id: "band_brake", label: `Band Brake (${bandProblems.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterCategory)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/20"
                : "bg-white text-[#4b5563] border border-[#d1d7dc] hover:border-[#a435f0] hover:text-[#a435f0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course Categories based on filter */}
      {(filter === "all" || filter === "clutch") &&
        renderGroup(
          "Clutch design problems",
          "Single-plate, multi-plate, and axial clamping force calculations under Uniform Wear and Uniform Pressure.",
          "clutch",
          clutchProblems
        )}

      {(filter === "all" || filter === "block_brake") &&
        renderGroup(
          "Short block (shoe) brake equilibrium problems",
          "Fulcrum moments, clockwise & counter-clockwise rotations, and self-locking boundary validation.",
          "block_brake",
          blockProblems
        )}

      {(filter === "all" || filter === "band_brake") &&
        renderGroup(
          "Band brake tension & sizing problems",
          "Simple and differential band brakes with capstan tension ratio F1/F2 = e^(μθ) and lever stresses.",
          "band_brake",
          bandProblems
        )}
    </div>
  );
};
