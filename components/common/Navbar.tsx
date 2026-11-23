"use client";

import React from "react";
import { Disc, Layers, Printer, Sparkles, BookOpen, RotateCcw, Cpu } from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#cbd5e1] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
      {/* Top Drafting Status Bar */}
      <div className="w-full border-b border-[#f1f5f9] px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between text-[11px] font-mono text-[#64748b] bg-[#f8fafc]/80 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 font-bold text-[#0f172a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7] animate-pulse"></span>
            <span>CAD / CAE WORKBENCH</span>
          </span>
          <span className="hidden md:inline text-[#cbd5e1]">|</span>
          <span className="hidden md:inline">SPEC: KLE TECH 23EMEC301 &bull; DME DESIGN DATA HANDBOOK</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-semibold text-[#334155]">
            <Cpu className="h-3 w-3 text-[#0284c7]" />
            <span>CALC ENGINE: DETERMINISTIC</span>
          </span>
          <span className="hidden sm:inline bg-[#e2e8f0] px-1.5 py-0.5 rounded text-[10px] text-[#475569] font-bold">
            v1.0.4 PRO
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 gap-4">
        {/* Brand / Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none group"
          onClick={() => onSelectTab("clutch")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a] text-[#38bdf8] border border-[#1e293b] shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Disc className="h-5 w-5 animate-spin-slow text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-[#0f172a] font-sans">
                Grip<span className="text-[#0284c7]">Lab</span>
              </span>
              <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-mono font-bold text-[#0369a1] border border-[#cbd5e1]">
                23EMEC301
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#64748b] hidden sm:block tracking-tight">
              Machine Element Design &bull; Clutches &amp; Brakes
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Precision CAD Tabstrip) */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-0.5 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
          <button
            onClick={() => onSelectTab("clutch")}
            className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "clutch"
                ? "bg-[#ffffff] text-[#0f172a] shadow-sm border border-[#cbd5e1]"
                : "text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60"
            }`}
          >
            <Layers className={`h-3.5 w-3.5 ${activeTab === "clutch" ? "text-[#0284c7]" : "text-[#64748b]"}`} />
            <span>Clutch Studio</span>
          </button>

          <button
            onClick={() => onSelectTab("block_brake")}
            className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "block_brake"
                ? "bg-[#ffffff] text-[#0f172a] shadow-sm border border-[#cbd5e1]"
                : "text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60"
            }`}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${activeTab === "block_brake" ? "text-[#0284c7]" : "text-[#64748b]"}`} />
            <span>Block Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("band_brake")}
            className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "band_brake"
                ? "bg-[#ffffff] text-[#0f172a] shadow-sm border border-[#cbd5e1]"
                : "text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60"
            }`}
          >
            <Disc className={`h-3.5 w-3.5 ${activeTab === "band_brake" ? "text-[#0284c7]" : "text-[#64748b]"}`} />
            <span>Band Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("gallery")}
            className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "gallery"
                ? "bg-[#ffffff] text-[#0f172a] shadow-sm border border-[#cbd5e1]"
                : "text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60"
            }`}
          >
            <BookOpen className={`h-3.5 w-3.5 ${activeTab === "gallery" ? "text-[#0284c7]" : "text-[#64748b]"}`} />
            <span>Problem Bank (12)</span>
          </button>

          <button
            onClick={() => onSelectTab("report")}
            className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "report"
                ? "bg-[#ffffff] text-[#0f172a] shadow-sm border border-[#cbd5e1]"
                : "text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60"
            }`}
          >
            <Printer className={`h-3.5 w-3.5 ${activeTab === "report" ? "text-[#0284c7]" : "text-[#64748b]"}`} />
            <span>Design Report</span>
          </button>
        </nav>

        {/* Right Action: AI Parameter Extractor */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm hover:border-[#0284c7]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">AI Parameter Extractor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
