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
      // Strip the data URL prefix → keep only the base64 portion
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
    parsed.confidence >= 0.7 ? "text-emerald-400" :
    parsed.confidence >= 0.4 ? "text-amber-400" : "text-rose-400";

  const moduleLabels: Record<string, string> = {
    clutch: "Clutch Studio",
    block_brake: "Block Brake Studio",
    band_brake: "Band Brake Studio",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1526] shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">AI Problem Parser</h2>
            <span className="rounded bg-violet-950 px-2 py-0.5 text-[10px] font-mono font-semibold text-violet-300 border border-violet-800/60">
              Gemini-powered
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Notice */}
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste a textbook problem statement or upload a photo. The AI will extract input parameters only —
            <span className="text-cyan-400 font-semibold"> all calculations remain fully deterministic</span>.
            Works offline (regex fallback) without an API key.
          </p>

          {/* Text input */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 block">
              Problem statement (paste text)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. A multi-disc clutch transmits 8 kW at 1440 rpm. The inner and outer diameters are 80 mm and 140 mm respectively. μ = 0.1, p = 0.35 MPa. Find the number of plates."
              className="w-full h-28 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none transition-colors"
            />
          </div>

          {/* Image upload */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:border-violet-500 hover:bg-violet-950/40 hover:text-violet-300 transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload photo</span>
            </button>
            {imageName && (
              <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{imageName}</span>
              </span>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start space-x-2 rounded-lg border border-rose-800/60 bg-rose-950/40 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          {/* Results */}
          {parsed && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    Detected: {moduleLabels[parsed.module] ?? parsed.module}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${confidenceColor}`}>
                  Confidence: {Math.round((parsed.confidence ?? 0) * 100)}%
                </span>
              </div>

              {parsed.offline && (
                <p className="text-xs text-amber-400 italic">
                  ⚠ Offline mode: regex fallback only. Set GEMINI_API_KEY in .env.local for full parsing.
                </p>
              )}

              {parsed.notes && parsed.notes.length > 0 && (
                <ul className="space-y-1">
                  {parsed.notes.map((n, i) => (
                    <li key={i} className="text-[11px] text-slate-400 flex items-start space-x-1">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Extracted inputs table */}
              {Object.keys(parsed.inputs).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left pb-1.5 text-slate-400 font-mono font-normal">Field</th>
                        <th className="text-right pb-1.5 text-slate-400 font-mono font-normal">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(parsed.inputs)
                        .filter(([, v]) => v !== null && v !== undefined)
                        .map(([k, v]) => (
                          <tr key={k} className="border-b border-slate-800/50">
                            <td className="py-1 text-slate-300 font-mono">{k}</td>
                            <td className="py-1 text-right text-cyan-300 font-mono font-semibold">{v}</td>
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
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleParse}
                disabled={loading}
                className="flex items-center space-x-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{loading ? "Parsing…" : "Parse Problem"}</span>
              </button>
              {parsed && (
                <button
                  onClick={handleApply}
                  className="flex items-center space-x-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors shadow-md shadow-cyan-600/30"
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
