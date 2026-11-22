"use client";

import React from "react";
import { Disc, Layers, ShieldCheck, Printer, Sparkles, BookOpen, RotateCcw } from "lucide-react";

export type ActiveTab = "clutch" | "block_brake" | "band_brake" | "gallery" | "report";

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAiModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAiModal,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#f7f9fa] border-b border-[#d1d7dc] shadow-sm">
      {/* Main Navbar: Full Fluid Width without unwanted top banner */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onSelectTab("clutch")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25">
            <Disc className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-[#1c1d1f]">GripLab</span>
              <span className="rounded-md bg-[#f6efff] px-2.5 py-0.5 text-xs font-extrabold text-[#5624d0] border border-[#d8b4fe]">
                23EMEC301
              </span>
            </div>
            <p className="text-xs font-medium text-[#4b5563] hidden sm:block">
              Clutch &amp; Brake Force Calculator &bull; Sem V DME
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Bold & Prominent) */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab("clutch")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-all ${
              activeTab === "clutch"
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Clutch Studio</span>
          </button>

          <button
            onClick={() => onSelectTab("block_brake")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-all ${
              activeTab === "block_brake"
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Block Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("band_brake")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-all ${
              activeTab === "band_brake"
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Disc className="h-4 w-4" />
            <span>Band Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("gallery")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-all ${
              activeTab === "gallery"
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Course Gallery (12)</span>
          </button>

          <button
            onClick={() => onSelectTab("report")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-all ${
              activeTab === "report"
                ? "bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 scale-[1.02]"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>2-Page Report</span>
          </button>
        </nav>

        {/* Right Actions: AI Parser & Math Shield */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-2 rounded-lg bg-[#a435f0] hover:bg-[#8710d8] px-4 py-2 text-xs sm:text-sm font-extrabold text-white transition-all shadow-md shadow-[#a435f0]/20 hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Problem Autofill</span>
          </button>

          <div className="hidden xl:flex items-center space-x-1.5 rounded-lg bg-[#f7f9fa] border border-[#d1d7dc] px-3 py-2 text-xs font-extrabold text-[#1f2937]">
            <ShieldCheck className="h-4 w-4 text-[#1e6055]" />
            <span>Deterministic Math</span>
          </div>
        </div>
      </div>
    </header>
  );
};
