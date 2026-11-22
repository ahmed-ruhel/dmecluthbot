// Course Gallery: all 12 problems from lectures, Minor II, and ESA
// Each entry maps to a module + pre-filled inputs to demonstrate 1-click preset loading

export interface GalleryProblem {
  id: string;
  code: string; // e.g. "C1"
  title: string;
  source: string; // e.g. "ESA Q4a / Class Notes P1"
  module: "clutch" | "block_brake" | "band_brake";
  description: string;
  keyResults: string; // Expected canonical values
}

export const GALLERY_PROBLEMS: GalleryProblem[] = [
  {
    id: "C1",
    code: "C1",
    title: "Multi-Disc Clutch Sizing (Do, Di)",
    source: "ESA Q4a / Class Notes P1",
    module: "clutch",
    description: "5 steel + 4 bronze discs, T=240 N·m, FoS=2.5, p=0.35 MPa, μ=0.25, Di/Do=0.5. Find outer and inner diameters.",
    keyResults: "Do ≈ 179.9 mm, Di ≈ 90 mm, n' = 8",
  },
  {
    id: "C2",
    code: "C2",
    title: "Multi-Disc Clutch Plate Count",
    source: "Minor II Q1a / Class Notes P2",
    module: "clutch",
    description: "8 kW at 1440 rpm; Di=80 mm, Do=140 mm; μ=0.1 (in oil); p=0.35 MPa. Find n', n1, n2, Fa, p_max.",
    keyResults: "n'=4 (n1=2, n2=3), Fa≈2411 N, p_max≈0.320 MPa",
  },
  {
    id: "C3",
    code: "C3",
    title: "Force-Limited Multi-Disc Clutch",
    source: "ESA Q6a / Class Notes P3",
    module: "clutch",
    description: "Do=250 mm, b=0.2Ro → Di=200 mm, 60 kW at 3000 rpm, μ=0.25, Fa ≤ 600 N. Find n', n1, n2, Fa, p_max, p_mean.",
    keyResults: "n'=12 (n1=6, n2=7), Fa≈565.9 N, p_max≈0.036 MPa, p_mean≈0.032 MPa",
  },
  {
    id: "C4",
    code: "C4",
    title: "Wear vs. Pressure Theory Comparison",
    source: "Class Notes P4",
    module: "clutch",
    description: "n1=2, n2=3; p=0.1 MPa, μ=0.15, Do=200 mm, Di=120 mm, 1000 rpm. Compare uniform wear and uniform pressure.",
    keyResults: "Wear: T=72.38 N·m, P=7.58 kW | Pressure: T=98.52 N·m, P=10.32 kW (+36.1%)",
  },
  {
    id: "C5",
    code: "C5",
    title: "Multi-Disc Clutch Power Capacity",
    source: "Minor II Q3b",
    module: "clutch",
    description: "5 plates (n'=4), p=0.127 MPa, Ro=125 mm, Ri=75 mm, 500 rpm, μ=0.3. Find power transmitted.",
    keyResults: "T≈179.5 N·m, P≈9.40 kW",
  },
  {
    id: "B1",
    code: "B1",
    title: "Block Brake — Case 2 Self-Energizing Check",
    source: "Class Notes P1",
    module: "block_brake",
    description: "D=500 mm, a=b=250 mm, c=75 mm, T=200 N·m, N=750 rpm, μ=0.25, 2θ=60°. Find F_cw, F_ccw, v, H.",
    keyResults: "F_cw=1480 N, F_ccw=1720 N, H=15.71 kW, c_crit=1000 mm",
  },
  {
    id: "B2",
    code: "B2",
    title: "Block Brake — Case 2 Larger Lever",
    source: "Class Notes P2",
    module: "block_brake",
    description: "D=500 mm, a=750 mm, b=250 mm, c=50 mm, T=500 N·m, μ=0.25. Find operating forces CW and CCW.",
    keyResults: "F_cw=1900 N, F_ccw=2100 N, c_crit=1000 mm",
  },
  {
    id: "B3",
    code: "B3",
    title: "Block Brake — Case 3 CCW (ERR-2 Errata Example)",
    source: "Class Notes P3",
    module: "block_brake",
    description: "D=200 mm, 2θ=90°, a=250, b=200, c=50, μ=0.35, F=700 N CCW. Find Ft, Fn, braking torque.",
    keyResults: "μ'=0.385, Ft≈671 N, Fn≈1743 N, T≈67.1 N·m (notes had sign error)",
  },
  {
    id: "B4",
    code: "B4",
    title: "Block Brake — Case 1 Allowable Pressure + Energy (ERR-1 Errata)",
    source: "Class Notes P4",
    module: "block_brake",
    description: "D=400 mm, 2θ=90°, p=0.5 MPa, b'=50, N=1500 rpm, t=10 s. Find T, v, H, E (notes had v=3.14 m/s error).",
    keyResults: "v=31.42 m/s, H≈61.1 kW, E≈611 kJ in 10s",
  },
  {
    id: "BB1",
    code: "BB1",
    title: "Simple Band Brake — Case e",
    source: "Class Notes P1",
    module: "band_brake",
    description: "D=600 mm, θ=270°, μ=0.25, h=5 mm, Ft=9000 N, b=200 mm, a=1500 mm, σ=50 MPa. Find F1, F2, F_cw, F_ccw, b'.",
    keyResults: "F1≈13004 N, F2≈4004 N, F_cw≈533.8 N, F_ccw≈1733.8 N, b'≈52 mm",
  },
  {
    id: "BB2",
    code: "BB2",
    title: "Simple Band Brake with Lever Design",
    source: "Class Notes P2",
    module: "band_brake",
    description: "30 kW at 750 rpm, D=500 mm, θ=225°, μ=0.25, b=250, a=1000, b'=10h, σ_lever=80 MPa. Find F1, F2, h, b', lever section.",
    keyResults: "F1≈2443 N, F2≈915 N, h=2.5 mm, b'=25 mm, bl≈23 mm, hl≈46 mm",
  },
  {
    id: "BB3",
    code: "BB3",
    title: "Differential Band Brake — Self-Locking Analysis",
    source: "ESA Q5b / Review Q5",
    module: "band_brake",
    description: "D=600 mm, θ=300°, μ=0.22, b1=38, b2=150, h=3, b'=100, σ=56 MPa. Find T, F, self-locking status.",
    keyResults: "F1=16800 N, F2≈5308 N, T≈3447 N·m, F≈702.3 N, NOT self-locking (e^μθ=3.164 < b2/b1=3.947)",
  },
];
