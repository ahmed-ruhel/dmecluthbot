"use client";

import React, { useRef } from "react";
import { formatNum } from "@/lib/engine/units";
import { Printer, Download } from "lucide-react";

interface PrintReportProps {
  clutchResult?: any;
  blockResult?: any;
  bandResult?: any;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  clutchResult,
  blockResult,
  bandResult,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print controls (hidden in print) */}
      <div className="no-print flex items-center justify-between rounded-xl border border-slate-800 bg-[#070c16] p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Printer className="h-5 w-5 text-rose-400" />
            <span>Academic Documentation Report</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formatted for exact 2-page print / PDF — 23EMEC301 Design of Machine Elements, Component 2 Activity
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/30"
        >
          <Download className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Printable report content */}
      <div ref={reportRef} className="card-print rounded-2xl border border-slate-800 bg-[#070c16] p-8 space-y-6 font-sans text-sm">
        {/* Page 1 Header */}
        <div className="border-b-2 border-slate-700 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">GripLab — Clutch &amp; Brake Force Calculator</h1>
              <p className="text-slate-400 text-xs">
                Course: 23EMEC301 Design of Machine Elements &bull; KLE Technological University, School of Mechanical Engineering
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Component 2 — GenAI Activity, Option 4 &bull; CO3: Clutch Design &bull; CO6: Brake Design
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p className="font-mono text-slate-300">{new Date().toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}</p>
              <p className="mt-0.5">Mahadevan &amp; Reddy, 4th Edition</p>
            </div>
          </div>
        </div>

        {/* Page 1: Application Overview */}
        <section>
          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
            1. Application Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="font-semibold text-white mb-1">1.1 Purpose &amp; Scope</h3>
              <p className="text-slate-300 leading-relaxed">
                GripLab is a deterministic engineering web application that solves clutch and brake design problems
                exactly as taught in course 23EMEC301. All calculations are performed by pure TypeScript functions
                with zero AI involvement in mathematical computations. The AI (Gemini Flash) is used only for:
                (a) parsing pasted textbook problem statements into structured inputs, and (b) explaining computed results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">1.2 Supported Modules</h3>
              <ul className="text-slate-300 space-y-0.5">
                <li>• <strong>Disc Clutch Studio:</strong> Uniform Wear &amp; Uniform Pressure, Modes A–D (Capacity, Sizing, Plate Count, Force-Limited). Covers equations Eq. 13.9(a)–13.9(f), Pg 258–259.</li>
                <li>• <strong>Block Brake Studio:</strong> Short shoe, Cases 1–3 CW/CCW, equivalent μ&apos; for 2θ &gt; 60°, self-locking detection. Covers Eq. 13.6(m), 13.17(a)–(e), Pg 264–267.</li>
                <li>• <strong>Band Brake Studio:</strong> Simple (Cases d, e) and Differential band brakes, band and lever sizing. Covers Eq. 13.18(a)–(o), 13.19(a)–(f), Pg 267–270.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Page 1: Input Specification */}
        <section>
          <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
            2. Input Specification &amp; Validation Rules
          </h2>
          <div className="text-xs text-slate-300 space-y-2">
            <p><strong className="text-white">Units:</strong> All inputs in SI: mm, N, MPa (N/mm²), N·mm, rpm, kW. The app accepts arithmetic expressions (e.g., "9.55e6*8/1440").</p>
            <p><strong className="text-white">Torque conversion:</strong> T = 9.55 × 10⁶ · P[kW] / N[rpm] [N·mm], equivalently P = 2πNT/60.</p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <h4 className="font-semibold text-cyan-300 mb-1">Clutch Inputs</h4>
                <ul className="space-y-0.5 text-slate-400">
                  <li>Do, Di [mm] or ratio c = Di/Do</li>
                  <li>n1 (driving), n2 (driven)</li>
                  <li>μ: 0.05–0.80</li>
                  <li>p_allow [MPa]</li>
                  <li>T [N·m] or (P [kW], N [rpm])</li>
                  <li>FoS (Factor of Safety)</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <h4 className="font-semibold text-amber-300 mb-1">Block Brake Inputs</h4>
                <ul className="space-y-0.5 text-slate-400">
                  <li>D [mm], a, b, c [mm]</li>
                  <li>2θ [°] (default 60°)</li>
                  <li>Geometry: Case 1, 2, or 3</li>
                  <li>Rotation: CW or CCW</li>
                  <li>T [N·m] or F [N] (applied)</li>
                  <li>p_max [MPa], b&apos; [mm], t [s]</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <h4 className="font-semibold text-emerald-300 mb-1">Band Brake Inputs</h4>
                <ul className="space-y-0.5 text-slate-400">
                  <li>D [mm], θ [°], μ</li>
                  <li>a [mm], b (simple) or b1,b2 (diff.)</li>
                  <li>Ft [N] or T [N·m] or (P, N)</li>
                  <li>h [mm], b&apos; [mm], σ_band [MPa]</li>
                  <li>σ_lever [MPa], k = hl/bl</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Page break before Page 2 */}
        <div className="print-page-break" />

        {/* Page 2: Calculation Logic */}
        <section>
          <h2 className="text-base font-bold text-emerald-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
            3. Calculation Logic &amp; Design Methodology
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-white">3.1 Clutch Engine</h4>
                <p>Mode B (Sizing): For fixed Di/Do ratio c, substitutes Di = c·Do into the uniform wear torque formula and solves the cubic: <em>T_max = ½μn&apos;(π/4)p_max·Do²·c·(1–c²)</em>. For arbitrary ratios, bisection method converges in &lt;30 iterations.</p>
                <p className="mt-1">Mode C (Plate Count): Computes n&apos;_calc = 2T/(μ·Fa·Dm), rounds UP to next even integer, then recalculates actual Fa and both p_max and p_mean.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mt-2">3.2 Block Brake Engine</h4>
                <p>Applies Eq. 13.6(m) for 2θ &gt; 60°: μ&apos; = μ·[4sinθ/(2θ+sin2θ)]. Moment equations for Cases 1–3 with sign selected by rotation. Self-locking detected when c ≥ b/μ&apos;. Surface speed v = πDN/60000 [m/s]; heat H = Ft·v [W].</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-white">3.3 Band Brake Engine</h4>
                <p>Tension ratio: F1/F2 = e^(μθ), θ in radians. For differential band brakes, moment balance gives F = (F2·b2 – F1·b1)/a. Self-locking when e^(μθ) ≥ b2/b1.</p>
                <p className="mt-1">Band sizing: h = 0.005·D [Eq. 13.18(n)]; b&apos; = F1/(h·σ_d) [Eq. 13.18(o)]. Lever section: b_l = [6M/(k²σ)]^(1/3), h_l = k·b_l.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mt-2">3.4 Non-Negotiable Accuracy Guarantees</h4>
                <ul className="space-y-0.5 text-slate-400">
                  <li>• All 12 golden test cases (C1–C5, B1–B4, BB1–BB3) verified with &lt;0.5% tolerance.</li>
                  <li>• Errata ERR-1 through ERR-9 from class notes are explicitly corrected.</li>
                  <li>• Every result shows: formula, substitution, result, unit, and handbook citation.</li>
                  <li>• Warnings issued for self-locking, heat limits, and invalid material parameters.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Page 2: Results summary table */}
        <section>
          <h2 className="text-base font-bold text-purple-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
            4. Sample Results — All 12 Course Problems (Canonical Values)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-1 text-left w-10">Code</th>
                  <th className="py-1 text-left">Module</th>
                  <th className="py-1 text-right">Key Results (Canonical)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {[
                  ["C1","Disc Clutch","Do≈179.9 mm, Di≈90 mm, n'=8"],
                  ["C2","Disc Clutch","n'=4 (n1=2,n2=3), Fa≈2411 N, p_max≈0.320 MPa"],
                  ["C3","Disc Clutch","n'=12 (n1=6,n2=7), Fa≈565.9 N, p_mean≈0.032 MPa"],
                  ["C4","Disc Clutch","Wear: T=72.38 N·m | Pressure: T=98.52 N·m (+36.1%)"],
                  ["C5","Disc Clutch","T≈179.5 N·m, P≈9.40 kW (n'=2 active pairs)"],
                  ["B1","Block Brake","F_cw=1480 N, F_ccw=1720 N, H=15.71 kW, c_crit=1000 mm"],
                  ["B2","Block Brake","F_cw=1900 N, F_ccw=2100 N, c_crit=1000 mm"],
                  ["B3","Block Brake","μ'=0.385, Ft=671 N, T≈67.1 N·m (ERR-2 corrected)"],
                  ["B4","Block Brake","v=31.42 m/s, H≈61.1 kW, E≈611 kJ (ERR-1 corrected)"],
                  ["BB1","Band Brake","F1=13004 N, F2=4004 N, F_cw=533.8 N, b'=52 mm"],
                  ["BB2","Band Brake","F1=2443 N, F2=915 N, h=2.5 mm, bl=23 mm, hl=46 mm"],
                  ["BB3","Band Brake","F1=16800 N, F2≈5308 N, T≈3447 N·m, F≈702 N, NOT self-locking"],
                ].map(([code, mod, result]) => (
                  <tr key={code}>
                    <td className="py-1 font-bold text-cyan-300">{code}</td>
                    <td className="py-1 text-slate-400">{mod}</td>
                    <td className="py-1 text-right text-emerald-300">{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-500">
          <span>GripLab • 23EMEC301 DME • KLE Technological University</span>
          <span>Formulas: Mahadevan &amp; Reddy, Design Data Handbook (4th Ed.), Chapter 13</span>
          <span>Generated by Gemini (Deterministic Engine) + React/Next.js</span>
        </div>
      </div>
    </div>
  );
};
