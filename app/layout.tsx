import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "GripLab | Clutch & Brake Force Calculator (DME Sem V)",
  description:
    "Deterministic design and analysis tool for single/multi-plate clutches, block brakes, and band brakes. Full step-by-step solutions for machine element design problems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f9fa] text-[#2d2f31] antialiased selection:bg-[#a435f0]/20 selection:text-[#5624d0]">
        {children}
      </body>
    </html>
  );
}
