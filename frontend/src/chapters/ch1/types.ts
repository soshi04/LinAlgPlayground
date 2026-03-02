// ── Row Operations ──────────────────────────────────────────────────────────

export type RowOp =
  | { kind: "swap"; r1: number; r2: number }
  | { kind: "scale"; r: number; k: string }
  | { kind: "add"; target: number; source: number; k: string };

// ── Payloads ────────────────────────────────────────────────────────────────

export interface MatrixPayload {
  matrix: string[][];
  augmented: boolean;
  numVars: number;
  numEqs: number;
}

export interface ApplyRowOpRequest {
  matrix: string[][];
  operation: RowOp;
  augmented: boolean;
  numVars: number;
  numEqs: number;
}

// ── Responses ───────────────────────────────────────────────────────────────

export interface NormalizeResponse {
  matrix: string[][];
  errors: string[];
}

export interface ApplyRowOpResponse {
  matrix: string[][];
  description: string;
  warnings: string[];
}

export interface RrefStep {
  operation: Record<string, unknown>;
  description: string;
  matrix: string[][];
}

export interface RrefResponse {
  rref: string[][];
  steps: RrefStep[];
  pivotColumns: number[];
  rank: number;
  freeVarColumns: number[];
}

export interface ParametricExpression {
  variable: string;
  expression: string;
  isFree: boolean;
  paramName?: string;
}

export interface ParametricSolution {
  expressions: ParametricExpression[];
  freeVariables: string[];
  parameterNames: Record<string, string>;
}

export interface SolveResponse {
  classification: "unique" | "infinite" | "none";
  rankA: number;
  rankAb: number;
  numVars: number;
  numEqs: number;
  solution?: string[];
  parametricSolution?: ParametricSolution;
  reason?: string;
}

export interface HintResponse {
  operation: RowOp | null;
  explanation: string;
}

// ── UI State ────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  matrix: string[][];
  description: string;
}
