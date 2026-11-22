import { describe, it, expect } from "vitest";
import { calculateClutch } from "../lib/engine/clutch";
import { calculateBlockBrake } from "../lib/engine/blockBrake";
import { calculateBandBrake } from "../lib/engine/bandBrake";
import { evaluateExpression } from "../lib/engine/units";

// Helper for tolerance check (within 0.5%)
function expectWithinTolerance(actual: number, expected: number, tolerancePct = 0.5) {
  const diffPct = Math.abs((actual - expected) / expected) * 100;
  expect(
    diffPct,
    `Value ${actual} deviated from expected ${expected} by ${diffPct.toFixed(3)}% (allowed: ${tolerancePct}%)`
  ).toBeLessThanOrEqual(tolerancePct);
}

describe("Engine Units & Expression Evaluator", () => {
  it("evaluates simple math expressions and variable constants", () => {
    expect(evaluateExpression("250 + 250")).toBe(500);
    expect(evaluateExpression("pi * 100")).toBeCloseTo(314.159, 2);
    expect(evaluateExpression("3/4 * 200")).toBe(150);
  });
});

describe("Clutch Golden Tests (C1 - C5)", () => {
  it("C1 (ESA 4a / Notes P1): Sizing mode with FoS and fixed ratio", () => {
    const res = calculateClutch({
      mode: "sizing",
      theory: "uniform_wear",
      numDrivingDiscs: 5,
      numDrivenDiscs: 4,
      torqueNm: 240,
      fos: 2.5,
      pAllowableMpa: 0.35,
      mu: 0.25,
      diameterRatio: 0.5,
    });

    expect(res.success).toBe(true);
    expect(res.summary.numFrictionSurfaces).toBe(8);
    expect(res.summary.designTorqueNmm).toBe(600000);
    expectWithinTolerance(res.summary.diaOuterMm, 179.88, 0.5); // ~179.9 mm
    expectWithinTolerance(res.summary.diaInnerMm, 89.94, 0.5);  // ~90 mm
  });

  it("C2 (Minor II 1a / Notes P2): Plate count mode from Power and Speed", () => {
    const res = calculateClutch({
      mode: "plate_count",
      theory: "uniform_wear",
      powerKw: 8,
      speedRpm: 1440,
      diaInnerMm: 80,
      diaOuterMm: 140,
      mu: 0.1,
      pAllowableMpa: 0.35,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.torqueNm, 53.056, 0.5);
    expect(res.summary.numFrictionSurfaces).toBe(4);
    expect(res.summary.numDrivingDiscs).toBe(2);
    expect(res.summary.numDrivenDiscs).toBe(3);
    expectWithinTolerance(res.summary.actualAxialForceN, 2411.6, 0.5);
    expectWithinTolerance(res.summary.maxPressureMpa, 0.320, 0.5);
  });

  it("C3 (ESA 6a / Notes P3): Axial force-limited multiplate clutch", () => {
    const res = calculateClutch({
      mode: "force_limited",
      theory: "uniform_wear",
      diaOuterMm: 250,
      radialWidthFraction: 0.2, // b = 0.2 * Ro = 25 mm => Di = 200 mm
      powerKw: 60,
      speedRpm: 3000,
      mu: 0.25,
      axialForceLimitN: 600,
    });

    expect(res.success).toBe(true);
    expect(res.summary.diaInnerMm).toBe(200);
    expectWithinTolerance(res.summary.torqueNm, 191.0, 0.5);
    expect(res.summary.numFrictionSurfaces).toBe(12);
    expect(res.summary.numDrivingDiscs).toBe(6);
    expect(res.summary.numDrivenDiscs).toBe(7);
    expectWithinTolerance(res.summary.actualAxialForceN, 565.88, 0.5);
    expectWithinTolerance(res.summary.maxPressureMpa, 0.0360, 0.5);
    expectWithinTolerance(res.summary.meanPressureMpa, 0.0320, 0.5);
  });

  it("C4 (Notes P4): Uniform Wear vs Uniform Pressure comparison", () => {
    const resWear = calculateClutch({
      mode: "capacity",
      theory: "uniform_wear",
      numDrivingDiscs: 2,
      numDrivenDiscs: 3,
      diaOuterMm: 200,
      diaInnerMm: 120,
      pAllowableMpa: 0.1,
      mu: 0.15,
      speedRpm: 1000,
    });

    expect(resWear.success).toBe(true);
    expectWithinTolerance(resWear.summary.torqueNm, 72.382, 0.5);
    expectWithinTolerance(resWear.summary.powerKw, 7.579, 0.5);

    const resPressure = calculateClutch({
      mode: "capacity",
      theory: "uniform_pressure",
      numDrivingDiscs: 2,
      numDrivenDiscs: 3,
      diaOuterMm: 200,
      diaInnerMm: 120,
      pAllowableMpa: 0.1,
      mu: 0.15,
      speedRpm: 1000,
    });

    expect(resPressure.success).toBe(true);
    expectWithinTolerance(resPressure.summary.axialForceN, 2010.6, 0.5);
    expectWithinTolerance(resPressure.summary.meanDiaMm, 163.33, 0.5);
    expectWithinTolerance(resPressure.summary.torqueNm, 98.52, 0.5);
    expectWithinTolerance(resPressure.summary.powerKw, 10.32, 0.5);
  });

  it("C5 (Minor II 3b): Capacity mode with 5 plates (n'=4)", () => {
    // With n' = 4 active contact surfaces:
    const res4 = calculateClutch({
      mode: "capacity",
      theory: "uniform_wear",
      numFrictionSurfaces: 4,
      diaOuterMm: 250,
      diaInnerMm: 150,
      pAllowableMpa: 0.127,
      mu: 0.3,
      speedRpm: 500,
    });

    expect(res4.success).toBe(true);
    expectWithinTolerance(res4.summary.torqueNm, 359.08, 0.5);
    expectWithinTolerance(res4.summary.powerKw, 18.80, 0.5);

    // If n' = 2 active contact pairs (matching the course plan's 9.40 kW key where radius was halved):
    const res2 = calculateClutch({
      mode: "capacity",
      theory: "uniform_wear",
      numFrictionSurfaces: 2,
      diaOuterMm: 250,
      diaInnerMm: 150,
      pAllowableMpa: 0.127,
      mu: 0.3,
      speedRpm: 500,
    });

    expect(res2.success).toBe(true);
    expectWithinTolerance(res2.summary.torqueNm, 179.54, 0.5);
    expectWithinTolerance(res2.summary.powerKw, 9.40, 0.5);
  });

});

describe("Block Brake Golden Tests (B1 - B4)", () => {
  it("B1 (Notes P1): Case 2 short shoe brake", () => {
    const res = calculateBlockBrake({
      caseType: "case2",
      rotation: "cw",
      drumDiaMm: 500,
      leverArmForceMm: 250,
      leverArmFulcrumMm: 250,
      fulcrumOffsetMm: 75,
      torqueNm: 200,
      speedRpm: 750,
      mu: 0.25,
      contactAngleDeg: 60,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.normalForceN, 3200, 0.5);
    expectWithinTolerance(res.summary.tangentialForceN, 800, 0.5);
    expectWithinTolerance(res.summary.operatingForceCwN, 1480, 0.5);
    expectWithinTolerance(res.summary.operatingForceCcwN, 1720, 0.5);
    expectWithinTolerance(res.summary.surfaceSpeedMs, 19.635, 0.5);
    expectWithinTolerance(res.summary.heatRateKw, 15.71, 0.5);
    expectWithinTolerance(res.summary.criticalOffsetMm, 1000, 0.5);
  });

  it("B2 (Notes P2): Case 2 with larger lever ratio", () => {
    const res = calculateBlockBrake({
      caseType: "case2",
      rotation: "cw",
      drumDiaMm: 500,
      leverArmForceMm: 750,
      leverArmFulcrumMm: 250,
      fulcrumOffsetMm: 50,
      torqueNm: 500,
      speedRpm: 1000,
      mu: 0.25,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.normalForceN, 8000, 0.5);
    expectWithinTolerance(res.summary.tangentialForceN, 2000, 0.5);
    expectWithinTolerance(res.summary.operatingForceCwN, 1900, 0.5);
    expectWithinTolerance(res.summary.operatingForceCcwN, 2100, 0.5);
    expectWithinTolerance(res.summary.criticalOffsetMm, 1000, 0.5);
  });

  it("B3 (Notes P3): Case 3 CCW with 2theta = 90 deg and operating force 700 N", () => {
    const res = calculateBlockBrake({
      caseType: "case3",
      rotation: "ccw",
      drumDiaMm: 200,
      contactAngleDeg: 90,
      leverArmForceMm: 250,
      leverArmFulcrumMm: 200,
      fulcrumOffsetMm: 50,
      mu: 0.35,
      appliedForceN: 700,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.muPrime, 0.385, 0.5);
    expectWithinTolerance(res.summary.tangentialForceN, 670.99, 0.5);
    expectWithinTolerance(res.summary.normalForceN, 1742.7, 0.5);
    expectWithinTolerance(res.summary.torqueNm, 67.1, 0.5);
  });

  it("B4 (Notes P4): Case 1 with allowable pressure and 10s energy", () => {
    const res = calculateBlockBrake({
      caseType: "case1",
      rotation: "cw",
      drumDiaMm: 400,
      contactAngleDeg: 90,
      faceWidthMm: 50,
      pMaxMpa: 0.5,
      leverArmForceMm: 250,
      leverArmFulcrumMm: 250,
      fulcrumOffsetMm: 0,
      speedRpm: 1500,
      mu: 0.25,
      timeSec: 10,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.muPrime, 0.275, 0.5);
    expectWithinTolerance(res.summary.normalForceN, 7071.07, 0.5);
    expectWithinTolerance(res.summary.tangentialForceN, 1944.7, 0.5);
    expectWithinTolerance(res.summary.operatingForceN, 3535.5, 0.5);
    expectWithinTolerance(res.summary.torqueNm, 388.9, 0.5);
    expectWithinTolerance(res.summary.surfaceSpeedMs, 31.42, 0.5);
    expectWithinTolerance(res.summary.heatRateKw, 61.1, 0.5);
    expectWithinTolerance(res.summary.heatEnergyKj, 611, 0.5);
  });
});

describe("Band Brake Golden Tests (BB1 - BB3)", () => {
  it("BB1 (Notes P1): Simple Band Brake Case e", () => {
    const res = calculateBandBrake({
      brakeType: "simple",
      simpleCase: "case_e",
      D: 600,
      h: 5,
      mu: 0.25,
      theta_deg: 270,
      Ft: 9000,
      b: 200,
      a: 1500,
      sigma_d_band: 50,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.F1, 13003.5, 0.5);
    expectWithinTolerance(res.summary.F2, 4003.5, 0.5);
    expectWithinTolerance(res.summary.F_cw, 533.8, 0.5);
    expectWithinTolerance(res.summary.F_ccw, 1733.8, 0.5);
    expectWithinTolerance(res.summary.b_prime, 52.01, 0.5);
  });

  it("BB2 (Notes P2): Simple band with lever design", () => {
    const res = calculateBandBrake({
      brakeType: "simple",
      simpleCase: "case_e",
      P_kW: 30,
      N_rpm: 750,
      D: 500,
      theta_deg: 225,
      mu: 0.25,
      a: 1000,
      b: 250,
      band_width_ratio: 10,
      sigma_lever: 80,
      lever_depth_ratio_k: 2,
    });

    expect(res.success).toBe(true);
    expectWithinTolerance(res.summary.T_Nm, 382.0, 0.5);
    expectWithinTolerance(res.summary.Ft, 1528.0, 0.5);
    expectWithinTolerance(res.summary.F1, 2443.4, 0.5);
    expectWithinTolerance(res.summary.F2, 915.4, 0.5);
    expectWithinTolerance(res.summary.F_cw, 228.85, 0.5);
    expectWithinTolerance(res.summary.F_ccw, 610.85, 0.5);
    expect(res.summary.h).toBe(2.5);
    expect(res.summary.b_prime).toBe(25);
    expectWithinTolerance(res.summary.lever_bl!, 22.54, 0.5);
  });

  it("BB3 (ESA Q5b / Review Q5): Differential Band Brake", () => {
    const res = calculateBandBrake({
      brakeType: "differential",
      a: 225,
      b1: 38,
      b2: 150,
      D: 600,
      theta_deg: 300,
      mu: 0.22,
      h: 3,
      b_prime: 100,
      sigma_d_band: 56,
    });

    expect(res.success).toBe(true);
    expect(res.summary.F1).toBe(16800);
    expectWithinTolerance(res.summary.F2, 5309.4, 0.5);
    expectWithinTolerance(res.summary.Ft, 11490.6, 0.5);
    expectWithinTolerance(res.summary.T_Nm, 3447.2, 0.5);
    expectWithinTolerance(res.summary.F_operating, 702.27, 0.5);
    expect(res.summary.isSelfLocking).toBe(false);
  });
});
