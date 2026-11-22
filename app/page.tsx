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

  // Preset triggers — token change triggers studio useEffect
  const [clutchPreset, setClutchPreset] = useState<string | undefined>(undefined);
  const [blockPreset, setBlockPreset] = useState<string | undefined>(undefined);
  const [bandPreset, setBandPreset] = useState<string | undefined>(undefined);

  // AI-parsed inputs
  const [aiInputs, setAiInputs] = useState<Record<string, unknown> | null>(null);

  // On mount: check for ?scenario= URL param and restore session
  useEffect(() => {
    const scenario = extractScenarioFromUrl();
    if (scenario) {
      setActiveTab(scenario.module as ActiveTab);
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
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-[#2d2f31] flex flex-col font-sans">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area: Fluid Edge-to-Edge (unwanted extreme left/right margins removed) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5">
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
      <footer className="border-t border-[#d1d7dc] bg-white py-4 text-center text-xs text-[#6a6f73]">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-[#2d2f31]">
            GripLab &bull; 23EMEC301 Design of Machine Elements &bull; School of Mechanical Engineering, KLE Technological University
          </p>
          <p className="text-[11px] text-[#6a6f73]">
            Verified against Design Data Handbook (4th Ed) by K. Mahadevan &amp; K. Balaveera Reddy.
          </p>
        </div>
      </footer>

      {/* AI Parser Modal */}
      <AiParserModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleApplyAi}
      />
    </div>
  );
}
