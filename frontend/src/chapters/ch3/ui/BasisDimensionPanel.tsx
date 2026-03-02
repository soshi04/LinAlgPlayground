import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ch3Api } from "../api";
import type { BasisDimensionResponse, ImageKernelResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

type Mode = "vectors" | "matrix";

function makeZeroVectors(k: number, dim: number): string[][] {
  return Array.from({ length: k }, () => Array(dim).fill("0"));
}

function makeZeros(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill("0"));
}

export function BasisDimensionPanel() {
  const [mode, setMode] = useState<Mode>("vectors");

  // Vectors mode state
  const [dim, setDim] = useState(3);
  const [numVecs, setNumVecs] = useState(3);
  const [vectors, setVectors] = useState<string[][]>(makeZeroVectors(3, 3));
  const [basisResult, setBasisResult] = useState<BasisDimensionResponse | null>(null);

  // Matrix mode state
  const [mRows, setMRows] = useState(3);
  const [nCols, setNCols] = useState(3);
  const [mat, setMat] = useState<string[][]>(makeZeros(3, 3));
  const [imgKerResult, setImgKerResult] = useState<ImageKernelResponse | null>(null);

  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setBasisResult(null);
    setImgKerResult(null);
    setError(null);
  };

  // Vectors mode handlers
  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    setVectors(makeZeroVectors(numVecs, newDim));
    setBasisResult(null);
  };

  const handleNumVecsChange = (newK: number) => {
    setNumVecs(newK);
    setVectors(makeZeroVectors(newK, dim));
    setBasisResult(null);
  };

  const vecCellChange = (vecIdx: number, compIdx: number, val: string) => {
    const next = vectors.map((v) => [...v]);
    next[vecIdx][compIdx] = val;
    setVectors(next);
  };

  // Matrix mode handlers
  const handleMatSizeChange = (newM: number, newN: number) => {
    setMRows(newM);
    setNCols(newN);
    setMat(makeZeros(newM, newN));
    setImgKerResult(null);
  };

  const matCellChange = (r: number, c: number, val: string) => {
    const next = mat.map((row) => [...row]);
    next[r][c] = val;
    setMat(next);
  };

  const handleAnalyzeVectors = async () => {
    setError(null);
    try {
      const res = await ch3Api.basisDimension(vectors);
      setBasisResult(res);
      setExpandedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleAnalyzeMatrix = async () => {
    setError(null);
    try {
      const res = await ch3Api.imageKernel(mat);
      setImgKerResult(res);
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
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={mode === "vectors" ? "default" : "outline"}
          onClick={() => handleModeChange("vectors")}
        >
          Vectors Mode
        </Button>
        <Button
          size="sm"
          variant={mode === "matrix" ? "default" : "outline"}
          onClick={() => handleModeChange("matrix")}
        >
          Matrix Mode
        </Button>
      </div>

      {/* ─── Vectors Mode ─────────────────────────────── */}
      {mode === "vectors" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Set of Vectors</CardTitle>
              <CardDescription className="text-xs">
                Check if the vectors form a basis for their span, find the dimension, and extract a basis subset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4 items-center flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  Dimension (n):
                  <select
                    className="rounded border border-input bg-background px-2 py-1 text-sm"
                    value={dim}
                    onChange={(e) => handleDimChange(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  # Vectors:
                  <select
                    className="rounded border border-input bg-background px-2 py-1 text-sm"
                    value={numVecs}
                    onChange={(e) => handleNumVecsChange(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-4 flex-wrap">
                {vectors.map((vec, vi) => (
                  <div key={vi} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">v{vi + 1}</p>
                    <div className="flex flex-col gap-0.5">
                      {vec.map((comp, ci) => (
                        <input
                          key={ci}
                          className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                          value={comp}
                          onChange={(e) => vecCellChange(vi, ci, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button size="sm" onClick={handleAnalyzeVectors}>Analyze</Button>
            </CardContent>
          </Card>

          {basisResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Basis &amp; Dimension
                  <Badge variant={basisResult.isBasis ? "success" : "secondary"}>
                    {basisResult.isBasis ? "Already a basis" : "Not a basis (redundant vectors)"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-xs">
                  <span className="text-muted-foreground">Dimension of span</span>
                  <span className="font-mono">{basisResult.dimension}</span>
                  <span className="text-muted-foreground"># vectors given</span>
                  <span className="font-mono">{vectors.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">{basisResult.explanation}</p>

                <div className="flex gap-2 flex-wrap">
                  {vectors.map((_, i) => (
                    <Badge
                      key={i}
                      variant={basisResult.redundantIndices.includes(i) ? "destructive" : "success"}
                    >
                      v{i + 1}: {basisResult.redundantIndices.includes(i) ? "redundant" : "basis"}
                    </Badge>
                  ))}
                </div>

                {/* Show basis vectors */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Extracted basis:</p>
                  <div className="flex gap-4 flex-wrap">
                    {basisResult.basisVectors.map((vec, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">
                          v{basisResult.basisIndices[i] + 1}
                        </p>
                        <MatrixDisplay
                          matrix={vec.map((v) => [v])}
                          augmented={false}
                          numVars={1}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* RREF steps */}
                {basisResult.steps.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Steps ({basisResult.steps.length})
                    </p>
                    {basisResult.steps.map((step, i) => (
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
                              numVars={numVecs}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ─── Matrix Mode ─────────────────────────────── */}
      {mode === "matrix" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Matrix A ({mRows}×{nCols})</CardTitle>
              <CardDescription className="text-xs">
                Compute image basis, kernel basis, rank, nullity, and verify the rank-nullity theorem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4 items-center flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  Rows:
                  <select
                    className="rounded border border-input bg-background px-2 py-1 text-sm"
                    value={mRows}
                    onChange={(e) => handleMatSizeChange(Number(e.target.value), nCols)}
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
                    value={nCols}
                    onChange={(e) => handleMatSizeChange(mRows, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </label>
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
                            onChange={(e) => matCellChange(i, j, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <Button size="sm" onClick={handleAnalyzeMatrix}>Analyze</Button>
            </CardContent>
          </Card>

          {imgKerResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Image &amp; Kernel Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rank-Nullity */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-sm">
                  <span className="text-muted-foreground">rank(A)</span>
                  <span className="font-mono">{imgKerResult.rank}</span>
                  <span className="text-muted-foreground">nullity(A)</span>
                  <span className="font-mono">{imgKerResult.nullity}</span>
                  <span className="text-muted-foreground"># columns</span>
                  <span className="font-mono">{imgKerResult.numCols}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">{imgKerResult.rankNullityCheck}</p>

                {/* Image basis */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Image basis (dim = {imgKerResult.rank}):
                  </p>
                  {imgKerResult.imageBasis.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{"Image is {0}."}</p>
                  ) : (
                    <div className="flex gap-4 flex-wrap">
                      {imgKerResult.imageBasis.map((vec, i) => (
                        <MatrixDisplay
                          key={i}
                          matrix={vec.map((v) => [v])}
                          augmented={false}
                          numVars={1}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Kernel basis */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Kernel basis (dim = {imgKerResult.nullity}):
                  </p>
                  {imgKerResult.kernelBasis.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{"Kernel is {0}."}</p>
                  ) : (
                    <div className="flex gap-4 flex-wrap">
                      {imgKerResult.kernelBasis.map((vec, i) => (
                        <MatrixDisplay
                          key={i}
                          matrix={vec.map((v) => [v])}
                          augmented={false}
                          numVars={1}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Steps */}
                {imgKerResult.steps.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      RREF Steps ({imgKerResult.steps.length})
                    </p>
                    {imgKerResult.steps.map((step, i) => (
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
                              numVars={imgKerResult.numCols}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
