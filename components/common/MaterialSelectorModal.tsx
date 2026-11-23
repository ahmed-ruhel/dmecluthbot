"use client";

import React, { useState, useEffect } from "react";
import materialsData from "@/data/friction-materials.json";
import { X, Search, Check, Sparkles } from "lucide-react";

interface MaterialSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mu: number, pMaxMpa: number, materialName: string) => void;
  filterCategory?: "clutch" | "brake";
}

export const MaterialSelectorModal: React.FC<MaterialSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  filterCategory,
}) => {
  const [search, setSearch] = useState("");

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = materialsData.filter((m) => {
    const matchesCategory =
      !filterCategory ||
      m.category === "clutch_and_brake" ||
      m.category === (filterCategory === "clutch" ? "clutch" : "brake");
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.notes.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-xl border border-[#d1d7dc] bg-[#ffffff] p-6 shadow-2xl animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#1c1d1f] flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#a435f0]" />
              <span>Friction Materials Library</span>
            </h3>
            <p className="text-xs text-[#6a6f73]">
              Standard Friction Pairs &bull; Mahadevan &amp; Reddy (4th Ed)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6a6f73] hover:bg-[#f7f9fa] hover:text-[#1c1d1f] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6a6f73]" />
          <input
            type="text"
            autoFocus
            placeholder="Search material pair (e.g. Bronze, Cast Iron, Asbestos, Leather)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] pl-9 pr-4 py-2 text-xs text-[#1c1d1f] placeholder-[#6a6f73] focus:border-[#a435f0] focus:bg-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#a435f0] transition-colors"
          />
        </div>

        {/* Materials list */}
        <div className="mt-4 max-h-[55vh] overflow-y-auto divide-y divide-[#e4e8eb] border border-[#e4e8eb] rounded-lg">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-[#6a6f73]">No matching materials found.</p>
          ) : (
            filtered.map((mat) => (
              <div
                key={mat.id}
                onClick={() => {
                  onSelect(mat.mu_default, mat.p_max_mpa, mat.name);
                  onClose();
                }}
                className="group flex items-center justify-between p-3.5 hover:bg-[#f6efff]/40 cursor-pointer transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#1c1d1f] group-hover:text-[#a435f0]">
                      {mat.name}
                    </span>
                    <span className="rounded bg-[#f7f9fa] border border-[#d1d7dc] px-1.5 py-0.5 text-[10px] font-mono text-[#6a6f73]">
                      {mat.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6a6f73] mt-0.5 leading-relaxed">{mat.notes}</p>
                  <span className="text-[10px] text-[#6a6f73] font-mono">Table: {mat.source_table}</span>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-[#1c1d1f]">
                    &mu; = <span className="text-[#a435f0] font-black">{mat.mu_default}</span>
                  </div>
                  <div className="text-xs font-mono text-[#6a6f73] mt-0.5">
                    p<sub>max</sub> = <span className="font-semibold text-[#1e6055]">{mat.p_max_mpa} MPa</span>
                  </div>
                  <button className="mt-1 flex items-center space-x-1 text-[11px] font-bold text-[#a435f0] group-hover:underline">
                    <Check className="h-3 w-3" />
                    <span>Select Material</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
