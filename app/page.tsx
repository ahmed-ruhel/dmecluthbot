"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar, ActiveTab } from "@/components/common/Navbar";
import { ClutchStudio } from "@/components/clutch/ClutchStudio";
import { BlockBrakeStudio } from "@/components/brake/BlockBrakeStudio";
import { BandBrakeStudio } from "@/components/brake/BandBrakeStudio";
import { CourseGallery } from "@/components/gallery/CourseGallery";
import { PrintReport } from "@/components/report/PrintReport";
import { AiParserModal } from "@/components/common/AiParserModal";
import { extractScenarioFromUrl } from "@/lib/scenario";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("clutch");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Preset triggers — a string token that changes causes the studio useEffect to fire
  const [clutchPreset, setClutchPreset] = useState<string | undefined>(undefined);
  const [blockPreset, setBlockPreset] = useState<string | undefined>(undefined);
  const [bandPreset, setBandPreset] = useState<string | undefined>(undefined);

  // AI-parsed inputs to inject (optional — studios can consume in future iteration)
  const [aiInputs, setAiInputs] = useState<Record<string, unknown> | null>(null);

  // On mount: check for ?scenario= URL param and restore session
  useEffect(() => {
    const scenario = extractScenarioFromUrl();
    if (scenario) {
      setActiveTab(scenario.module as ActiveTab);
      // Trigger the matching studio's preset if the scenario carries a code
      if (scenario.inputs && (scenario.inputs as any).__presetCode) {
        const code = (scenario.inputs as any).__presetCode as string;
        if (["C1","C2","C3","C4","C5"].includes(code)) setClutchPreset(code + "_" + Date.now());
        if (["B1","B2","B3","B4"].includes(code)) setBlockPreset(code + "_" + Date.now());
        if (["BB1","BB2","BB3"].includes(code)) setBandPreset(code + "_" + Date.now());
      }
    }
  }, []);

  /** Called by CourseGallery when user clicks a problem card. */
  const handleSelectProblem = useCallback(
    (module: "clutch" | "block_brake" | "band_brake", presetCode: string) => {
      setActiveTab(module);
      // Append timestamp so the same preset can be re-triggered
      const token = presetCode + "_" + Date.now();
      if (module === "clutch") setClutchPreset(token);
      if (module === "block_brake") setBlockPreset(token);
      if (module === "band_brake") setBandPreset(token);
    },
    []
  );

  /** Called by AiParserModal when "Apply to Studio" is clicked. */
  const handleApplyAi = useCallback(
    (module: "clutch" | "block_brake" | "band_brake", inputs: Record<string, number | null>) => {
      setActiveTab(module);
      setAiInputs(inputs);
      // Studios will need to be enhanced to consume aiInputs in a future iteration.
      // For now, store in state so it's accessible to the active studio.
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "clutch" && (
          <ClutchStudio
            triggerPreset={clutchPreset}
          />
        )}

        {activeTab === "block_brake" && (
          <BlockBrakeStudio
            triggerPreset={blockPreset}
          />
        )}

        {activeTab === "band_brake" && (
          <BandBrakeStudio
            triggerPreset={bandPreset}
          />
        )}

        {activeTab === "gallery" && (
          <CourseGallery onSelectProblem={handleSelectProblem} />
        )}

        {activeTab === "report" && (
          <PrintReport />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 text-center text-[11px] text-slate-400">
        <p>
          GripLab &bull; 23EMEC301 Design of Machine Elements &bull; School of Mechanical Engineering, KLE Technological University
        </p>
        <p className="mt-0.5 text-slate-400">
          Formulas verified against Design Data Handbook (4th Ed) by K. Mahadevan &amp; K. Balaveera Reddy.
        </p>
      </footer>

      {/* AI Parser Modal (Phase 6) */}
      <AiParserModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleApplyAi}
      />
    </div>
  );
}
