/**
 * Pure engineering unit conversions and expression evaluator for GripLab
 */

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Torque from Power [kW] and Speed [rpm] in [N*mm]
 * Canonical course formula: T = 9.55e6 * P / N [N*mm]
 * or exact: T = (60 * 10^6 * P) / (2 * pi * N)
 */
export function powerSpeedToTorqueNmm(powerKw: number, speedRpm: number): number {
  if (speedRpm <= 0) return 0;
  // Canonical KLE Tech Course formula: T = 9.55e6 * P / N
  return (9.55e6 * powerKw) / speedRpm;
}

/**
 * Power [kW] from Torque [N*mm] and Speed [rpm]
 * P = 2*pi*N*T / (60 * 10^6) = T * N / 9.55e6
 */
export function torqueSpeedToPowerKw(torqueNmm: number, speedRpm: number): number {
  if (speedRpm <= 0) return 0;
  return (2 * Math.PI * speedRpm * torqueNmm) / (60 * 1e6);
}

/**
 * Convert N*mm to N*m
 */
export function nmmToNm(torqueNmm: number): number {
  return torqueNmm / 1000;
}

/**
 * Convert N*m to N*mm
 */
export function nmToNmm(torqueNm: number): number {
  return torqueNm * 1000;
}

/**
 * Convert W to kW
 */
export function wToKw(watts: number): number {
  return watts / 1000;
}

/**
 * Convert J to kJ
 */
export function jToKj(joules: number): number {
  return joules / 1000;
}

/**
 * Rubbing velocity in m/s: v = pi * D [mm] * N [rpm] / 60000
 */
export function rubbingVelocity(diaMm: number, speedRpm: number): number {
  return (Math.PI * diaMm * speedRpm) / 60000;
}

/**
 * Format number nicely with fixed decimals or significant figures
 */
export function formatNum(val: number, decimals: number = 2): string {
  if (Math.abs(val) < 1e-6 && val !== 0) {
    return val.toExponential(decimals);
  }
  return Number(val.toFixed(decimals)).toString();
}

/**
 * Safe expression evaluator for numeric inputs (e.g., "9.55e6*8/1440" or "140/2")
 */
export function evaluateMathExpression(expr: string | number): number | null {
  if (typeof expr === "number") return isNaN(expr) ? null : expr;
  if (!expr || typeof expr !== "string") return null;

  let cleaned = expr.trim().toLowerCase();
  if (cleaned === "") return null;

  // Replace pi with Math.PI value
  cleaned = cleaned.replace(/\bpi\b/g, Math.PI.toString());

  // Simple direct number check
  const directNum = Number(cleaned);
  if (!isNaN(directNum)) return directNum;

  // Sanitize: allow only digits, decimal point, operators + - * / ( ) and scientific e/E
  if (!/^[0-9eE\s\+\-\*\/\.\(\)]+$/.test(cleaned)) {
    return null;
  }

  try {
    // Safe evaluation using Function
    const fn = new Function(`"use strict"; return (${cleaned});`);
    const result = fn();
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export const evaluateExpression = evaluateMathExpression;
export const powerToTorque = powerSpeedToTorqueNmm;

/**
 * Tangential force Ft [N] from Torque [N*mm] and radius [mm]
 */
export function torqueToTangentialForce(torqueNmm: number, radiusMm: number): number {
  if (radiusMm <= 0) return 0;
  return torqueNmm / radiusMm;
}


