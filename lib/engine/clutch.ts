import {
  CalculationResult,
  ClutchSolveMode,
  ClutchTheory,
  EngineWarning,
  StepDetail,
} from "./types";
import {
  formatNum,
  powerSpeedToTorqueNmm,
  torqueSpeedToPowerKw,
  nmmToNm,
} from "./units";

export interface ClutchInputs {
  mode: ClutchSolveMode;
  theory: ClutchTheory;
  powerKw?: number;
  speedRpm?: number;
  torqueNmm?: number;
  torqueNm?: number;
  fos?: number;
  mu: number;
  pAllowableMpa?: number; // p_max allowable
  diaOuterMm?: number;
  diaInnerMm?: number;
  diameterRatio?: number; // Di / Do (default 0.5 or 0.577)
  radialWidthFraction?: number; // b / Ro (where Di = Do - 2b)
  axialForceLimitN?: number; // for force_limited mode
  numDrivingDiscs?: number; // n1
  numDrivenDiscs?: number; // n2
  numFrictionSurfaces?: number; // n'
}

export interface ClutchSummary {
  torqueNmm: number;
  torqueNm: number;
  designTorqueNmm: number;
  powerKw: number;
  speedRpm: number;
  diaOuterMm: number;
  diaInnerMm: number;
  meanDiaMm: number;
  numFrictionSurfaces: number; // n'
  numDrivingDiscs: number; // n1
  numDrivenDiscs: number; // n2
  axialForceN: number;
  actualAxialForceN: number;
  maxPressureMpa: number;
  meanPressureMpa: number;
  limitingMaxPressureMpa?: number;
  theory: ClutchTheory;
}

