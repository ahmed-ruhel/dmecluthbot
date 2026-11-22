import { CalculationResult, EngineWarning, StepDetail, BandBrakeType, SimpleBandCase, RotationDirection } from "./types";
import { powerToTorque, torqueToTangentialForce, rubbingVelocity } from "./units";

export interface BandBrakeInput {
  brakeType: BandBrakeType; // "simple" | "differential"
  simpleCase?: SimpleBandCase; // "case_d" | "case_e" (for simple band)
  rotation?: RotationDirection; // "cw" | "ccw"
  D: number; // Drum diameter (mm)
  theta_deg: number; // Wrap angle in degrees
  mu: number; // Friction coefficient

  // Operating lever arms
  a: number; // Lever effort arm (mm)
  b?: number; // Single arm for simple band (mm)
  b1?: number; // Shorter/tight arm for differential band (mm)
  b2?: number; // Longer/slack arm for differential band (mm)

  // Operating load (provide at least one)
  T_Nm?: number; // Braking torque (N·m)
  P_kW?: number; // Power (kW)
  N_rpm?: number; // Speed (rpm)
  Ft?: number; // Tangential force (N)
  sigma_d_band?: number; // Permissible tensile stress of band (MPa)
  
  // Band sizing parameters
  h?: number; // Band thickness (mm)
  b_prime?: number; // Band width (mm)
  band_width_ratio?: number; // e.g. b'/h = 10

  // Lever design parameters
  sigma_lever?: number; // Permissible bending stress of lever (MPa)
  lever_depth_ratio_k?: number; // hl / bl ratio, default = 2
}

export interface BandBrakeSummary {
  brakeType: BandBrakeType;
  simpleCase?: SimpleBandCase;
  rotation?: RotationDirection;
  D: number;
  r: number;
  theta_rad: number;
  exp_mu_theta: number;
  Ft: number;
  T_Nm: number;
  F1: number; // Tight side tension (N)
  F2: number; // Slack side tension (N)
  F_cw: number; // Operating force CW (N)
  F_ccw: number; // Operating force CCW (N)
  F_operating: number; // For active rotation or least force (N)
  h: number; // Band thickness (mm)
  b_prime: number; // Band width (mm)
  p_avg: number; // Average bearing pressure (MPa)
  p1: number; // Maximum bearing pressure at tight side (MPa)
  p2: number; // Minimum bearing pressure at slack side (MPa)
  isSelfLocking: boolean;
  selfLockingRatio?: number;
  lever_bl?: number; // Lever width (mm)
  lever_hl?: number; // Lever depth (mm)
  M_lever?: number; // Bending moment on lever (N·mm)
  v?: number; // Surface speed (m/s)
  H_kW?: number; // Heat rate (kW)
}

