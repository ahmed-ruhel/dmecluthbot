"use client";

import React from "react";
import { Disc, Layers, Printer, Sparkles, BookOpen, RotateCcw } from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#d1d7dc] shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Brand / Logo (Udemy style with purple icon & bold black text) */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none group"
          onClick={() => onSelectTab("clutch")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a435f0] text-white shadow-md shadow-[#a435f0]/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#a435f0]/40 group-active:scale-95">
            <Disc className="h-6 w-6 animate-spin-slow text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-[#1c1d1f] font-sans group-hover:text-[#a435f0] transition-colors">
                Grip<span className="text-[#a435f0]">Lab</span>
              </span>
            </div>
            <p className="text-xs font-medium text-[#6a6f73] hidden sm:block">
              Clutch &amp; Brake Force Calculator
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Smooth Hover & Underline Transitions) */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab("clutch")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-bold transition-all duration-200 border-b-2 hover:-translate-y-0.5 ${
              activeTab === "clutch"
                ? "border-[#1c1d1f] text-[#1c1d1f] font-black"
                : "border-transparent text-[#6a6f73] hover:text-[#1c1d1f] hover:border-[#d1d7dc]"
            }`}
          >
            <Layers className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === "clutch" ? "text-[#a435f0]" : "text-[#6a6f73]"}`} />
            <span>Clutch Studio</span>
          </button>

          <button
            onClick={() => onSelectTab("block_brake")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-bold transition-all duration-200 border-b-2 hover:-translate-y-0.5 ${
              activeTab === "block_brake"
                ? "border-[#1c1d1f] text-[#1c1d1f] font-black"
                : "border-transparent text-[#6a6f73] hover:text-[#1c1d1f] hover:border-[#d1d7dc]"
            }`}
          >
            <RotateCcw className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === "block_brake" ? "text-[#a435f0]" : "text-[#6a6f73]"}`} />
            <span>Block Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("band_brake")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-bold transition-all duration-200 border-b-2 hover:-translate-y-0.5 ${
              activeTab === "band_brake"
                ? "border-[#1c1d1f] text-[#1c1d1f] font-black"
                : "border-transparent text-[#6a6f73] hover:text-[#1c1d1f] hover:border-[#d1d7dc]"
            }`}
          >
            <Disc className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === "band_brake" ? "text-[#a435f0]" : "text-[#6a6f73]"}`} />
            <span>Band Brake</span>
          </button>

          <button
            onClick={() => onSelectTab("gallery")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-bold transition-all duration-200 border-b-2 hover:-translate-y-0.5 ${
              activeTab === "gallery"
                ? "border-[#1c1d1f] text-[#1c1d1f] font-black"
                : "border-transparent text-[#6a6f73] hover:text-[#1c1d1f] hover:border-[#d1d7dc]"
            }`}
          >
            <BookOpen className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === "gallery" ? "text-[#a435f0]" : "text-[#6a6f73]"}`} />
            <span>Explore Courses (12)</span>
          </button>

          <button
            onClick={() => onSelectTab("report")}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-bold transition-all duration-200 border-b-2 hover:-translate-y-0.5 ${
              activeTab === "report"
                ? "border-[#1c1d1f] text-[#1c1d1f] font-black"
                : "border-transparent text-[#6a6f73] hover:text-[#1c1d1f] hover:border-[#d1d7dc]"
            }`}
          >
            <Printer className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === "report" ? "text-[#a435f0]" : "text-[#6a6f73]"}`} />
            <span>2-Page Report</span>
          </button>
        </nav>

        {/* Right Actions: AI Parser (Udemy Purple Button with Micro-Interaction) */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-2 rounded-lg bg-[#a435f0] hover:bg-[#8710d8] active:scale-95 px-4 py-2 text-xs sm:text-sm font-black text-white transition-all duration-200 shadow-md shadow-[#a435f0]/20 hover:shadow-lg hover:shadow-[#a435f0]/30 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
            <span className="hidden sm:inline">AI Problem Autofill</span>
          </button>
        </div>
      </div>
    </header>
  );
};
