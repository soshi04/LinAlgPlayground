import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ch3Api } from "../api";
import type { ImageKernelResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

function makeZeros(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill("0"));
}

const PRESETS: { label: string; matrix: string[][] }[] = [
  {
    label: "Rank-deficient 3×4",
    matrix: [
      ["1", "2", "3", "4"],
      ["2", "4", "6", "8"],
      ["1", "1", "1", "1"],
    ],
  },
  {
    label: "Full-rank 3×3",
    matrix: [
      ["1", "0", "2"],
      ["0", "1", "3"],
      ["0", "0", "1"],
    ],
  },
  {
    label: "Projection (onto x₁-axis)",
    matrix: [
      ["1", "0"],
      ["0", "0"],
    ],
  },
  {
    label: "Rank 2 in 3×3",
    matrix: [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
    ],
  },
];

export function ImageKernelPanel() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [mat, setMat] = useState<string[][]>(makeZeros(3, 3));
  const [result, setResult] = useState<ImageKernelResponse | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSizeChange = (newM: number, newN: number) => {
    setM(newM);
    setN(newN);
    setMat(makeZeros(newM, newN));
    setResult(null);
  };

  const cellChange = (r: number, c: number, val: string) => {
    const next = mat.map((row) => [...row]);
    next[r][c] = val;
    setMat(next);
  };

  const loadPreset = (preset: (typeof PRESETS)[number]) => {
    const rows = preset.matrix.length;
    const cols = preset.matrix[0].length;
    setM(rows);
    setN(cols);
    setMat(preset.matrix.map((r) => [...r]));
    setResult(null);
  };

  const handleAnalyze = async () => {
    setError(null);
    try {
      const res = await ch3Api.imageKernel(mat);
      setResult(res);
      setExpandedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const toggleStep = (i: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Matrix input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Input Matrix A ({m}×{n})</CardTitle>
          <CardDescription className="text-xs">
            Enter a matrix to compute its image (column space) and kernel (null space).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4 items-center flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              Rows:
              <select
                className="rounded border border-input bg-background px-2 py-1 text-sm"
                value={m}
                onChange={(e) => handleSizeChange(Number(e.target.value), n)}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              Cols:
              <select
                className="rounded border border-input bg-background px-2 py-1 text-sm"
                value={n}
                onChange={(e) => handleSizeChange(m, Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <Button key={p.label} size="sm" variant="outline" onClick={() => loadPreset(p)}>
                {p.label}
              </Button>
            ))}
          </div>

          <table className="border-collapse">
            <tbody>
              {mat.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-0.5">
                      <input
                        className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                        value={cell}
                        onChange={(e) => cellChange(i, j, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Button size="sm" onClick={handleAnalyze}>Analyze Image &amp; Kernel</Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Results */}
      {result && (
        <>
          {/* Rank-Nullity summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rank-Nullity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-sm">
                <span className="text-muted-foreground">rank(A)</span>
                <span className="font-mono">{result.rank}</span>
                <span className="text-muted-foreground">nullity(A)</span>
                <span className="font-mono">{result.nullity}</span>
                <span className="text-muted-foreground">Number of columns</span>
                <span className="font-mono">{result.numCols}</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground">{result.rankNullityCheck}</p>

              <div className="flex gap-2 flex-wrap">
                {result.columnLabels.map((label, j) => (
                  <Badge key={j} variant={label === "pivot" ? "success" : "secondary"}>
                    col {j + 1}: {label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RREF */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">RREF(A)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MatrixDisplay
                matrix={result.rref}
                augmented={false}
                numVars={result.numCols}
                pivotColumns={result.pivotColumns}
              />

              {result.steps.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Steps ({result.steps.length})
                  </p>
                  {result.steps.map((step, i) => (
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
                          <MatrixDisplay
                            matrix={step.matrix}
                            augmented={false}
                            numVars={result.numCols}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image basis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Image (Column Space) — dim = {result.rank}
              </CardTitle>
              <CardDescription className="text-xs">
                Basis for im(A): original columns of A at pivot positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.imageBasis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Image is {"{0}"} (zero matrix).</p>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  {result.imageBasis.map((vec, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        v{result.pivotColumns[i] + 1}
                      </p>
                      <MatrixDisplay
                        matrix={vec.map((v) => [v])}
                        augmented={false}
                        numVars={1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kernel basis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Kernel (Null Space) — dim = {result.nullity}
              </CardTitle>
              <CardDescription className="text-xs">
                Basis for ker(A): solutions of Ax = 0 parameterized by free variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.kernelBasis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kernel is {"{0}"} (only the trivial solution).</p>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  {result.kernelBasis.map((vec, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        k{i + 1}
                      </p>
                      <MatrixDisplay
                        matrix={vec.map((v) => [v])}
                        augmented={false}
                        numVars={1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
