"use client";

import React, { useState, useRef, useEffect } from "react";
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

  // Lock body scroll and handle Escape key
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-xl border border-[#d1d7dc] bg-[#ffffff] shadow-2xl p-6 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e8eb] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6efff] text-[#5624d0]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#1c1d1f]">AI Problem Parser</h2>
              <p className="text-xs text-[#6a6f73]">Paste any textbook question or exam problem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6a6f73] hover:bg-[#f7f9fa] hover:text-[#1c1d1f] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#6a6f73] leading-relaxed">
            Paste your problem statement. The parser automatically extracts all numerical parameters and maps them to the appropriate studio inputs —
            <strong className="text-[#a435f0]"> all math is solved 100% deterministically</strong>.
          </p>

          {/* Quick Example Loaders */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#6a6f73] mr-1">Try Samples:</span>
            <button
              type="button"
              onClick={() => setText("A multi-disc clutch transmits 8 kW at 1440 rpm. The inner and outer diameters are 80 mm and 140 mm respectively. μ = 0.1, allowable pressure is 0.35 MPa. Find the required number of plates.")}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#f7f9fa] border border-[#d1d7dc] text-[#5624d0] hover:bg-[#f6efff] transition-colors"
            >
              Clutch (8 kW, 1440 rpm)
            </button>
            <button
              type="button"
              onClick={() => setText("A single block brake has a drum diameter of 200 mm with contact angle 90 degrees. The lever arms are a = 250 mm, b = 200 mm, offset c = 50 mm. An operating force of 700 N is applied in CCW rotation with μ = 0.35. Find braking torque.")}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#f7f9fa] border border-[#d1d7dc] text-[#5624d0] hover:bg-[#f6efff] transition-colors"
            >
              Block Brake (700 N effort)
            </button>
            <button
              type="button"
              onClick={() => setText("A differential band brake has drum diameter 600 mm, wrap angle 300 degrees, lever arm a = 225 mm, b1 = 38 mm, b2 = 150 mm. Band thickness 3 mm, width 100 mm, allowable stress 56 MPa, μ = 0.22. Determine torque and operating force.")}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#f7f9fa] border border-[#d1d7dc] text-[#5624d0] hover:bg-[#f6efff] transition-colors"
            >
              Differential Band (BB3)
            </button>
          </div>

          {/* Text input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-1.5 block">
              Problem statement text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your problem here (e.g. A multi-disc clutch transmits 60 kW at 2000 rpm...)"
              className="w-full h-28 rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-4 py-3 text-xs text-[#1c1d1f] placeholder-[#6a6f73] focus:border-[#a435f0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a435f0] resize-none transition-colors"
            />
          </div>

          {/* Image upload */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center space-x-2 rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-1.5 text-xs font-semibold text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-white transition-all shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload photo / scan</span>
            </button>
            {imageName && (
              <span className="text-xs text-emerald-700 font-mono flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{imageName}</span>
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start space-x-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed result card */}
          {parsed && (
            <div className="rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1c1d1f]">
                  Detected Module:{" "}
                  <span className="text-[#a435f0] font-black">{moduleLabels[parsed.module]}</span>
                </span>
                <span className={`text-xs font-mono font-bold ${confidenceColor}`}>
                  Confidence: {Math.round(parsed.confidence * 100)}%
                </span>
              </div>

              {/* Extracted parameters */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6a6f73] mb-1.5">
                  Extracted Parameters
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(parsed.inputs)
                    .filter(([, v]) => v !== null && v !== undefined)
                    .map(([k, v]) => (
                      <div key={k} className="rounded bg-white border border-[#d1d7dc] px-2.5 py-1 text-xs">
                        <span className="text-[#6a6f73] font-mono text-[10px]">{k}: </span>
                        <span className="font-bold text-[#1c1d1f] font-mono">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {parsed.notes && parsed.notes.length > 0 && (
                <div className="border-t border-[#e4e8eb] pt-2 text-[11px] text-[#6a6f73]">
                  {parsed.notes.map((n, i) => (
                    <p key={i}>• {n}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e4e8eb]">
            <button
              type="button"
              onClick={reset}
              className="text-xs text-[#6a6f73] hover:text-[#1c1d1f] underline"
            >
              Reset
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleParse}
                disabled={loading}
                className="flex items-center space-x-1.5 rounded-lg bg-[#f7f9fa] border border-[#d1d7dc] px-4 py-2 text-xs font-bold text-[#1c1d1f] hover:border-[#a435f0] hover:text-[#a435f0] hover:bg-white disabled:opacity-50 transition-all shadow-sm"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "Parsing..." : "Extract Parameters"}</span>
              </button>

              {parsed && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center space-x-1.5 rounded-lg bg-[#a435f0] px-4 py-2 text-xs font-bold text-white hover:bg-[#8710d8] transition-all shadow-md shadow-[#a435f0]/20"
                >
                  <span>Apply &amp; Solve</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
