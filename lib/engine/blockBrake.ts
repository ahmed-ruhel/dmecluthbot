import {
  BlockBrakeCase,
  CalculationResult,
  EngineWarning,
  RotationDirection,
  StepDetail,
} from "./types";
import { degToRad, formatNum, jToKj, nmmToNm, rubbingVelocity, wToKw } from "./units";

export interface BlockBrakeInputs {
  drumDiaMm: number;
  leverArmForceMm: number; // a
  leverArmFulcrumMm: number; // b
  fulcrumOffsetMm: number; // c (offset from Ft line)
  contactAngleDeg?: number; // 2theta (if absent, assume 60)
  mu: number;
  caseType: BlockBrakeCase;
  rotation: RotationDirection;
  speedRpm?: number;
  faceWidthMm?: number; // b'
  timeSec?: number;

  // Load specification (one of these is provided or solved)
  torqueNm?: number;
  torqueNmm?: number;
  appliedForceN?: number; // F applied
  pMaxMpa?: number; // allowable bearing pressure
}

export interface BlockBrakeSummary {
  drumDiaMm: number;
  drumRadiusMm: number;
  leverA: number;
  leverB: number;
  leverC: number;
  contactAngleDeg: number;
  muOriginal: number;
  muPrime: number;
  normalForceN: number;
  tangentialForceN: number;
  operatingForceN: number;
  operatingForceCwN: number;
  operatingForceCcwN: number;
  torqueNmm: number;
  torqueNm: number;
  surfaceSpeedMs: number;
  heatRateWatts: number;
  heatRateKw: number;
  heatEnergyJoules: number;
  heatEnergyKj: number;
  bearingPressureMpa?: number;
  isSelfEnergizing: boolean;
  isSelfLocking: boolean;
  criticalOffsetMm: number;
  caseType: BlockBrakeCase;
  rotation: RotationDirection;
}

