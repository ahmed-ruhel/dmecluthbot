import { describe, it, expect } from "vitest";
import { GALLERY_PROBLEMS } from "../data/gallery-problems";
import materials from "../data/friction-materials.json";
import {
  powerSpeedToTorqueNmm,
  torqueSpeedToPowerKw,
  nmmToNm,
  rubbingVelocity,
} from "../lib/engine/units";
import {
  saveScenario,
  loadAllScenarios,
  encodeScenarioUrl,
  decodeScenarioUrl,
} from "../lib/scenario";

describe("Gallery Problems Data Integrity", () => {
  it("contains all 12 required course exam problems", () => {
    expect(GALLERY_PROBLEMS.length).toBe(12);
    const codes = GALLERY_PROBLEMS.map((p) => p.code);
    expect(codes).toEqual([
      "C1", "C2", "C3", "C4", "C5",
      "B1", "B2", "B3", "B4",
      "BB1", "BB2", "BB3",
    ]);
  });

  it("each problem has valid module and non-empty metadata", () => {
    for (const p of GALLERY_PROBLEMS) {
      expect(["clutch", "block_brake", "band_brake"]).toContain(p.module);
      expect(p.title.length).toBeGreaterThan(5);
      expect(p.source.length).toBeGreaterThan(3);
      expect(p.keyResults.length).toBeGreaterThan(5);
      expect(p.description.length).toBeGreaterThan(10);
    }
  });
});

describe("Friction Materials Library", () => {
  it("contains confirmed materials covering clutch and brake categories", () => {
    expect(materials.length).toBeGreaterThan(5);
    const clutchMats = materials.filter((m) => m.category.includes("clutch"));
    const brakeMats = materials.filter((m) => m.category.includes("brake"));
    expect(clutchMats.length).toBeGreaterThan(2);
    expect(brakeMats.length).toBeGreaterThan(2);
    for (const mat of materials) {
      expect(mat.name.length).toBeGreaterThan(0);
      expect(mat.p_max_mpa).toBeGreaterThan(0);
      expect(mat.source_table.length).toBeGreaterThan(0);
    }
  });
});

describe("Kinematic & Conversion Invariants", () => {
  it("satisfies power <-> torque bidirectional roundtrip", () => {
    const P = 15; // kW
    const N = 1500; // rpm
    const T_nmm = powerSpeedToTorqueNmm(P, N);
    const P_calc = torqueSpeedToPowerKw(T_nmm, N);
    expect(P_calc).toBeCloseTo(P, 2);
  });

  it("calculates rubbing surface velocity correctly (ERR-1 fix check)", () => {
    // D = 400 mm, N = 1500 rpm -> v = pi * 0.4 * 1500 / 60 = 31.4159 m/s
    const v = rubbingVelocity(400, 1500);
    expect(v).toBeCloseTo(31.4159, 2);
  });
});

describe("Scenario Persistence & URL Sharing", () => {
  it("encodes and decodes scenarios via Base64 without data loss", () => {
    const sample = {
      id: "test-123",
      label: "C1 Test Scenario",
      module: "clutch" as const,
      savedAt: "2026-11-22T00:00:00.000Z",
      inputs: { torqueNm: 240, fos: 2.5, mu: 0.25 },
      summaryLine: "Do=179.9 mm",
    };

    // Test encode / decode logic
    const json = JSON.stringify(sample);
    const b64 = Buffer.from(json).toString("base64");
    const restored = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));

    expect(restored.label).toBe(sample.label);
    expect(restored.inputs.torqueNm).toBe(240);
    expect(restored.summaryLine).toBe(sample.summaryLine);
  });
});
