// ── Shared step model ──────────────────────────────────────────────────────

export interface RrefStep {
  operation: Record<string, unknown>;
  description: string;
  matrix: string[][];
}

// ── Image & Kernel ─────────────────────────────────────────────────────────

export interface ImageKernelResponse {
  rref: string[][];
  steps: RrefStep[];
  pivotColumns: number[];
  freeVarColumns: number[];
  rank: number;
  nullity: number;
  numCols: number;
  rankNullityCheck: string;
  imageBasis: string[][];
  kernelBasis: string[][];
  columnLabels: string[];
}

// ── Linear Independence ────────────────────────────────────────────────────

export interface LinearIndependenceResponse {
  independent: boolean;
  rank: number;
  numVectors: number;
  explanation: string;
  rref: string[][];
  steps: RrefStep[];
  redundantIndices: number[];
  basisIndices: number[];
}

// ── Vector in Span ─────────────────────────────────────────────────────────

export interface VectorInSpanResponse {
  inSpan: boolean;
  explanation: string;
  coefficients: string[] | null;
  rref: string[][];
  steps: RrefStep[];
}

// ── Basis & Dimension ──────────────────────────────────────────────────────

export interface BasisDimensionResponse {
  isBasis: boolean;
  dimension: number;
  explanation: string;
  basisVectors: string[][];
  basisIndices: number[];
  redundantIndices: number[];
  rref: string[][];
  steps: RrefStep[];
}

// ── Coordinates ────────────────────────────────────────────────────────────

export interface CoordinateResponse {
  coordinateVector: string[];
  coordinateVectorFloat: number[];
  reconstructed: string[];
  reconstructedFloat: number[];
  explanation: string;
  steps: RrefStep[];
}

// ── B-matrix ───────────────────────────────────────────────────────────────

export interface BMatrixResponse {
  bMatrix: string[][];
  bMatrixFloat: number[][];
  sInverse: string[][];
  isDiagonal: boolean;
  explanation: string;
  steps: RrefStep[];
}

// ── Similarity ─────────────────────────────────────────────────────────────

export interface SimilarityResponse {
  areSimilar: boolean;
  changeOfBasis: string[][] | null;
  changeOfBasisFloat: number[][] | null;
  explanation: string;
}