export function calculateBandBrake(input: BandBrakeInput): CalculationResult<BandBrakeSummary> {
  const steps: StepDetail[] = [];
  const warnings: EngineWarning[] = [];
  let stepNum = 1;

  const D = input.D;
  const r = D / 2;
  const mu = input.mu;
  const theta_rad = (input.theta_deg * Math.PI) / 180;
  const a = input.a;
  const brakeType = input.brakeType || "simple";
  const simpleCase = input.simpleCase || "case_e";
  const rotation = input.rotation || "cw";

  if (D <= 0 || a <= 0 || mu <= 0 || input.theta_deg <= 0) {
    throw new Error("Drum diameter, lever length, friction, and wrap angle must be positive.");
  }

  if (input.theta_deg > 360) {
    warnings.push({
      code: "WRAP_ANGLE_OVER_360",
      severity: "info",
      message: `Wrap angle \u03b8 = ${input.theta_deg}\u00b0 exceeds 360\u00b0 (multiple wraps).`,
      recommendation: "Ensure multiple band wraps are structurally supported.",
    });
  }

  // Step 1: Wrap Angle & Tension Ratio e^(mu * theta)
  const exp_mu_theta = Math.exp(mu * theta_rad);
  steps.push({
    stepNumber: stepNum++,
    title: "Wrap Angle and Tension Ratio",
    formulaLatex: "\\frac{F_1}{F_2} = e^{\\mu \\theta}",
    substitutionLatex: `\\frac{F_1}{F_2} = e^{${mu.toFixed(2)} \\times ${theta_rad.toFixed(4)}} = e^{${(mu * theta_rad).toFixed(4)}}`,
    resultLatex: `\\frac{F_1}{F_2} = ${exp_mu_theta.toFixed(4)}`,
    value: Number(exp_mu_theta.toFixed(4)),
    unit: "ratio",
    citation: "Eq. 13.18(a), Page 267",
    notes: `Wrap angle \u03b8 = ${input.theta_deg}\u00b0 = ${theta_rad.toFixed(4)} rad.`,
  });

  // Step 2: Determine T, Ft, F1, F2
  let T_Nm = input.T_Nm;
  let Ft = input.Ft;
  let F1 = 0;
  let F2 = 0;

  if (input.P_kW !== undefined && input.N_rpm !== undefined && input.N_rpm > 0) {
    const tNmm = powerToTorque(input.P_kW, input.N_rpm);
    T_Nm = tNmm / 1000;
    steps.push({
      stepNumber: stepNum++,
      title: "Braking Torque from Power",
      formulaLatex: "T = \\frac{9.55 \\times 10^6 \\cdot P}{N}",
      substitutionLatex: `T = \\frac{9.55 \\times 10^6 \\times ${input.P_kW}}{${input.N_rpm}}`,
      resultLatex: `T = ${T_Nm.toFixed(2)}\\text{ N}\\cdot\\text{m}`,
      value: Number(T_Nm.toFixed(2)),
      unit: "N·m",
      citation: "Class Notes / Eq 13.9",
    });
  }

  // Check if F1 is governed by allowable band stress (like in BB3)
  if (input.sigma_d_band && input.h && input.b_prime && !T_Nm && !Ft) {
    F1 = input.sigma_d_band * input.h * input.b_prime;
    F2 = F1 / exp_mu_theta;
    Ft = F1 - F2;
    T_Nm = (Ft * r) / 1000;

    steps.push({
      stepNumber: stepNum++,
      title: "Maximum Permissible Band Tension",
      formulaLatex: "F_1 = \\sigma_d \\cdot (h \\cdot b')",
      substitutionLatex: `F_1 = ${input.sigma_d_band} \\times (${input.h} \\times ${input.b_prime})`,
      resultLatex: `F_1 = ${F1.toFixed(1)}\\text{ N}`,
      value: Number(F1.toFixed(1)),
      unit: "N",
      citation: "Eq. 13.18(o), Page 268",
    });

    steps.push({
      stepNumber: stepNum++,
      title: "Slack Side Tension & Tangential Force",
      formulaLatex: "F_2 = \\frac{F_1}{e^{\\mu \\theta}}, \\quad F_t = F_1 - F_2",
      substitutionLatex: `F_2 = \\frac{${F1.toFixed(1)}}{${exp_mu_theta.toFixed(4)}} = ${F2.toFixed(1)}\\text{ N}, \\quad F_t = ${F1.toFixed(1)} - ${F2.toFixed(1)}`,
      resultLatex: `F_t = ${Ft.toFixed(1)}\\text{ N}, \\quad F_2 = ${F2.toFixed(1)}\\text{ N}`,
      value: Number(Ft.toFixed(1)),
      unit: "N",
      citation: "Eq. 13.18(b),(c), Page 267",
    });

    steps.push({
      stepNumber: stepNum++,
      title: "Braking Torque on Shaft",
      formulaLatex: "T = F_t \\cdot r",
      substitutionLatex: `T = ${Ft.toFixed(1)} \\times ${r} = ${(Ft * r).toFixed(1)}\\text{ N}\\cdot\\text{mm}`,
      resultLatex: `T = ${T_Nm.toFixed(2)}\\text{ N}\\cdot\\text{m}`,
      value: Number(T_Nm.toFixed(2)),
      unit: "N·m",
      citation: "Eq. 13.18(e), Page 267",
    });
  } else {
    // Normal case: Ft or T_Nm is known
    if (Ft === undefined) {
      if (T_Nm === undefined) {
        throw new Error("Must provide either T_Nm, (P_kW, N_rpm), Ft, or (sigma_d_band, h, b_prime).");
      }
      Ft = torqueToTangentialForce(T_Nm * 1000, r);
    } else {
      T_Nm = (Ft * r) / 1000;
    }

    steps.push({
      stepNumber: stepNum++,
      title: "Tangential Braking Force",
      formulaLatex: "F_t = \\frac{T}{r} = \\frac{2 T}{D}",
      substitutionLatex: `F_t = \\frac{${(T_Nm * 1000).toFixed(0)}}{${r}}`,
      resultLatex: `F_t = ${Ft.toFixed(1)}\\text{ N}`,
      value: Number(Ft.toFixed(1)),
      unit: "N",
      citation: "Eq. 13.18(e), Page 267",
    });

    F1 = Ft * (exp_mu_theta / (exp_mu_theta - 1));
    F2 = Ft / (exp_mu_theta - 1);

    steps.push({
      stepNumber: stepNum++,
      title: "Tight Side Tension (F1)",
      formulaLatex: "F_1 = F_t \\left[ \\frac{e^{\\mu \\theta}}{e^{\\mu \\theta} - 1} \\right]",
      substitutionLatex: `F_1 = ${Ft.toFixed(1)} \\times \\left[ \\frac{${exp_mu_theta.toFixed(4)}}{${(exp_mu_theta - 1).toFixed(4)}} \\right]`,
      resultLatex: `F_1 = ${F1.toFixed(1)}\\text{ N}`,
      value: Number(F1.toFixed(1)),
      unit: "N",
      citation: "Eq. 13.18(c), Page 267",
    });

    steps.push({
      stepNumber: stepNum++,
      title: "Slack Side Tension (F2)",
      formulaLatex: "F_2 = F_t \\left[ \\frac{1}{e^{\\mu \\theta} - 1} \\right]",
      substitutionLatex: `F_2 = ${Ft.toFixed(1)} \\times \\left[ \\frac{1}{${(exp_mu_theta - 1).toFixed(4)}} \\right]`,
      resultLatex: `F_2 = ${F2.toFixed(1)}\\text{ N}`,
      value: Number(F2.toFixed(1)),
      unit: "N",
      citation: "Eq. 13.18(d), Page 267",
    });
  }

  // Step 3: Operating Force on Lever
  let F_cw = 0;
  let F_ccw = 0;
  let isSelfLocking = false;
  let selfLockingRatio: number | undefined;

  if (brakeType === "simple") {
    const b = input.b ?? 200;
    if (simpleCase === "case_e") {
      // Case e: fulcrum has slack end for CW, tight end for CCW
      // CW: F * a = F2 * b => F_cw = F2 * (b/a)
      // CCW: F * a = F1 * b => F_ccw = F1 * (b/a)
      F_cw = (F2 * b) / a;
      F_ccw = (F1 * b) / a;

      steps.push({
        stepNumber: stepNum++,
        title: "Operating Force (Simple Band Case e)",
        formulaLatex: "F_{\\text{cw}} = F_2 \\frac{b}{a}, \\quad F_{\\text{ccw}} = F_1 \\frac{b}{a}",
        substitutionLatex: `F_{\\text{cw}} = ${F2.toFixed(1)} \\times \\frac{${b}}{${a}}, \\quad F_{\\text{ccw}} = ${F1.toFixed(1)} \\times \\frac{${b}}{${a}}`,
        resultLatex: `F_{\\text{cw}} = ${F_cw.toFixed(1)}\\text{ N}, \\quad F_{\\text{ccw}} = ${F_ccw.toFixed(1)}\\text{ N}`,
        value: rotation === "cw" ? Number(F_cw.toFixed(1)) : Number(F_ccw.toFixed(1)),
        unit: "N",
        citation: "Eq. 13.19(c),(d), Page 270",
        notes: "Case (e): CW pulls slack side; CCW pulls tight side.",
      });
    } else {
      // Case d: fulcrum has tight end for CW, slack end for CCW
      // CW: F * a = F1 * b => F_cw = F1 * (b/a)
      // CCW: F * a = F2 * b => F_ccw = F2 * (b/a)
      F_cw = (F1 * b) / a;
      F_ccw = (F2 * b) / a;

      steps.push({
        stepNumber: stepNum++,
        title: "Operating Force (Simple Band Case d)",
        formulaLatex: "F_{\\text{cw}} = F_1 \\frac{b}{a}, \\quad F_{\\text{ccw}} = F_2 \\frac{b}{a}",
        substitutionLatex: `F_{\\text{cw}} = ${F1.toFixed(1)} \\times \\frac{${b}}{${a}}, \\quad F_{\\text{ccw}} = ${F2.toFixed(1)} \\times \\frac{${b}}{${a}}`,
        resultLatex: `F_{\\text{cw}} = ${F_cw.toFixed(1)}\\text{ N}, \\quad F_{\\text{ccw}} = ${F_ccw.toFixed(1)}\\text{ N}`,
        value: rotation === "cw" ? Number(F_cw.toFixed(1)) : Number(F_ccw.toFixed(1)),
        unit: "N",
        citation: "Eq. 13.19(a),(b), Page 270",
      });
    }
  } else {
    // Differential Band Brake
    // b1 = arm for tight tension F1, b2 = arm for slack tension F2
    // F * a = F2 * b2 - F1 * b1 (for rotation where F1 opposes lever, least force)
    // For opposite rotation: F * a = F1 * b2 - F2 * b1
    const b1 = input.b1 ?? 38;
    const b2 = input.b2 ?? 150;

    selfLockingRatio = b2 / b1;
    // Self-locking condition when F <= 0, i.e., e^(mu*theta) >= b2 / b1
    isSelfLocking = exp_mu_theta >= selfLockingRatio;

    // Standard orientation (ESA Q5b): least force when F*a = F2*b2 - F1*b1
    F_cw = (F2 * b2 - F1 * b1) / a;
    // Opposite rotation
    F_ccw = (F1 * b2 - F2 * b1) / a;

    steps.push({
      stepNumber: stepNum++,
      title: "Differential Band Operating Force & Moment Balance",
      formulaLatex: "F \\cdot a = F_2 b_2 - F_1 b_1 \\implies F = \\frac{F_2 b_2 - F_1 b_1}{a}",
      substitutionLatex: `F = \\frac{${F2.toFixed(1)} \\times ${b2} - ${F1.toFixed(1)} \\times ${b1}}{${a}} = \\frac{${(F2 * b2).toFixed(1)} - ${(F1 * b1).toFixed(1)}}{${a}}`,
      resultLatex: `F = ${F_cw.toFixed(2)}\\text{ N}`,
      value: Number(F_cw.toFixed(2)),
      unit: "N",
      citation: "Eq. 13.19(e),(f), Page 270",
      notes: `Opposite rotation force: F' = ${F_ccw.toFixed(1)} N.`,
    });

    steps.push({
      stepNumber: stepNum++,
      title: "Differential Band Self-Locking Criterion",
      formulaLatex: "\\text{Self-Locking if } e^{\\mu \\theta} \\ge \\frac{b_2}{b_1}",
      substitutionLatex: `e^{\\mu \\theta} = ${exp_mu_theta.toFixed(4)}, \\quad \\frac{b_2}{b_1} = \\frac{${b2}}{${b1}} = ${selfLockingRatio.toFixed(4)}`,
      resultLatex: isSelfLocking
        ? `e^{\\mu \\theta} \\ge \\frac{b_2}{b_1} \\implies \\text{SELF-LOCKING}`
        : `e^{\\mu \\theta} < \\frac{b_2}{b_1} \\implies \\text{NOT Self-Locking}`,
      value: isSelfLocking ? 1 : 0,
      unit: "status",
      citation: "Sec 13.19 / Page 270",
      notes: isSelfLocking
        ? "Warning: F <= 0! The brake will grab automatically without external force."
        : "Safe operation: applied force is required to hold load.",
    });

    if (isSelfLocking) {
      warnings.push({
        code: "BAND_SELF_LOCKING",
        severity: "danger",
        message: `Differential band brake is SELF-LOCKING! e^(\u03bc\u03b8) = ${exp_mu_theta.toFixed(3)} \u2265 b2/b1 = ${selfLockingRatio.toFixed(3)}.`,
        recommendation: "Increase b2 or decrease b1 to avoid uncontrolled jamming during application.",
      });
    }
  }

  const F_operating = rotation === "cw" ? F_cw : F_ccw;

  // Step 4: Band Sizing (Thickness h, Width b')
  let h = input.h;
  if (!h) {
    h = 0.005 * D;
    steps.push({
      stepNumber: stepNum++,
      title: "Recommended Band Thickness",
      formulaLatex: "h = 0.005 \\cdot D",
      substitutionLatex: `h = 0.005 \\times ${D}`,
      resultLatex: `h = ${h.toFixed(2)}\\text{ mm}`,
      value: Number(h.toFixed(2)),
      unit: "mm",
      citation: "Eq. 13.18(n), Page 268",
    });
  }

  let b_prime = input.b_prime;
  if (!b_prime) {
    if (input.band_width_ratio) {
      b_prime = input.band_width_ratio * h;
      steps.push({
        stepNumber: stepNum++,
        title: "Band Width from Specified Ratio",
        formulaLatex: "b' = \\text{ratio} \\times h",
        substitutionLatex: `b' = ${input.band_width_ratio} \\times ${h}`,
        resultLatex: `b' = ${b_prime.toFixed(1)}\\text{ mm}`,
        value: Number(b_prime.toFixed(1)),
        unit: "mm",
        citation: "Class Notes Design Choice",
      });
    } else if (input.sigma_d_band) {
      b_prime = F1 / (h * input.sigma_d_band);
      steps.push({
        stepNumber: stepNum++,
        title: "Required Band Width from Tensile Stress",
        formulaLatex: "b' = \\frac{F_1}{h \\cdot \\sigma_d}",
        substitutionLatex: `b' = \\frac{${F1.toFixed(1)}}{${h} \\times ${input.sigma_d_band}}`,
        resultLatex: `b' = ${b_prime.toFixed(2)}\\text{ mm}`,
        value: Number(b_prime.toFixed(2)),
        unit: "mm",
        citation: "Eq. 13.18(o), Page 268",
      });
    } else {
      b_prime = 10 * h; // default ratio
    }
  }

  // Step 5: Bearing Pressures on Band
  const p_avg = (F1 + F2) / (D * b_prime);
  const p1 = (2 * F1) / (D * b_prime);
  const p2 = (2 * F2) / (D * b_prime);

  steps.push({
    stepNumber: stepNum++,
    title: "Band Contact Pressures",
    formulaLatex: "p_{\\text{avg}} = \\frac{F_1 + F_2}{D \\cdot b'}, \\quad p_1 = \\frac{2 F_1}{D \\cdot b'}, \\quad p_2 = \\frac{2 F_2}{D \\cdot b'}",
    substitutionLatex: `p_{\\text{avg}} = \\frac{${F1.toFixed(1)} + ${F2.toFixed(1)}}{${D} \\times ${b_prime.toFixed(1)}}, \\quad p_1 = \\frac{2 \\times ${F1.toFixed(1)}}{${D} \\times ${b_prime.toFixed(1)}}`,
    resultLatex: `p_{\\text{avg}} = ${p_avg.toFixed(3)}\\text{ MPa}, \\quad p_1 = ${p1.toFixed(3)}\\text{ MPa}, \\quad p_2 = ${p2.toFixed(3)}\\text{ MPa}`,
    value: Number(p1.toFixed(3)),
    unit: "MPa",
    citation: "Eq. 13.18(k),(l),(m), Page 268",
    notes: `p1 is maximum pressure at tight end; p2 is minimum pressure at slack end.`,
  });

  // Step 6: Lever Design (Rectangular Cross Section, depth = k * width)
  let lever_bl: number | undefined;
  let lever_hl: number | undefined;
  let M_lever: number | undefined;

  if (input.sigma_lever) {
    const k = input.lever_depth_ratio_k ?? 2;
    const F_design = Math.max(Math.abs(F_cw), Math.abs(F_ccw));
    M_lever = F_design * a; // Bending moment at pivot

    // Section modulus Z = (1/6) * b_l * h_l^2 = (1/6) * b_l * (k*b_l)^2 = (k^2 / 6) * b_l^3
    // sigma_b = M / Z = 6 M / (k^2 * b_l^3)
    // b_l = [ 6 M / (k^2 * sigma) ]^(1/3)
    lever_bl = Math.cbrt((6 * M_lever) / (k * k * input.sigma_lever));
    lever_hl = k * lever_bl;

    steps.push({
      stepNumber: stepNum++,
      title: "Operating Lever Cross-Section Design",
      formulaLatex: "M = F_{\\max} \\cdot a, \\quad b_l = \\left[ \\frac{6 M}{k^2 \\cdot \\sigma_{\\text{lever}}} \\right]^{1/3}, \\quad h_l = k \\cdot b_l",
      substitutionLatex: `M = ${F_design.toFixed(1)} \\times ${a} = ${M_lever.toFixed(0)}\\text{ N}\\cdot\\text{mm}, \\quad b_l = \\left[ \\frac{6 \\times ${M_lever.toFixed(0)}}{${k}^2 \\times ${input.sigma_lever}} \\right]^{1/3}`,
      resultLatex: `b_l = ${lever_bl.toFixed(2)}\\text{ mm} \\implies \\approx ${Math.ceil(lever_bl)}\\text{ mm}, \\quad h_l = ${(k * Math.ceil(lever_bl))}\\text{ mm}`,
      value: Number(lever_bl.toFixed(2)),
      unit: "mm",
      citation: "Class Notes Problem 2 / Bending Theory",
      notes: `Using depth-to-width ratio k = ${k}. Rounded to standard integer sizes.`,
    });
  }

  // Rubbing speed & heat if N_rpm provided
  let v: number | undefined;
  let H_kW: number | undefined;
  if (input.N_rpm && input.N_rpm > 0) {
    v = rubbingVelocity(D, input.N_rpm);
    H_kW = (Ft * v) / 1000;

    steps.push({
      stepNumber: stepNum++,
      title: "Rubbing Velocity and Heat Dissipation Rate",
      formulaLatex: "v = \\frac{\\pi D N}{60,000}, \\quad H = F_t \\cdot v",
      substitutionLatex: `v = \\frac{\\pi \\times ${D} \\times ${input.N_rpm}}{60,000} = ${v.toFixed(2)}\\text{ m/s}, \\quad H = ${Ft.toFixed(1)} \\times ${v.toFixed(2)}`,
      resultLatex: `v = ${v.toFixed(2)}\\text{ m/s}, \\quad H = ${H_kW.toFixed(2)}\\text{ kW}`,
      value: Number(H_kW.toFixed(2)),
      unit: "kW",
      citation: "Eq. 13.24(a), Page 275",
    });
  }

  return {
    success: true,
    module: "band_brake",
    summary: {
      brakeType,
      simpleCase,
      rotation,
      D,
      r,
      theta_rad: Number(theta_rad.toFixed(4)),
      exp_mu_theta: Number(exp_mu_theta.toFixed(4)),
      Ft: Number(Ft.toFixed(1)),
      T_Nm: Number(T_Nm.toFixed(2)),
      F1: Number(F1.toFixed(1)),
      F2: Number(F2.toFixed(1)),
      F_cw: Number(F_cw.toFixed(2)),
      F_ccw: Number(F_ccw.toFixed(2)),
      F_operating: Number(F_operating.toFixed(2)),
      h: Number(h.toFixed(2)),
      b_prime: Number(b_prime.toFixed(2)),
      p_avg: Number(p_avg.toFixed(3)),
      p1: Number(p1.toFixed(3)),
      p2: Number(p2.toFixed(3)),
      isSelfLocking,
      selfLockingRatio: selfLockingRatio !== undefined ? Number(selfLockingRatio.toFixed(4)) : undefined,
      lever_bl: lever_bl !== undefined ? Number(lever_bl.toFixed(2)) : undefined,
      lever_hl: lever_hl !== undefined ? Number(lever_hl.toFixed(2)) : undefined,
      M_lever: M_lever !== undefined ? Number(M_lever.toFixed(1)) : undefined,
      v: v !== undefined ? Number(v.toFixed(2)) : undefined,
      H_kW: H_kW !== undefined ? Number(H_kW.toFixed(2)) : undefined,
    },
    steps,
    warnings,
  };
}