export function solveClutch(inputs: ClutchInputs): CalculationResult<ClutchSummary> {
  const steps: StepDetail[] = [];
  const warnings: EngineWarning[] = [];
  let stepCount = 1;

  const theory = inputs.theory || "uniform_wear";
  const fos = inputs.fos && inputs.fos > 0 ? inputs.fos : 1.0;
  const mu = inputs.mu;

  // 1. Determine Torque & Power
  let T_nominal = 0;
  let speedRpm = inputs.speedRpm || 0;
  let powerKw = inputs.powerKw || 0;

  if (inputs.torqueNmm && inputs.torqueNmm > 0) {
    T_nominal = inputs.torqueNmm;
    if (speedRpm > 0 && !powerKw) {
      powerKw = torqueSpeedToPowerKw(T_nominal, speedRpm);
    }
  } else if (inputs.torqueNm && inputs.torqueNm > 0) {
    T_nominal = inputs.torqueNm * 1000;
    if (speedRpm > 0 && !powerKw) {
      powerKw = torqueSpeedToPowerKw(T_nominal, speedRpm);
    }
  } else if (inputs.powerKw && inputs.powerKw > 0 && speedRpm > 0) {
    // Course canonical formula: T = 9.55e6 * P / N
    T_nominal = powerSpeedToTorqueNmm(inputs.powerKw, speedRpm);
    powerKw = inputs.powerKw;
  }

  steps.push({
    stepNumber: stepCount++,
    title: "Torque & Power Specification",
    formulaLatex: "T = \\frac{9.55 \\times 10^6 \\cdot P}{N} \\text{ [N·mm]}",
    substitutionLatex: `T = \\frac{9.55 \\times 10^6 \\cdot ${formatNum(powerKw, 2)}}{${formatNum(speedRpm, 0)}}`,
    resultLatex: `T = ${formatNum(T_nominal, 2)} \\text{ N·mm} \\; (${formatNum(nmmToNm(T_nominal), 2)} \\text{ N·m})`,
    value: T_nominal,
    unit: "N·mm",
    citation: "Eq. 13.9, Pg 258, per class notes",
  });

  const T_design = T_nominal * fos;
  if (fos > 1.0) {
    steps.push({
      stepNumber: stepCount++,
      title: "Design Torque with Factor of Safety",
      formulaLatex: "T_{\\max} = \\text{FoS} \\times T",
      substitutionLatex: `T_{\\max} = ${formatNum(fos, 2)} \\times ${formatNum(T_nominal, 2)}`,
      resultLatex: `T_{\\max} = ${formatNum(T_design, 2)} \\text{ N·mm}`,
      value: T_design,
      unit: "N·mm",
      citation: "Class Notes Pg 3",
    });
  }

  // 2. Active Friction Surfaces (n')
  let n_prime = 0;
  let n1 = inputs.numDrivingDiscs || 0;
  let n2 = inputs.numDrivenDiscs || 0;

  if (inputs.numFrictionSurfaces && inputs.numFrictionSurfaces > 0) {
    n_prime = inputs.numFrictionSurfaces;
    if (!n1) n1 = Math.floor(n_prime / 2);
    if (!n2) n2 = n1 + 1;
  } else if (n1 > 0 && n2 > 0) {
    n_prime = n1 + n2 - 1;
  } else if (inputs.mode === "capacity" || inputs.mode === "sizing") {
    // Default single plate both sides or 2
    n_prime = 2;
    n1 = 1;
    n2 = 2;
  }

  let Do = inputs.diaOuterMm || 0;
  let Di = inputs.diaInnerMm || 0;
  const p_allow = inputs.pAllowableMpa || 0.35;

  // Handle radial width fraction b = k * Ro => Di = Do - 2b
  if (Do > 0 && !Di && inputs.radialWidthFraction) {
    const Ro = Do / 2;
    const b = inputs.radialWidthFraction * Ro;
    Di = Do - 2 * b;
    steps.push({
      stepNumber: stepCount++,
      title: "Inner Diameter from Radial Width Specification",
      formulaLatex: "D_i = D_o - 2b = D_o - 2(k \\cdot R_o)",
      substitutionLatex: `D_i = ${formatNum(Do, 1)} - 2(${formatNum(inputs.radialWidthFraction, 2)} \\times ${formatNum(Ro, 1)})`,
      resultLatex: `D_i = ${formatNum(Di, 1)} \\text{ mm}`,
      value: Di,
      unit: "mm",
      citation: "ESA 6a / Class Notes Pg 5",
    });
  }

  let Fa = 0;
  let Fa_actual = 0;
  let Dm = 0;
  let p_max_actual = p_allow;
  let p_mean_actual = 0;
  let limiting_p_max = p_allow;

  // Solve mode branching
  if (inputs.mode === "sizing") {
    // SIZING MODE: given T_design, mu, p, ratio c = Di/Do -> solve Do, Di
    let c = inputs.diameterRatio || (Di && Do ? Di / Do : 0.5);
    if (c <= 0 || c >= 1) c = 0.5;

    // T = 1/8 * pi * mu * n' * p_max * Di * (Do^2 - Di^2)
    // Di*(Do^2 - Di^2) = c*(1 - c^2) * Do^3 = 8*T / (pi * mu * n' * p_max)
    const factor = (8 * T_design) / (Math.PI * mu * n_prime * p_allow);
    const cFactor = c * (1 - c * c);
    Do = Math.cbrt(factor / cFactor);
    Di = c * Do;

    Dm = (Do + Di) / 2;
    Fa = 0.5 * Math.PI * p_allow * Di * (Do - Di);
    Fa_actual = Fa;
    p_max_actual = p_allow;
    p_mean_actual = Fa / ((Math.PI / 4) * (Do * Do - Di * Di));

    steps.push({
      stepNumber: stepCount++,
      title: "Friction Lining Sizing (Uniform Wear)",
      formulaLatex: "D_i(D_o^2 - D_i^2) = c(1-c^2)D_o^3 = \\frac{8 T_{\\max}}{\\pi \\mu n' p_{\\max}}",
      substitutionLatex: `D_o^3 = \\frac{8 \\times ${formatNum(T_design, 2)}}{\\pi \\times ${formatNum(mu, 2)} \\times ${n_prime} \\times ${formatNum(p_allow, 2)} \\times ${formatNum(cFactor, 4)}}`,
      resultLatex: `D_o = ${formatNum(Do, 2)} \\text{ mm}, \\; D_i = ${formatNum(Di, 2)} \\text{ mm}`,
      value: Do,
      unit: "mm",
      citation: "Eq. 13.9(f), Pg 259",
    });
  } else if (inputs.mode === "plate_count") {
    // PLATE COUNT MODE: given T, Do, Di, mu, p -> n' -> round up to even -> actual Fa, p_max
    Dm = (Do + Di) / 2;
    Fa = 0.5 * Math.PI * p_allow * Di * (Do - Di);
    const n_prime_calc = (2 * T_design) / (mu * Fa * Dm);
    n_prime = Math.ceil(n_prime_calc);
    if (n_prime % 2 !== 0) n_prime += 1;
    if (n_prime < 2) n_prime = 2;

    n1 = n_prime / 2;
    n2 = n1 + 1;

    Fa_actual = (2 * T_design) / (mu * n_prime * Dm);
    p_max_actual = (2 * Fa_actual) / (Math.PI * Di * (Do - Di));
    p_mean_actual = Fa_actual / ((Math.PI / 4) * (Do * Do - Di * Di));

    steps.push({
      stepNumber: stepCount++,
      title: "Limiting Axial Force per Friction Interface",
      formulaLatex: "F_{aw} = \\frac{1}{2} \\pi p_{\\max} D_i (D_o - D_i)",
      substitutionLatex: `F_{aw} = \\frac{1}{2} \\pi (${formatNum(p_allow, 2)}) (${formatNum(Di, 1)}) (${formatNum(Do, 1)} - ${formatNum(Di, 1)})`,
      resultLatex: `F_{aw} = ${formatNum(Fa, 2)} \\text{ N}`,
      value: Fa,
      unit: "N",
      citation: "Eq. 13.9(d), Pg 258",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Required Active Friction Pairs & Rounding",
      formulaLatex: "n' = \\frac{2 T_{\\max}}{\\mu F_{aw} D_{mw}} \\implies \\text{round up to next even integer}",
      substitutionLatex: `n' = \\frac{2 \\times ${formatNum(T_design, 2)}}{${formatNum(mu, 2)} \\times ${formatNum(Fa, 2)} \\times ${formatNum(Dm, 1)}} = ${formatNum(n_prime_calc, 2)} \\implies ${n_prime}`,
      resultLatex: `n' = ${n_prime} \\; (n_1 = ${n1} \\text{ driving}, \\; n_2 = ${n2} \\text{ driven})`,
      value: n_prime,
      unit: "surfaces",
      citation: "Class Notes Pg 4",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Actual Axial Force Required with Selected Discs",
      formulaLatex: "F_{a,\\text{actual}} = \\frac{2 T_{\\max}}{\\mu n' D_{mw}}",
      substitutionLatex: `F_{a,\\text{actual}} = \\frac{2 \\times ${formatNum(T_design, 2)}}{${formatNum(mu, 2)} \\times ${n_prime} \\times ${formatNum(Dm, 1)}}`,
      resultLatex: `F_{a,\\text{actual}} = ${formatNum(Fa_actual, 2)} \\text{ N}`,
      value: Fa_actual,
      unit: "N",
      citation: "Class Notes Pg 4",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Actual Maximum Operating Pressure",
      formulaLatex: "p_{\\max,\\text{actual}} = \\frac{2 F_{a,\\text{actual}}}{\\pi D_i (D_o - D_i)}",
      substitutionLatex: `p_{\\max,\\text{actual}} = \\frac{2 \\times ${formatNum(Fa_actual, 2)}}{\\pi \\times ${formatNum(Di, 1)} \\times (${formatNum(Do, 1)} - ${formatNum(Di, 1)})}`,
      resultLatex: `p_{\\max,\\text{actual}} = ${formatNum(p_max_actual, 4)} \\text{ MPa}`,
      value: p_max_actual,
      unit: "MPa",
      citation: "Class Notes Pg 4",
    });
  } else if (inputs.mode === "force_limited") {
    // FORCE LIMITED MODE: given Fa limit, radial width fraction, T -> n' -> actual Fa, p_max, p_mean
    const Fa_limit = inputs.axialForceLimitN || 600;
    Dm = (Do + Di) / 2;
    limiting_p_max = (2 * Fa_limit) / (Math.PI * Di * (Do - Di));

    const n_prime_calc = (2 * T_design) / (mu * Fa_limit * Dm);
    n_prime = Math.ceil(n_prime_calc);
    if (n_prime % 2 !== 0) n_prime += 1;
    if (n_prime < 2) n_prime = 2;

    n1 = n_prime / 2;
    n2 = n1 + 1;

    Fa_actual = (2 * T_design) / (mu * n_prime * Dm);
    p_max_actual = (2 * Fa_actual) / (Math.PI * Di * (Do - Di));
    p_mean_actual = Fa_actual / ((Math.PI / 4) * (Do * Do - Di * Di));
    Fa = Fa_limit;

    steps.push({
      stepNumber: stepCount++,
      title: "Limiting Maximum Pressure from Axial Force Limit",
      formulaLatex: "p_{\\max,\\text{limit}} = \\frac{2 F_{a,\\text{limit}}}{\\pi D_i (D_o - D_i)}",
      substitutionLatex: `p_{\\max,\\text{limit}} = \\frac{2 \\times ${formatNum(Fa_limit, 1)}}{\\pi \\times ${formatNum(Di, 1)} \\times (${formatNum(Do, 1)} - ${formatNum(Di, 1)})}`,
      resultLatex: `p_{\\max,\\text{limit}} = ${formatNum(limiting_p_max, 4)} \\text{ MPa}`,
      value: limiting_p_max,
      unit: "MPa",
      citation: "Class Notes Pg 6",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Required Active Friction Pairs & Disc Selection",
      formulaLatex: "n' = \\frac{2 T_{\\max}}{\\mu F_{a,\\text{limit}} D_{mw}} \\implies \\text{round up to even}",
      substitutionLatex: `n' = \\frac{2 \\times ${formatNum(T_design, 2)}}{${formatNum(mu, 2)} \\times ${formatNum(Fa_limit, 1)} \\times ${formatNum(Dm, 1)}} = ${formatNum(n_prime_calc, 2)} \\implies ${n_prime}`,
      resultLatex: `n' = ${n_prime} \\; (n_1 = ${n1}, \\; n_2 = ${n2})`,
      value: n_prime,
      unit: "surfaces",
      citation: "ESA 6a / Class Notes Pg 6",
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Actual Axial Force and Working Pressures",
      formulaLatex: "F_{a,\\text{actual}} = \\frac{2 T_{\\max}}{\\mu n' D_{mw}}, \\quad p_{\\text{mean}} = \\frac{F_{a,\\text{actual}}}{\\frac{\\pi}{4}(D_o^2 - D_i^2)}",
      substitutionLatex: `F_{a,\\text{actual}} = \\frac{2 \\times ${formatNum(T_design, 2)}}{${formatNum(mu, 2)} \\times ${n_prime} \\times ${formatNum(Dm, 1)}} = ${formatNum(Fa_actual, 2)} \\text{ N}`,
      resultLatex: `F_{a,\\text{actual}} = ${formatNum(Fa_actual, 2)} \\text{ N}, \\; p_{\\max} = ${formatNum(p_max_actual, 4)} \\text{ MPa}, \\; p_{\\text{mean}} = ${formatNum(p_mean_actual, 4)} \\text{ MPa}`,
      value: Fa_actual,
      unit: "N",
      citation: "ESA 6a / Class Notes Pg 6",
    });
  } else {
    // CAPACITY MODE: given Do, Di, mu, p, n' -> compute T, P, Fa
    if (theory === "uniform_pressure") {
      Dm = (2 / 3) * ((Do * Do * Do - Di * Di * Di) / (Do * Do - Di * Di));
      Fa = (Math.PI / 4) * p_allow * (Do * Do - Di * Di);
      Fa_actual = Fa;
      T_nominal = 0.5 * mu * Fa * Dm * n_prime;
      p_max_actual = p_allow;
      p_mean_actual = p_allow;

      steps.push({
        stepNumber: stepCount++,
        title: "Axial Force (Uniform Pressure)",
        formulaLatex: "F_a = \\frac{\\pi}{4} p (D_o^2 - D_i^2)",
        substitutionLatex: `F_a = \\frac{\\pi}{4} (${formatNum(p_allow, 2)}) (${formatNum(Do, 1)}^2 - ${formatNum(Di, 1)}^2)`,
        resultLatex: `F_a = ${formatNum(Fa, 2)} \\text{ N}`,
        value: Fa,
        unit: "N",
        citation: "Eq. 13.9(a), Pg 258",
      });

      steps.push({
        stepNumber: stepCount++,
        title: "Mean Friction Diameter (Uniform Pressure)",
        formulaLatex: "D_m = \\frac{2}{3} \\left[ \\frac{D_o^3 - D_i^3}{D_o^2 - D_i^2} \\right]",
        substitutionLatex: `D_m = \\frac{2}{3} \\left[ \\frac{${formatNum(Do, 1)}^3 - ${formatNum(Di, 1)}^3}{${formatNum(Do, 1)}^2 - ${formatNum(Di, 1)}^2} \\right]`,
        resultLatex: `D_m = ${formatNum(Dm, 2)} \\text{ mm}`,
        value: Dm,
        unit: "mm",
        citation: "Eq. 13.9(b), Pg 258",
      });

      steps.push({
        stepNumber: stepCount++,
        title: "Torque Capacity (Uniform Pressure)",
        formulaLatex: "T = \\frac{1}{2} \\mu F_a D_m n'",
        substitutionLatex: `T = \\frac{1}{2} (${formatNum(mu, 2)}) (${formatNum(Fa, 2)}) (${formatNum(Dm, 2)}) (${n_prime})`,
        resultLatex: `T = ${formatNum(T_nominal, 2)} \\text{ N·mm} \\; (${formatNum(nmmToNm(T_nominal), 2)} \\text{ N·m})`,
        value: T_nominal,
        unit: "N·mm",
        citation: "Eq. 13.9(c), Pg 258",
      });
    } else {
      // Uniform wear
      Dm = (Do + Di) / 2;
      Fa = 0.5 * Math.PI * p_allow * Di * (Do - Di);
      Fa_actual = Fa;
      T_nominal = 0.5 * mu * Fa * Dm * n_prime;
      p_max_actual = p_allow;
      p_mean_actual = Fa / ((Math.PI / 4) * (Do * Do - Di * Di));

      steps.push({
        stepNumber: stepCount++,
        title: "Axial Force (Uniform Wear)",
        formulaLatex: "F_{aw} = \\frac{1}{2} \\pi p_{\\max} D_i (D_o - D_i)",
        substitutionLatex: `F_{aw} = \\frac{1}{2} \\pi (${formatNum(p_allow, 3)}) (${formatNum(Di, 1)}) (${formatNum(Do, 1)} - ${formatNum(Di, 1)})`,
        resultLatex: `F_{aw} = ${formatNum(Fa, 2)} \\text{ N}`,
        value: Fa,
        unit: "N",
        citation: "Eq. 13.9(d), Pg 258",
      });

      steps.push({
        stepNumber: stepCount++,
        title: "Mean Friction Diameter (Uniform Wear)",
        formulaLatex: "D_{mw} = \\frac{D_o + D_i}{2}",
        substitutionLatex: `D_{mw} = \\frac{${formatNum(Do, 1)} + ${formatNum(Di, 1)}}{2}`,
        resultLatex: `D_{mw} = ${formatNum(Dm, 2)} \\text{ mm}`,
        value: Dm,
        unit: "mm",
        citation: "Eq. 13.9(e), Pg 258",
      });

      steps.push({
        stepNumber: stepCount++,
        title: "Torque Capacity (Uniform Wear)",
        formulaLatex: "T = \\frac{1}{2} \\mu F_{aw} D_{mw} n'",
        substitutionLatex: `T = \\frac{1}{2} (${formatNum(mu, 2)}) (${formatNum(Fa, 2)}) (${formatNum(Dm, 2)}) (${n_prime})`,
        resultLatex: `T = ${formatNum(T_nominal, 2)} \\text{ N·mm} \\; (${formatNum(nmmToNm(T_nominal), 2)} \\text{ N·m})`,
        value: T_nominal,
        unit: "N·mm",
        citation: "Eq. 13.9(f), Pg 259",
      });
    }

    if (speedRpm > 0) {
      powerKw = torqueSpeedToPowerKw(T_nominal, speedRpm);
      steps.push({
        stepNumber: stepCount++,
        title: "Transmissible Power at Speed",
        formulaLatex: "P = \\frac{2 \\pi N T}{60 \\times 10^6} \\text{ [kW]}",
        substitutionLatex: `P = \\frac{2 \\pi \\times ${formatNum(speedRpm, 0)} \\times ${formatNum(T_nominal, 2)}}{60 \\times 10^6}`,
        resultLatex: `P = ${formatNum(powerKw, 3)} \\text{ kW}`,
        value: powerKw,
        unit: "kW",
        citation: "Class Notes Pg 4",
      });
    }
  }

  // Safety checks & warnings
  if (Di >= Do) {
    warnings.push({
      code: "INVALID_DIAMETERS",
      severity: "danger",
      message: `Inner diameter (${formatNum(Di, 1)} mm) must be strictly less than outer diameter (${formatNum(Do, 1)} mm).`,
      recommendation: "Ensure Di < Do.",
    });
  }

  const ratio = Do > 0 ? Di / Do : 0;
  if (ratio > 0.8) {
    warnings.push({
      code: "HIGH_DIAMETER_RATIO",
      severity: "warning",
      message: `Diameter ratio Di/Do = ${formatNum(ratio, 3)} is unusually high (> 0.8), which drastically narrows friction lining width.`,
      recommendation: "Recommended design range for Di/Do is 0.5 to 0.577.",
    });
  }

  if (p_max_actual > 2.0) {
    warnings.push({
      code: "HIGH_PRESSURE",
      severity: "warning",
      message: `Operating pressure ${formatNum(p_max_actual, 2)} MPa exceeds typical organic/molded lining limits from Handbook Table 13.4.`,
      recommendation: "Consider sintered metallic friction linings or increase plate area.",
    });
  }

  return {
    success: true,
    module: "clutch",
    summary: {
      torqueNmm: T_nominal,
      torqueNm: nmmToNm(T_nominal),
      designTorqueNmm: T_design,
      powerKw,
      speedRpm,
      diaOuterMm: Do,
      diaInnerMm: Di,
      meanDiaMm: Dm,
      numFrictionSurfaces: n_prime,
      numDrivingDiscs: n1,
      numDrivenDiscs: n2,
      axialForceN: Fa,
      actualAxialForceN: Fa_actual,
      maxPressureMpa: p_max_actual,
      meanPressureMpa: p_mean_actual,
      limitingMaxPressureMpa: limiting_p_max,
      theory,
    },
    steps,
    warnings,
  };
}

export const calculateClutch = solveClutch;

