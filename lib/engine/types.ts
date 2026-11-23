export interface StepDetail {
  stepNumber: number;
  title: string;
  formulaLatex: string;
  substitutionLatex: string;
  resultLatex: string;
  value: number;
  unit: string;
  citation: string;
  notes?: string;
}

export interface EngineWarning {
  code: string;
  severity: "info" | "warning" | "danger";
  message: string;
  recommendation?: string;
}

export interface CalculationResult<T = Record<string, number | string | boolean>> {
  success: boolean;
  module: "clutch" | "block_brake" | "band_brake";
  summary: T;
  steps: StepDetail[];
  warnings: EngineWarning[];
  error?: string;
}

export type ClutchTheory = "uniform_wear" | "uniform_pressure";
export type ClutchSolveMode = "capacity" | "sizing" | "plate_count" | "force_limited";
export type RotationDirection = "cw" | "ccw";
export type BlockBrakeCase = "case1" | "case2" | "case3";
export type BandBrakeType = "simple" | "differential";
export type SimpleBandCase = "case_d" | "case_e";
