import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ch3Api } from "../api";
import type { CoordinateResponse, BMatrixResponse, SimilarityResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

function makeIdentity(n: number): string[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? "1" : "0"))
  );
}

function makeZeroVectors(k: number, dim: number): string[][] {
  return Array.from({ length: k }, () => Array(dim).fill("0"));
}

export function CoordinatesPanel() {
  // ── Section A: Coordinate Vector ──────────────────
  const [coordDim, setCoordDim] = useState(2);
  const [coordBasis, setCoordBasis] = useState<string[][]>(makeZeroVectors(2, 2));
  const [coordVec, setCoordVec] = useState<string[]>(Array(2).fill("0"));
  const [coordResult, setCoordResult] = useState<CoordinateResponse | null>(null);
  const [coordSteps, setCoordSteps] = useState<Set<number>>(new Set());

  // ── Section B: B-Matrix ───────────────────────────
  const [bN, setBN] = useState(2);
  const [bMatA, setBMatA] = useState<string[][]>(makeIdentity(2));
  const [bBasis, setBBasis] = useState<string[][]>(makeZeroVectors(2, 2));
  const [bResult, setBResult] = useState<BMatrixResponse | null>(null);
  const [bSteps, setBSteps] = useState<Set<number>>(new Set());

  // ── Section C: Similarity ─────────────────────────
  const [simN, setSimN] = useState(2);
  const [simA, setSimA] = useState<string[][]>(makeIdentity(2));
  const [simB, setSimB] = useState<string[][]>(makeIdentity(2));
  const [simResult, setSimResult] = useState<SimilarityResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────
  const cellChange = (
    matrix: string[][],
    setMatrix: (m: string[][]) => void,
    r: number,
    c: number,
    val: string
  ) => {
    const next = matrix.map((row) => [...row]);
    next[r][c] = val;
    setMatrix(next);
  };

  const vecCellChange = (
    vecs: string[][],
    setVecs: (v: string[][]) => void,
    vecIdx: number,
    compIdx: number,
    val: string
  ) => {
    const next = vecs.map((v) => [...v]);
    next[vecIdx][compIdx] = val;
    setVecs(next);
  };

  const gridInput = (
    matrix: string[][],
    setMatrix: (m: string[][]) => void,
    label: string
  ) => (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <table className="border-collapse">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="p-0.5">
                  <input
                    className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                    value={cell}
                    onChange={(e) => cellChange(matrix, setMatrix, i, j, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const vectorColumns = (
    vecs: string[][],
    setVecs: (v: string[][]) => void,
    label: string
  ) => (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-4 flex-wrap">
        {vecs.map((vec, vi) => (
          <div key={vi} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">b{vi + 1}</p>
            <div className="flex flex-col gap-0.5">
              {vec.map((comp, ci) => (
                <input
                  key={ci}
                  className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                  value={comp}
                  onChange={(e) => vecCellChange(vecs, setVecs, vi, ci, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const toggleStep = (set: Set<number>, setSet: (s: Set<number>) => void, i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSet(next);
  };

  const stepsAccordion = (
    steps: { description: string; matrix: string[][] }[],
    expanded: Set<number>,
    setExpanded: (s: Set<number>) => void,
    numVars: number,
    augmented: boolean
  ) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Steps ({steps.length})</p>
      {steps.map((step, i) => (
        <div key={i} className="border rounded text-sm">
          <button
            className="w-full text-left px-3 py-1.5 hover:bg-muted/50 flex items-center gap-2"
            onClick={() => toggleStep(expanded, setExpanded, i)}
          >
            <span className="text-muted-foreground w-5 shrink-0">
              {expanded.has(i) ? "▾" : "▸"}
            </span>
            <span className="font-mono text-xs">{step.description}</span>
          </button>
          {expanded.has(i) && (
            <div className="px-3 py-2 border-t">
              <MatrixDisplay matrix={step.matrix} augmented={augmented} numVars={numVars} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Section A handlers ─────────────────────────────
  const handleCoordDimChange = (newDim: number) => {
    setCoordDim(newDim);
    setCoordBasis(makeZeroVectors(newDim, newDim));
    setCoordVec(Array(newDim).fill("0"));
    setCoordResult(null);
  };

  const handleCoordCompute = async () => {
    setError(null);
    try {
      const res = await ch3Api.coordinateVector(coordBasis, coordVec);
      setCoordResult(res);
      setCoordSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  // ── Section B handlers ─────────────────────────────
  const handleBNChange = (newN: number) => {
    setBN(newN);
    setBMatA(makeIdentity(newN));
    setBBasis(makeZeroVectors(newN, newN));
    setBResult(null);
  };

  const handleBCompute = async () => {
    setError(null);
    try {
      const res = await ch3Api.bMatrix(bMatA, bBasis);
      setBResult(res);
      setBSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  // ── Section C handlers ─────────────────────────────
  const handleSimNChange = (newN: number) => {
    setSimN(newN);
    setSimA(makeIdentity(newN));
    setSimB(makeIdentity(newN));
    setSimResult(null);
  };

  const handleSimCheck = async () => {
    setError(null);
    try {
      const res = await ch3Api.checkSimilarity(simA, simB);
      setSimResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* ═══ Section A: Coordinate Vector ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">A. Coordinate Vector [x]_B</CardTitle>
          <CardDescription className="text-xs">
            Given a basis B and a vector x, compute the coordinate vector [x]_B such that x = c1*b1 + ... + cn*bn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            Dimension n:
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={coordDim}
              onChange={(e) => handleCoordDimChange(Number(e.target.value))}
            >
              {[2, 3, 4].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          {vectorColumns(coordBasis, setCoordBasis, "Basis vectors")}

          <div>
            <p className="text-xs text-muted-foreground mb-1">Vector x</p>
            <div className="flex gap-0.5">
              {coordVec.map((comp, ci) => (
                <input
                  key={ci}
                  className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                  value={comp}
                  onChange={(e) => {
                    const next = [...coordVec];
                    next[ci] = e.target.value;
                    setCoordVec(next);
                  }}
                />
              ))}
            </div>
          </div>

          <Button size="sm" onClick={handleCoordCompute}>Compute [x]_B</Button>
        </CardContent>
      </Card>

      {coordResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Coordinate Vector Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">[x]_B =</p>
              <MatrixDisplay
                matrix={coordResult.coordinateVector.map((v) => [v])}
                augmented={false}
                numVars={1}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reconstruction S * [x]_B =</p>
              <MatrixDisplay
                matrix={coordResult.reconstructed.map((v) => [v])}
                augmented={false}
                numVars={1}
              />
            </div>
            <p className="text-sm text-muted-foreground">{coordResult.explanation}</p>
            {coordResult.steps.length > 0 &&
              stepsAccordion(coordResult.steps, coordSteps, setCoordSteps, coordDim, true)}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* ═══ Section B: B-Matrix ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">B. B-Matrix (S⁻¹AS)</CardTitle>
          <CardDescription className="text-xs">
            Given a linear transformation matrix A and a basis B, compute the B-matrix B = S⁻¹AS where S is the change-of-basis matrix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            Size n:
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={bN}
              onChange={(e) => handleBNChange(Number(e.target.value))}
            >
              {[2, 3, 4].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-6 flex-wrap">
            {gridInput(bMatA, setBMatA, "Matrix A")}
            {vectorColumns(bBasis, setBBasis, "Basis vectors")}
          </div>

          <Button size="sm" onClick={handleBCompute}>Compute B-Matrix</Button>
        </CardContent>
      </Card>

      {bResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              B-Matrix Result
              {bResult.isDiagonal && <Badge variant="success">Diagonal</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-6 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground mb-1">B = S⁻¹AS =</p>
                <MatrixDisplay matrix={bResult.bMatrix} augmented={false} numVars={bN} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">S⁻¹ =</p>
                <MatrixDisplay matrix={bResult.sInverse} augmented={false} numVars={bN} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{bResult.explanation}</p>
            {bResult.steps.length > 0 &&
              stepsAccordion(bResult.steps, bSteps, setBSteps, bN, true)}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* ═══ Section C: Similarity ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">C. Similarity Check</CardTitle>
          <CardDescription className="text-xs">
            Check whether two square matrices A and B are similar (i.e., B = S⁻¹AS for some invertible S). Limited to n ≤ 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            Size n:
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={simN}
              onChange={(e) => handleSimNChange(Number(e.target.value))}
            >
              {[2, 3, 4].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-6 flex-wrap">
            {gridInput(simA, setSimA, "Matrix A")}
            {gridInput(simB, setSimB, "Matrix B")}
          </div>

          <Button size="sm" onClick={handleSimCheck}>Check Similarity</Button>
        </CardContent>
      </Card>

      {simResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Similarity Result
              <Badge variant={simResult.areSimilar ? "success" : "destructive"}>
                {simResult.areSimilar ? "Similar" : "Not Similar"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{simResult.explanation}</p>
            {simResult.areSimilar && simResult.changeOfBasis && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Change-of-basis matrix S:</p>
                <MatrixDisplay
                  matrix={simResult.changeOfBasis}
                  augmented={false}
                  numVars={simN}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
