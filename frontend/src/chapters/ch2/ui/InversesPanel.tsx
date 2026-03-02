import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ch2Api } from "../api";
import type { InvertibilityResponse, InverseAugmentResponse, SolveBAXResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

function makeIdentity(n: number): string[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? "1" : "0"))
  );
}

export function InversesPanel() {
  const [n, setN] = useState(2);
  const [mat, setMat] = useState<string[][]>(makeIdentity(2));

  // Invertibility
  const [invCheck, setInvCheck] = useState<InvertibilityResponse | null>(null);
  // Inverse via augment
  const [invResult, setInvResult] = useState<InverseAugmentResponse | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  // Solve BAx=y
  const [matB, setMatB] = useState<string[][]>(makeIdentity(2));
  const [vecY, setVecY] = useState<string[]>(["1", "0"]);
  const [solveResult, setSolveResult] = useState<SolveBAXResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleNChange = (newN: number) => {
    setN(newN);
    setMat(makeIdentity(newN));
    setMatB(makeIdentity(newN));
    setVecY(Array(newN).fill("0"));
    setInvCheck(null);
    setInvResult(null);
    setSolveResult(null);
  };

  const cellChange = (
    matrix: string[][], setMatrix: (m: string[][]) => void,
    r: number, c: number, val: string
  ) => {
    const next = matrix.map((row) => [...row]);
    next[r][c] = val;
    setMatrix(next);
  };

  const handleCheckInv = async () => {
    setError(null);
    try {
      const res = await ch2Api.invertibility(mat);
      setInvCheck(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleComputeInverse = async () => {
    setError(null);
    try {
      const res = await ch2Api.inverseViaAugment(mat);
      setInvResult(res);
      setExpandedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleSolve = async () => {
    setError(null);
    try {
      const res = await ch2Api.solveBAX(mat, matB, vecY);
      setSolveResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const toggleStep = (i: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const gridInput = (
    matrix: string[][], setMatrix: (m: string[][]) => void, label: string
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

  return (
    <div className="space-y-6">
      {/* Size selector + matrix input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Matrix A ({n}×{n})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            Size n:
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={n}
              onChange={(e) => handleNChange(Number(e.target.value))}
            >
              {[2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          {gridInput(mat, setMat, "")}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCheckInv}>Check Invertibility</Button>
            <Button size="sm" variant="outline" onClick={handleComputeInverse}>Compute Inverse via [A|I]</Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Invertibility result */}
      {invCheck && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Invertibility
              <Badge variant={invCheck.isInvertible ? "success" : "destructive"}>
                {invCheck.isInvertible ? "Invertible" : "Not Invertible"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-xs">
              <span className="text-muted-foreground">n</span>
              <span className="font-mono">{invCheck.n}</span>
              <span className="text-muted-foreground">rank(A)</span>
              <span className="font-mono">{invCheck.rank}</span>
              <span className="text-muted-foreground">RREF(A) = Iₙ</span>
              <span className="font-mono">{invCheck.rrefEqualsIdentity ? "Yes" : "No"}</span>
              {invCheck.determinant2x2 != null && (
                <>
                  <span className="text-muted-foreground">det (ad−bc)</span>
                  <span className="font-mono">{invCheck.determinant2x2}</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">RREF(A):</p>
            <MatrixDisplay matrix={invCheck.rref} augmented={false} numVars={n} />
            <p className="text-sm text-muted-foreground">{invCheck.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Inverse via augmentation */}
      {invResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inverse via [A|I] Row Reduction</CardTitle>
            <CardDescription className="text-xs">{invResult.explanation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invResult.isInvertible && invResult.inverse && (
              <>
                <p className="text-xs text-muted-foreground">A⁻¹ =</p>
                <MatrixDisplay matrix={invResult.inverse} augmented={false} numVars={n} />
              </>
            )}
            {invResult.steps.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Steps ({invResult.steps.length})
                </p>
                {invResult.steps.map((step, i) => (
                  <div key={i} className="border rounded text-sm">
                    <button
                      className="w-full text-left px-3 py-1.5 hover:bg-muted/50 flex items-center gap-2"
                      onClick={() => toggleStep(i)}
                    >
                      <span className="text-muted-foreground w-5 shrink-0">
                        {expandedSteps.has(i) ? "▾" : "▸"}
                      </span>
                      <span className="font-mono text-xs">{step.description}</span>
                    </button>
                    {expandedSteps.has(i) && (
                      <div className="px-3 py-2 border-t">
                        <MatrixDisplay matrix={step.matrix} augmented={true} numVars={n} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Solve BAx = y */}
      <Separator />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Solve BAx = y via Inverses</CardTitle>
          <CardDescription className="text-xs">
            If A and B are invertible: x = A⁻¹ B⁻¹ y
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-6 flex-wrap">
            {gridInput(mat, setMat, "Matrix A")}
            {gridInput(matB, setMatB, "Matrix B")}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vector y</p>
              <div className="flex flex-col gap-0.5">
                {vecY.map((v, i) => (
                  <input
                    key={i}
                    className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                    value={v}
                    onChange={(e) => {
                      const next = [...vecY];
                      next[i] = e.target.value;
                      setVecY(next);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <Button size="sm" onClick={handleSolve}>Solve</Button>
          {solveResult && (
            <div className="space-y-2 text-sm">
              {solveResult.solvable ? (
                <>
                  <Badge variant="success">Solved</Badge>
                  <pre className="font-mono text-xs bg-muted/50 rounded p-3 whitespace-pre-wrap">
                    {solveResult.derivation}
                  </pre>
                </>
              ) : (
                <>
                  <Badge variant="destructive">Cannot solve</Badge>
                  <p className="text-muted-foreground">{solveResult.reason}</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
