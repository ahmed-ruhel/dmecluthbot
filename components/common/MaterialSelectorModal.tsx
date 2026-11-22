"use client";

import React, { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>Handbook Friction Materials Library</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tables 13.4, 13.8 & 13.11 &bull; K. Mahadevan & K. Balaveera Reddy (4th Ed)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search material by name or application..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Material Items List */}
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              onClick={() => {
                onSelect(mat.mu_default, mat.p_max_mpa, mat.name);
                onClose();
              }}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-cyan-600/50 hover:bg-slate-800/40 cursor-pointer transition-all"
            >
              <div>
                <h4 className="text-xs font-semibold text-slate-100">{mat.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{mat.notes}</p>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 inline-block">
                  {mat.source_table}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-right shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">
                    &mu; = {mat.mu_default}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    p &le; {mat.p_max_mpa} MPa
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-800 text-cyan-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching friction materials found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
