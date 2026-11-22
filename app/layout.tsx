import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "GripLab | Clutch & Brake Force Calculator (DME Sem V)",
  description:
    "Deterministic design and analysis tool for single/multi-plate clutches, block brakes, and band brakes per KLE Tech 23EMEC301 and Mahadevan & Reddy Design Data Handbook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
