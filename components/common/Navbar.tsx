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
    <header className="sticky top-0 z-50 bg-white border-b border-[#d1d7dc] shadow-sm">
      {/* Udemy-style Top Announcement Banner */}
      <div className="bg-[#5624d0] text-white text-[12px] font-medium py-1.5 px-4 text-center">
        <span className="font-semibold">23EMEC301 Design of Machine Elements</span> &bull; Sem V GenAI Component 2 &bull; KLE Technological University
      </div>

      {/* Main Navbar: Full Fluid Width (no huge left/right gutters) */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab("clutch")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a435f0] text-white shadow-sm">
            <Disc className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-[#2d2f31]">GripLab</span>
              <span className="rounded bg-[#f6efff] px-2 py-0.5 text-[11px] font-bold text-[#5624d0] border border-[#d8b4fe]">
                DME Sem V
              </span>
            </div>
            <p className="text-[11px] text-[#6a6f73] hidden sm:block">
              Clutch &amp; Brake Force Calculator &bull; Mahadevan &amp; Reddy (4th Ed)
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Udemy Button / Tab Aesthetic) */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab("clutch")}
            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "clutch"
                ? "bg-[#a435f0] text-white shadow-sm"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Clutch Studio</span>
          </button>

          <button
            onClick={() => onSelectTab("block_brake")}
            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "block_brake"
                ? "bg-[#a435f0] text-white shadow-sm"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Block Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("band_brake")}
            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "band_brake"
                ? "bg-[#a435f0] text-white shadow-sm"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Disc className="h-3.5 w-3.5" />
            <span>Band Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("gallery")}
            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "gallery"
                ? "bg-[#a435f0] text-white shadow-sm"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Course Gallery (12)</span>
          </button>

          <button
            onClick={() => onSelectTab("report")}
            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "report"
                ? "bg-[#a435f0] text-white shadow-sm"
                : "text-[#2d2f31] hover:bg-[#f7f9fa] hover:text-[#a435f0]"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>2-Page Report</span>
          </button>
        </nav>

        {/* Right Actions: AI Parser & Math Shield */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 rounded-md bg-[#a435f0] hover:bg-[#8710d8] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Problem Autofill</span>
          </button>

          <div className="hidden xl:flex items-center space-x-1.5 rounded-md bg-[#f7f9fa] border border-[#d1d7dc] px-2.5 py-1.5 text-[11px] font-semibold text-[#2d2f31]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1e6055]" />
            <span>Deterministic Math</span>
          </div>
        </div>
      </div>
    </header>
  );
};
