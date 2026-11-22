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
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20">
            <Disc className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">GripLab</span>
              <span className="rounded-md bg-cyan-950/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-800/50">
                23EMEC301
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Clutch & Brake Force Calculator &bull; Sem V DME
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => onSelectTab("clutch")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "clutch"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Clutch Studio</span>
          </button>

          <button
            onClick={() => onSelectTab("block_brake")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "block_brake"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Block Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("band_brake")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "band_brake"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Disc className="h-3.5 w-3.5" />
            <span>Band Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("gallery")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "gallery"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Course Gallery (12)</span>
          </button>

          <button
            onClick={() => onSelectTab("report")}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "report"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>2-Page Report</span>
          </button>
        </nav>

        {/* Right Action: AI Parse & Status */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-900/60 hover:text-white transition-all shadow-sm shadow-purple-500/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Problem Autofill</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pure Deterministic Math</span>
          </div>
        </div>
      </div>
    </header>
  );
};
