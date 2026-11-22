"use client";

import React, { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";
import { saveScenario, encodeScenarioUrl } from "@/lib/scenario";

interface ScenarioControlsProps {
  module: "clutch" | "block_brake" | "band_brake";
  inputs: Record<string, unknown>;
  summaryLine?: string;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  module,
  inputs,
  summaryLine,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleShare = () => {
    const url = encodeScenarioUrl({
      id: "",
      savedAt: "",
      module,
      label: `${module.toUpperCase()} Scenario`,
      inputs,
      summaryLine,
    });
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    saveScenario({
      module,
      label: `${module.toUpperCase()} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
      inputs,
      summaryLine,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center space-x-1.5">
      <button
        onClick={handleSave}
        title="Save this configuration to local storage"
        className="flex items-center space-x-1 rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-2.5 py-1 text-xs font-semibold text-[#2d2f31] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f7f9fa] transition-all shadow-sm"
      >
        {saved ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#1e6055]" />
            <span className="text-[#1e6055] text-[11px] font-bold">Saved!</span>
          </>
        ) : (
          <>
            <Bookmark className="h-3.5 w-3.5" />
            <span className="text-[11px]">Save</span>
          </>
        )}
      </button>

      <button
        onClick={handleShare}
        title="Copy shareable link to clipboard"
        className="flex items-center space-x-1 rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-2.5 py-1 text-xs font-semibold text-[#2d2f31] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f7f9fa] transition-all shadow-sm"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#5624d0]" />
            <span className="text-[#5624d0] text-[11px] font-bold">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Share</span>
          </>
        )}
      </button>
    </div>
  );
};