export function solveBlockBrake(inputs: BlockBrakeInputs): CalculationResult<BlockBrakeSummary> {
  const steps: StepDetail[] = [];
  const warnings: EngineWarning[] = [];
  let stepCount = 1;

  const D = inputs.drumDiaMm;
  const r = D / 2;
  const a = inputs.leverArmForceMm;
  const b = inputs.leverArmFulcrumMm;
  const c = inputs.fulcrumOffsetMm;
  const mu = inputs.mu;
  const rotation = inputs.rotation;
  const caseType = inputs.caseType;

  // 1. Contact angle & equivalent mu'
  const twoThetaDeg = inputs.contactAngleDeg && inputs.contactAngleDeg > 0 ? inputs.contactAngleDeg : 60;
  const assumedContactAngle = !inputs.contactAngleDeg;
  let muPrime = mu;

  if (assumedContactAngle) {
    warnings.push({
      code: "ASSUMED_CONTACT_ANGLE",
      severity: "info",
      message: "Contact angle 2θ was not specified; assumed 60° per standard course convention.",
    });
  }

  const thetaRad = degToRad(twoThetaDeg / 2);
  const twoThetaRad = degToRad(twoThetaDeg);

  if (twoThetaDeg > 60) {
    // Eq. 13.6(m), Pg 264
    const sinTheta = Math.sin(thetaRad);
    const sinTwoTheta = Math.sin(twoThetaRad);
    muPrime = mu * ((4 * sinTheta) / (twoThetaRad + sinTwoTheta));

    steps.push({
      stepNumber: stepCount++,
      title: "Equivalent Coefficient of Friction (2θ > 60°)",
      formulaLatex: "\\mu' = \\mu \\left[ \\frac{4 \\sin\\theta}{2\\theta + \\sin 2\\theta} \\right]",
      substitutionLatex: `\\mu' = ${formatNum(mu, 3)} \\left[ \\frac{4 \\sin(${formatNum(twoThetaDeg / 2, 1)}^\\circ)}{${formatNum(twoThetaRad, 4)} + \\sin(${formatNum(twoThetaDeg, 1)}^\\circ)} \\right]`,
      resultLatex: `\\mu' = ${formatNum(muPrime, 4)}`,
      value: muPrime,
      unit: "dimensionless",
      citation: "Eq. 13.6(m), Pg 264",
    });
  } else {
    steps.push({
      stepNumber: stepCount++,
      title: "Coefficient of Friction (2θ ≤ 60°)",
      formulaLatex: "\\mu' = \\mu",
      substitutionLatex: `\\mu' = ${formatNum(mu, 3)} \\quad (2\\theta = ${twoThetaDeg}^\\circ \\le 60^\\circ)`,
      resultLatex: `\\mu' = ${formatNum(muPrime, 3)}`,
      value: muPrime,
      unit: "dimensionless",
      citation: "Class Notes Pg 2",
    });
  }

  // 2. Normal force, tangential force & Torque
  let Fn = 0;
  let Ft = 0;
  let T_nmm = 0;

  if (inputs.torqueNmm && inputs.torqueNmm > 0) {
    T_nmm = inputs.torqueNmm;
    Ft = T_nmm / r;
    Fn = Ft / muPrime;
    steps.push({
      stepNumber: stepCount++,
      title: "Braking Tangential and Normal Forces",
      formulaLatex: "F_t = \\frac{T}{r}, \\quad F_n = \\frac{F_t}{\\mu'}",
      substitutionLatex: `F_t = \\frac{${formatNum(T_nmm, 2)}}{${formatNum(r, 1)}} = ${formatNum(Ft, 2)} \\text{ N}, \\quad F_n = \\frac{${formatNum(Ft, 2)}}{${formatNum(muPrime, 4)}}`,
      resultLatex: `F_t = ${formatNum(Ft, 2)} \\text{ N}, \\quad F_n = ${formatNum(Fn, 2)} \\text{ N}`,
      value: Fn,
      unit: "N",
      citation: "Eq. 13.16(a), (f), Pg 264-265",
    });
  } else if (inputs.torqueNm && inputs.torqueNm > 0) {
    T_nmm = inputs.torqueNm * 1000;
    Ft = T_nmm / r;
    Fn = Ft / muPrime;
    steps.push({
      stepNumber: stepCount++,
      title: "Braking Tangential and Normal Forces",
      formulaLatex: "F_t = \\frac{T}{r}, \\quad F_n = \\frac{F_t}{\\mu'}",
      substitutionLatex: `F_t = \\frac{${formatNum(T_nmm, 2)}}{${formatNum(r, 1)}} = ${formatNum(Ft, 2)} \\text{ N}, \\quad F_n = \\frac{${formatNum(Ft, 2)}}{${formatNum(muPrime, 4)}}`,
      resultLatex: `F_t = ${formatNum(Ft, 2)} \\text{ N}, \\quad F_n = ${formatNum(Fn, 2)} \\text{ N}`,
      value: Fn,
      unit: "N",
      citation: "Eq. 13.16(a), (f), Pg 264-265",
    });
  } else if (inputs.pMaxMpa && inputs.pMaxMpa > 0 && inputs.faceWidthMm && inputs.faceWidthMm > 0) {
    // Given p_max and face width b'
    // Fn = p * projected area = p * (2 * r * b' * sin(theta))
    const bPrime = inputs.faceWidthMm;
    Fn = inputs.pMaxMpa * (2 * r * bPrime * Math.sin(thetaRad));
    Ft = muPrime * Fn;
    T_nmm = Ft * r;

    steps.push({
      stepNumber: stepCount++,
      title: "Normal Force from Contact Pressure Limit",
      formulaLatex: "F_n = p \\cdot (2 r b' \\sin\\theta)",
      substitutionLatex: `F_n = ${formatNum(inputs.pMaxMpa, 2)} \\times (2 \\times ${formatNum(r, 1)} \\times ${formatNum(bPrime, 1)} \\times \\sin(${formatNum(twoThetaDeg / 2, 1)}^\\circ))`,
      resultLatex: `F_n = ${formatNum(Fn, 2)} \\text{ N}, \\quad F_t = ${formatNum(Ft, 2)} \\text{ N}`,
      value: Fn,
      unit: "N",
      citation: "Eq. 13.16(g), Pg 265",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Braking Torque Absorbed",
      formulaLatex: "T = F_t \\cdot r",
      substitutionLatex: `T = ${formatNum(Ft, 2)} \\times ${formatNum(r, 1)}`,
      resultLatex: `T = ${formatNum(T_nmm, 2)} \\text{ N·mm} \\; (${formatNum(nmmToNm(T_nmm), 2)} \\text{ N·m})`,
      value: T_nmm,
      unit: "N·mm",
      citation: "Eq. 13.16(e), Pg 265",
    });
  } else if (inputs.appliedForceN && inputs.appliedForceN > 0) {
    // Given operating force F -> back-solve for Ft, Fn, T
    const F_applied = inputs.appliedForceN;
    let factor = 0;
    if (caseType === "case1") {
      factor = (b / (a + b)) * (1 / muPrime);
    } else if (caseType === "case2") {
      factor = rotation === "cw" ? (b / (a + b)) * (1 / muPrime - c / b) : (b / (a + b)) * (1 / muPrime + c / b);
    } else {
      // Case 3
      factor = rotation === "cw" ? (b / (a + b)) * (1 / muPrime + c / b) : (b / (a + b)) * (1 / muPrime - c / b);
    }

    Ft = F_applied / factor;
    Fn = Ft / muPrime;
    T_nmm = Ft * r;

    steps.push({
      stepNumber: stepCount++,
      title: "Tangential Braking Force Back-Calculation from Lever Force",
      formulaLatex: "F_t = \\frac{F}{\\frac{b}{a+b} \\left[ \\frac{1}{\\mu'} \\pm \\frac{c}{b} \\right]}",
      substitutionLatex: `F_t = \\frac{${formatNum(F_applied, 2)}}{${formatNum(factor, 5)}}`,
      resultLatex: `F_t = ${formatNum(Ft, 2)} \\text{ N}, \\quad F_n = ${formatNum(Fn, 2)} \\text{ N}`,
      value: Ft,
      unit: "N",
      citation: "Eq. 13.17, Pg 267",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Braking Torque Absorbed",
      formulaLatex: "T = F_t \\cdot r",
      substitutionLatex: `T = ${formatNum(Ft, 2)} \\times ${formatNum(r, 1)}`,
      resultLatex: `T = ${formatNum(T_nmm, 2)} \\text{ N·mm} \\; (${formatNum(nmmToNm(T_nmm), 2)} \\text{ N·m})`,
      value: T_nmm,
      unit: "N·mm",
      citation: "Eq. 13.16(e), Pg 265",
    });
  }

  // 3. Operating force F for CW and CCW
  let F_cw = 0;
  let F_ccw = 0;

  if (caseType === "case1") {
    F_cw = Ft * (b / (a + b)) * (1 / muPrime);
    F_ccw = F_cw;
    steps.push({
      stepNumber: stepCount++,
      title: "Operating Force (Case 1: c = 0)",
      formulaLatex: "F = F_t \\left[ \\frac{b}{a+b} \\right] \\frac{1}{\\mu'}",
      substitutionLatex: `F = ${formatNum(Ft, 2)} \\left[ \\frac{${formatNum(b, 1)}}{${formatNum(a, 1)} + ${formatNum(b, 1)}} \\right] \\frac{1}{${formatNum(muPrime, 4)}}`,
      resultLatex: `F = ${formatNum(F_cw, 2)} \\text{ N}`,
      value: F_cw,
      unit: "N",
      citation: "Eq. 13.17(a), Pg 267",
    });
  } else if (caseType === "case2") {
    F_cw = (Ft * b) / (a + b) * (1 / muPrime - c / b);
    F_ccw = (Ft * b) / (a + b) * (1 / muPrime + c / b);

    steps.push({
      stepNumber: stepCount++,
      title: "Operating Force (Case 2: Line of Ft between Center & Fulcrum)",
      formulaLatex: "F_{\\text{cw}} = \\frac{F_t b}{a+b} \\left[ \\frac{1}{\\mu'} - \\frac{c}{b} \\right], \\quad F_{\\text{ccw}} = \\frac{F_t b}{a+b} \\left[ \\frac{1}{\\mu'} + \\frac{c}{b} \\right]",
      substitutionLatex: `F_{\\text{cw}} = \\frac{${formatNum(Ft, 2)} \\times ${formatNum(b, 1)}}{${formatNum(a + b, 1)}} \\left[ \\frac{1}{${formatNum(muPrime, 4)}} - \\frac{${formatNum(c, 1)}}{${formatNum(b, 1)}} \\right]`,
      resultLatex: `F_{\\text{cw}} = ${formatNum(F_cw, 2)} \\text{ N}, \\quad F_{\\text{ccw}} = ${formatNum(F_ccw, 2)} \\text{ N}`,
      value: rotation === "cw" ? F_cw : F_ccw,
      unit: "N",
      citation: "Eq. 13.17(b), (c), Pg 267",
    });
  } else {
    // Case 3
    F_cw = (Ft * b) / (a + b) * (1 / muPrime + c / b);
    F_ccw = (Ft * b) / (a + b) * (1 / muPrime - c / b);

    steps.push({
      stepNumber: stepCount++,
      title: "Operating Force (Case 3: Fulcrum between Center & Line of Ft)",
      formulaLatex: "F_{\\text{cw}} = \\frac{F_t b}{a+b} \\left[ \\frac{1}{\\mu'} + \\frac{c}{b} \\right], \\quad F_{\\text{ccw}} = \\frac{F_t b}{a+b} \\left[ \\frac{1}{\\mu'} - \\frac{c}{b} \\right]",
      substitutionLatex: `F_{\\text{ccw}} = \\frac{${formatNum(Ft, 2)} \\times ${formatNum(b, 1)}}{${formatNum(a + b, 1)}} \\left[ \\frac{1}{${formatNum(muPrime, 4)}} - \\frac{${formatNum(c, 1)}}{${formatNum(b, 1)}} \\right]`,
      resultLatex: `F_{\\text{cw}} = ${formatNum(F_cw, 2)} \\text{ N}, \\quad F_{\\text{ccw}} = ${formatNum(F_ccw, 2)} \\text{ N}`,
      value: rotation === "cw" ? F_cw : F_ccw,
      unit: "N",
      citation: "Eq. 13.17(d), (e), Pg 267",
    });
  }

  const operatingForce = rotation === "cw" ? F_cw : F_ccw;

  // 4. Self-energizing & Self-locking analysis
  const c_crit = b / muPrime;
  const isSelfEnergizing =
    (caseType === "case2" && rotation === "cw") || (caseType === "case3" && rotation === "ccw");
  const isSelfLocking = isSelfEnergizing && c >= c_crit;

  steps.push({
    stepNumber: stepCount++,
    title: "Self-Locking Condition Analysis",
    formulaLatex: "c_{\\text{crit}} = \\frac{b}{\\mu'} \\implies \\text{Self-locking if } c \\ge c_{\\text{crit}} \\text{ in self-energizing direction}",
    substitutionLatex: `c_{\\text{crit}} = \\frac{${formatNum(b, 1)}}{${formatNum(muPrime, 4)}} = ${formatNum(c_crit, 1)} \\text{ mm}`,
    resultLatex: `c = ${formatNum(c, 1)} \\text{ mm} \\; (c_{\\text{crit}} = ${formatNum(c_crit, 1)} \\text{ mm}) \\implies ${isSelfLocking ? "\\textbf{SELF-LOCKING}" : isSelfEnergizing ? "\\text{Self-Energizing}" : "\\text{Conventional}"}`,
    value: c_crit,
    unit: "mm",
    citation: "Class Notes Pg 3",
  });

  if (isSelfLocking) {
    warnings.push({
      code: "SELF_LOCKING_BRAKE",
      severity: "danger",
      message: `The brake is SELF-LOCKING for ${rotation.toUpperCase()} rotation (c = ${formatNum(c, 1)} mm ≥ critical c = ${formatNum(c_crit, 1)} mm). The brake will grab violently without external force.`,
      recommendation: "Reduce fulcrum offset c below c_crit, or ensure this brake is solely intended for unidirectional hoist holding.",
    });
  } else if (isSelfEnergizing) {
    warnings.push({
      code: "SELF_ENERGIZING",
      severity: "info",
      message: `The brake is SELF-ENERGIZING for ${rotation.toUpperCase()} rotation. The friction moment assists the application lever.`,
    });
  }

  // 5. Thermal analysis
  let v = 0;
  let H_watts = 0;
  let E_joules = 0;
  const speedRpm = inputs.speedRpm || 0;
  const durationSec = inputs.timeSec || 10;

  if (speedRpm > 0) {
    v = rubbingVelocity(D, speedRpm);
    H_watts = Ft * v;
    E_joules = H_watts * durationSec;

    steps.push({
      stepNumber: stepCount++,
      title: "Surface Rubbing Velocity & Heat Generation Rate",
      formulaLatex: "v = \\frac{\\pi D N}{60000} \\text{ [m/s]}, \\quad H = F_t \\cdot v = \\mu' F_n v \\text{ [W]}",
      substitutionLatex: `v = \\frac{\\pi \\times ${formatNum(D, 1)} \\times ${formatNum(speedRpm, 0)}}{60000} = ${formatNum(v, 2)} \\text{ m/s}, \\quad H = ${formatNum(Ft, 2)} \\times ${formatNum(v, 2)}`,
      resultLatex: `v = ${formatNum(v, 2)} \\text{ m/s}, \\quad H = ${formatNum(wToKw(H_watts), 2)} \\text{ kW}`,
      value: H_watts,
      unit: "W",
      citation: "Eq. 13.24(a), Pg 275 (corrected per Erratum 1)",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Heat Energy Dissipated during Braking Cycle",
      formulaLatex: "E = H \\cdot t",
      substitutionLatex: `E = ${formatNum(wToKw(H_watts), 2)} \\text{ kW} \\times ${formatNum(durationSec, 1)} \\text{ s}`,
      resultLatex: `E = ${formatNum(jToKj(E_joules), 1)} \\text{ kJ}`,
      value: E_joules,
      unit: "J",
      citation: "Class Notes Pg 6",
    });

    if (wToKw(H_watts) > 50) {
      warnings.push({
        code: "HIGH_THERMAL_LOAD",
        severity: "warning",
        message: `High heat dissipation rate (${formatNum(wToKw(H_watts), 1)} kW). Continuous operation requires artificial forced cooling or ribbed cast iron drum.`,
        recommendation: "Check radiating capacity per Handbook Table 13.9.",
      });
    }
  }

  // Bearing pressure check
  let bearingPressure: number | undefined;
  if (inputs.faceWidthMm && inputs.faceWidthMm > 0) {
    bearingPressure = Fn / (inputs.faceWidthMm * 2 * r * Math.sin(thetaRad));
  }

  return {
    success: true,
    module: "block_brake",
    summary: {
      drumDiaMm: D,
      drumRadiusMm: r,
      leverA: a,
      leverB: b,
      leverC: c,
      contactAngleDeg: twoThetaDeg,
      muOriginal: mu,
      muPrime,
      normalForceN: Fn,
      tangentialForceN: Ft,
      operatingForceN: operatingForce,
      operatingForceCwN: F_cw,
      operatingForceCcwN: F_ccw,
      torqueNmm: T_nmm,
      torqueNm: nmmToNm(T_nmm),
      surfaceSpeedMs: v,
      heatRateWatts: H_watts,
      heatRateKw: wToKw(H_watts),
      heatEnergyJoules: E_joules,
      heatEnergyKj: jToKj(E_joules),
      bearingPressureMpa: bearingPressure,
      isSelfEnergizing,
      isSelfLocking,
      criticalOffsetMm: c_crit,
      caseType,
      rotation,
    },
    steps,
    warnings,
  };
}

export const calculateBlockBrake = solveBlockBrake;

