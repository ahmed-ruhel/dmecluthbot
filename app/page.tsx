"use client";

import React, { useState } from "react";
import { Navbar, ActiveTab } from "@/components/common/Navbar";
import { ClutchStudio } from "@/components/clutch/ClutchStudio";
import { Layers, Disc, RotateCcw, BookOpen, Printer } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("clutch");

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiModal={() => alert("AI Problem Parser will be activated in Phase 6.")}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "clutch" && <ClutchStudio />}

        {activeTab === "block_brake" && (
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-8 text-center text-slate-400">
            <RotateCcw className="mx-auto h-12 w-12 text-amber-500 mb-3 animate-spin-slow" />
            <h3 className="text-lg font-bold text-white">Block (Shoe) Brake Studio</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Ready for Phase 4 implementation: Cases 1, 2, 3 geometry selector, CW/CCW moment equilibrium, rotating drum SVG with ember heat glow, and self-locking detection.
            </p>
          </div>
        )}

        {activeTab === "band_brake" && (
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-8 text-center text-slate-400">
            <Disc className="mx-auto h-12 w-12 text-emerald-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Band Brake Studio</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Ready for Phase 4 implementation: Simple & Differential band brakes, wrap angle arc SVG, band sizing (thickness h, width b&apos;), and lever cross-section design.
            </p>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-8 text-center text-slate-400">
            <BookOpen className="mx-auto h-12 w-12 text-purple-500 mb-3" />
            <h3 className="text-lg font-bold text-white">Course Question Gallery (12 Problems)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Coming in Phase 5: 1-click loading for all review problems, Minor II questions, and ESA examination questions.
            </p>
          </div>
        )}

        {activeTab === "report" && (
          <div className="rounded-2xl border border-slate-800 bg-[#070c16] p-8 text-center text-slate-400">
            <Printer className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h3 className="text-lg font-bold text-white">Printable 2-Page Documentation Report</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Coming in Phase 7: Academic documentation report formatted for exact 2-page print & PDF submission.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 text-center text-[11px] text-slate-400">
        <p>
          GripLab &bull; 23EMEC301 Design of Machine Elements &bull; School of Mechanical Engineering, KLE Technological University
        </p>
        <p className="mt-0.5 text-slate-400">
          Formulas verified against Design Data Handbook (4th Ed) by K. Mahadevan & K. Balaveera Reddy.
        </p>
      </footer>
    </div>
  );
}
