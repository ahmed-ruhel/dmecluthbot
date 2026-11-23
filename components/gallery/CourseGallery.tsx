"use client";

import React from "react";
import { GALLERY_PROBLEMS } from "@/data/gallery-problems";
import { BookOpen, Layers, RotateCcw, Disc, Star, AlertTriangle, ArrowRight } from "lucide-react";

interface CourseGalleryProps {
  onSelectProblem: (moduleId: "clutch" | "block_brake" | "band_brake", presetCode: string) => void;
}

const moduleTheme = {
  clutch: {
    name: "Clutch Design",
    gradient: "from-[#a435f0] to-[#5624d0]",
    badgeBg: "bg-[#f6efff] text-[#5624d0] border-[#d8b4fe]",
    badgeType: "Bestseller",
    price: "₹459.00",
    oldPrice: "₹3,199.00",
    ratingsCount: "4,40,545 ratings",
    rating: "4.8",
    icon: <Layers className="h-5 w-5 text-[#a435f0]" />,
  },
  block_brake: {
    name: "Block Brake",
    gradient: "from-[#2d2f31] to-[#0f172a]",
    badgeBg: "bg-[#eceb98] text-[#3d3c0a] border-[#e2e185]",
    badgeType: "Premium",
    price: "₹449.00",
    oldPrice: "₹1,919.00",
    ratingsCount: "13,620 ratings",
    rating: "4.7",
    icon: <RotateCcw className="h-5 w-5 text-[#a435f0]" />,
  },
  band_brake: {
    name: "Band Brake",
    gradient: "from-[#1e6055] to-[#0f4037]",
    badgeBg: "bg-[#f6efff] text-[#5624d0] border-[#d8b4fe]",
    badgeType: "Role Play",
    price: "₹629.00",
    oldPrice: "₹4,359.00",
    ratingsCount: "52,203 ratings",
    rating: "4.9",
    icon: <Disc className="h-5 w-5 text-[#a435f0]" />,
  },
};

export const CourseGallery: React.FC<CourseGalleryProps> = ({ onSelectProblem }) => {
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
          <span className="text-xs font-black text-[#5624d0] hover:text-[#a435f0] cursor-pointer">
            Explore all {problems.length} problems &rarr;
          </span>
        </div>

        {/* Udemy Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {problems.map((p) => {
            const isErrata = p.code === "B3" || p.code === "B4" || p.code === "C4" || p.code === "BB3";
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-lg border border-[#d1d7dc] bg-[#ffffff] p-3 cursor-pointer shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:border-[#1c1d1f]"
                onClick={() => onSelectProblem(p.module, p.id)}
              >
                <div>
                  {/* Course Thumbnail Banner */}
                  <div className={`relative h-28 rounded-md bg-gradient-to-tr ${theme.gradient} p-3 text-white flex flex-col justify-between shadow-sm mb-3 overflow-hidden group-hover:opacity-95 transition-opacity`}>
                    <div className="flex items-center justify-between z-10">
                      <span className="rounded bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[11px] font-mono font-black tracking-wider uppercase text-white">
                        {p.code}
                      </span>
                      <span className="text-[11px] font-black text-white/90">23EMEC301</span>
                    </div>

                    <div className="z-10">
                      <span className="text-sm font-black leading-tight line-clamp-1 text-white">{p.title}</span>
                      <span className="text-[11px] font-medium text-white/80 block mt-0.5">{theme.name} Masterclass</span>
                    </div>

                    {/* Subtle backdrop disc watermark */}
                    <Disc className="absolute -bottom-6 -right-6 h-28 w-28 text-white/10 pointer-events-none" />
                  </div>

                  {/* Course Title & Author / Source */}
                  <h3 className="text-sm font-black text-[#1c1d1f] group-hover:text-[#5624d0] line-clamp-2 leading-snug mb-1 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#6a6f73] line-clamp-1 mb-1.5 font-medium">
                    {p.source} &bull; KLE Tech DME Faculty
                  </p>

                  {/* Rating & Review Stars (Exact Udemy Style) */}
                  <div className="flex items-center space-x-1.5 text-xs mb-2">
                    <span className="font-black text-[#b4690e]">{theme.rating}</span>
                    <div className="flex items-center text-[#e59819]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#6a6f73]">({theme.ratingsCount})</span>
                  </div>

                  {/* Price Row (Udemy ₹ pricing tags) */}
                  <div className="flex items-baseline space-x-2 mb-2.5">
                    <span className="text-base font-black text-[#1c1d1f]">{theme.price}</span>
                    <span className="text-xs text-[#6a6f73] line-through">{theme.oldPrice}</span>
                  </div>
                </div>

                {/* Footer Badges & Add to Cart Action */}
                <div className="pt-2 border-t border-[#e4e8eb] space-y-2">
                  <div className="flex items-center justify-between">
                    {isErrata ? (
                      <span className="inline-flex items-center space-x-1 rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-black text-[#3d3c0a]">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Errata Solved</span>
                      </span>
                    ) : (
                      <span className="rounded bg-[#eceb98] px-2 py-0.5 text-[10px] font-black text-[#3d3c0a]">
                        Bestseller
                      </span>
                    )}

                    <span className="text-[10px] font-bold font-mono text-[#5624d0]">
                      {p.code}
                    </span>
                  </div>

                  {/* Quick Action Button: Add to Cart / Solve */}
                  <button className="w-full rounded border border-[#a435f0] text-[#a435f0] hover:bg-[#a435f0] hover:text-white py-1.5 text-xs font-black transition-colors flex items-center justify-center space-x-1 group-hover:bg-[#a435f0] group-hover:text-white">
                    <span>Solve in Studio</span>
                    <ArrowRight className="h-3 w-3" />
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
    <div className="space-y-10">
      {/* Udemy Hero Banner Section */}
      <div className="rounded-xl border border-[#d1d7dc] bg-[#f7f9fa] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-[#eceb98] px-2 py-0.5 text-xs font-black text-[#3d3c0a]">
              23EMEC301
            </span>
            <span className="text-xs font-bold text-[#6a6f73]">Design of Machine Elements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1d1f] tracking-tight">
            Skills to transform your DME examination performance
          </h1>
          <p className="text-sm text-[#4b5563] leading-relaxed">
            From single &amp; multi-plate clutches to block and differential band brakes — solve and explore all 12 canonical question sets with full step-by-step mathematical derivations.
          </p>
        </div>

        {/* Quick Summary Pill Stats */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-white rounded-lg border border-[#d1d7dc] px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-black text-[#a435f0]">12</p>
            <p className="text-xs font-bold text-[#6a6f73]">Exam Problems</p>
          </div>
          <div className="bg-white rounded-lg border border-[#d1d7dc] px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1e6055]">100%</p>
            <p className="text-xs font-bold text-[#6a6f73]">Deterministic</p>
          </div>
        </div>
      </div>

      {/* Course Categories (Udemy Style) */}
      {renderGroup(
        "Trending clutch design problems",
        "Single-plate, multi-plate, and axial clamping force calculations under Uniform Wear and Uniform Pressure.",
        "clutch",
        clutchProblems
      )}

      {renderGroup(
        "Short block (shoe) brake equilibrium problems",
        "Fulcrum moments, clockwise & counter-clockwise rotations, and self-locking boundary validation.",
        "block_brake",
        blockProblems
      )}

      {renderGroup(
        "Band brake tension & sizing masterclass",
        "Simple and differential band brakes with capstan tension ratio F1/F2 = e^(μθ) and lever stresses.",
        "band_brake",
        bandProblems
      )}
    </div>
  );
};
