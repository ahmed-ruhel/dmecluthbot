"use client";

import React, { useState, useRef } from "react";
import { X, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface ParsedInputs {
  module: "clutch" | "block_brake" | "band_brake";
  inputs: Record<string, number | null>;
  confidence: number;
  notes?: string[];
  offline?: boolean;
}

interface AiParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (module: "clutch" | "block_brake" | "band_brake", inputs: Record<string, number | null>) => void;
}

export const AiParserModal: React.FC<AiParserModalProps> = ({ isOpen, onClose, onApply }) => {
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedInputs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!text.trim() && !imageBase64) {
      setError("Please paste a problem statement or upload an image.");
      return;
    }
    setLoading(true);
    setError(null);
    setParsed(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() || undefined, imageBase64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setParsed(data as ParsedInputs);
    } catch (err: any) {
      setError(err.message || "Parsing failed. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsed) return;
    onApply(parsed.module, parsed.inputs);
    onClose();
  };

  const reset = () => {
    setText("");
    setImageBase64(null);
    setImageName("");
    setParsed(null);
    setError(null);
  };

  const confidenceColor =
    !parsed ? "" :
    parsed.confidence >= 0.7 ? "text-emerald-700" :
    parsed.confidence >= 0.4 ? "text-amber-700" : "text-rose-700";

  const moduleLabels: Record<string, string> = {
    clutch: "Clutch Studio",
    block_brake: "Block Brake Studio",
    band_brake: "Band Brake Studio",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#d1d7dc] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e8eb] px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#a435f0]" />
            <h2 className="text-base font-bold text-[#2d2f31]">AI Problem Parser</h2>
            <span className="rounded bg-[#f6efff] px-2 py-0.5 text-[10px] font-mono font-bold text-[#5624d0] border border-[#d8b4fe]">
              Gemini Flash
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6a6f73] hover:bg-[#f7f9fa] hover:text-[#2d2f31] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6a6f73] leading-relaxed">
            Paste a textbook problem statement or upload a photo. The AI extracts input parameters only —
            <span className="text-[#a435f0] font-semibold"> all calculations remain 100% deterministic</span>.
            Includes offline regex fallback.
          </p>

          {/* Text input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-1.5 block">
              Problem statement (paste text)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. A multi-disc clutch transmits 8 kW at 1440 rpm. The inner and outer diameters are 80 mm and 140 mm respectively. μ = 0.1, p = 0.35 MPa. Find the number of plates."
              className="w-full h-28 rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-4 py-3 text-xs text-[#2d2f31] placeholder-[#6a6f73] focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0] resize-none transition-colors"
            />
          </div>

          {/* Image upload */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center space-x-2 rounded-md border border-[#d1d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2f31] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-[#f7f9fa] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload photo</span>
            </button>
            {imageName && (
              <span className="text-xs text-emerald-700 font-mono flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{imageName}</span>
              </span>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start space-x-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900">{error}</p>
            </div>
          )}

          {/* Results */}
          {parsed && (
            <div className="rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e6055]" />
                  <span className="text-sm font-bold text-[#2d2f31]">
                    Detected: {moduleLabels[parsed.module] ?? parsed.module}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${confidenceColor}`}>
                  Confidence: {Math.round((parsed.confidence ?? 0) * 100)}%
                </span>
              </div>

              {parsed.offline && (
                <p className="text-xs text-amber-800 italic">
                  ⚠ Offline mode: regex fallback only. Set GEMINI_API_KEY in .env.local for full parsing.
                </p>
              )}

              {/* Extracted inputs table */}
              {Object.keys(parsed.inputs).length > 0 && (
                <div className="overflow-x-auto bg-white rounded border border-[#e4e8eb] p-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#e4e8eb]">
                        <th className="text-left pb-1 text-[#6a6f73] font-mono font-semibold">Field</th>
                        <th className="text-right pb-1 text-[#6a6f73] font-mono font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(parsed.inputs)
                        .filter(([, v]) => v !== null && v !== undefined)
                        .map(([k, v]) => (
                          <tr key={k} className="border-b border-[#f7f9fa]">
                            <td className="py-1 text-[#2d2f31] font-mono">{k}</td>
                            <td className="py-1 text-right text-[#5624d0] font-mono font-bold">{v}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={reset}
              className="text-xs font-semibold text-[#6a6f73] hover:text-[#2d2f31] transition-colors"
            >
              Reset
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleParse}
                disabled={loading}
                className="flex items-center space-x-2 rounded-md bg-[#a435f0] hover:bg-[#8710d8] px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{loading ? "Parsing…" : "Parse Problem"}</span>
              </button>
              {parsed && (
                <button
                  onClick={handleApply}
                  className="flex items-center space-x-1.5 rounded-md bg-[#2d2f31] hover:bg-black px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  <span>Apply to Studio</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
