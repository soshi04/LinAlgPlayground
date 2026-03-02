// ── Preset metadata ─────────────────────────────────────────────────────────

export interface ParamSchema {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface TransformPresetInfo {
  id: string;
  name: string;
  paramsSchema: ParamSchema[];
  defaultParams: Record<string, number>;
  description: string;
}

export interface MetadataResponse {
  presets: TransformPresetInfo[];
}

// ── Apply transform 2D ─────────────────────────────────────────────────────

export interface ApplyTransform2DRequest {
  matrix?: string[][] | null;
  preset?: string | null;
  params?: Record<string, number> | null;
  vectors: string[][];
}

export interface ApplyTransform2DResponse {
  matrix: string[][];
  matrixFloat: number[][];
  transformedVectors: string[][];
  transformedVectorsFloat: number[][];
  interpretation: string;
}

// ── Matrix product ──────────────────────────────────────────────────────────

export interface MatrixProductRequest {
  A: string[][];
  B: string[][];
  order: "AB" | "BA";
}

export interface MatrixProductResponse {
  defined: boolean;
  reason: string;
  product?: string[][];
  productFloat?: number[][];
  dimensionExplanation: string;
  columnsOfFirst?: string[][];
  mappedColumns?: string[][];
}

// ── Compose 2D ──────────────────────────────────────────────────────────────

export interface Compose2DRequest {
  A: string[][];
  B: string[][];
  vectors: string[][];
}

export interface Compose2DResponse {
  AB: string[][];
  BA: string[][];
  ABFloat: number[][];
  BAFloat: number[][];
  pointsAB: number[][];
  pointsBA: number[][];
  commute: boolean;
  explanation: string;
}

// ── Invertibility ───────────────────────────────────────────────────────────

export interface InvertibilityResponse {
  isInvertible: boolean;
  n: number;
  rank: number;
  determinant2x2?: string;
  det2x2Float?: number;
  rref: string[][];
  rrefEqualsIdentity: boolean;
  explanation: string;
}

// ── Inverse via augment ─────────────────────────────────────────────────────

export interface RrefStep {
  operation: Record<string, unknown>;
  description: string;
  matrix: string[][];
}

export interface InverseAugmentResponse {
  isInvertible: boolean;
  inverse?: string[][];
  inverseFloat?: number[][];
  steps: RrefStep[];
  explanation: string;
}

// ── Solve BAx = y ───────────────────────────────────────────────────────────

export interface SolveBAXResponse {
  solvable: boolean;
  x?: string[];
  xFloat?: number[];
  z?: string[];
  zFloat?: number[];
  derivation: string;
  reason?: string;
}
