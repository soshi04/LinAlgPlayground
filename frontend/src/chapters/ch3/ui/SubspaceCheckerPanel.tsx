import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ch3Api } from "../api";
import type { LinearIndependenceResponse, VectorInSpanResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

function makeZeroVectors(k: number, dim: number): string[][] {
  return Array.from({ length: k }, () => Array(dim).fill("0"));
}

export function SubspaceCheckerPanel() {
  const [dim, setDim] = useState(3);
  const [numVecs, setNumVecs] = useState(3);
  const [vectors, setVectors] = useState<string[][]>(makeZeroVectors(3, 3));
  const [target, setTarget] = useState<string[]>(Array(3).fill("0"));

  const [indepResult, setIndepResult] = useState<LinearIndependenceResponse | null>(null);
  const [spanResult, setSpanResult] = useState<VectorInSpanResponse | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [activeResult, setActiveResult] = useState<"indep" | "span" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    setVectors(makeZeroVectors(numVecs, newDim));
    setTarget(Array(newDim).fill("0"));
    clearResults();
  };

  const handleNumVecsChange = (newK: number) => {
    setNumVecs(newK);
    setVectors(makeZeroVectors(newK, dim));
    clearResults();
  };

  const clearResults = () => {
    setIndepResult(null);
    setSpanResult(null);
    setActiveResult(null);
  };

  const vecCellChange = (vecIdx: number, compIdx: number, val: string) => {
    const next = vectors.map((v) => [...v]);
    next[vecIdx][compIdx] = val;
    setVectors(next);
  };

  const targetCellChange = (compIdx: number, val: string) => {
    const next = [...target];
    next[compIdx] = val;
    setTarget(next);
  };

  const handleCheckIndependence = async () => {
    setError(null);
    try {
      const res = await ch3Api.linearIndependence(vectors);
      setIndepResult(res);
      setActiveResult("indep");
      setExpandedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleCheckSpan = async () => {
    setError(null);
    try {
      const res = await ch3Api.vectorInSpan(vectors, target);
      setSpanResult(res);
      setActiveResult("span");
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

  const currentSteps =
    activeResult === "indep"
      ? indepResult?.steps
      : activeResult === "span"
        ? spanResult?.steps
        : undefined;
  const stepsNumVars = activeResult === "span" ? numVecs : numVecs;

  return (
    <div className="space-y-6">
      {/* Vector input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vectors in R{dim}</CardTitle>
          <CardDescription className="text-xs">
            Enter vectors to check linear independence or whether a target vector is in their span.
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

          {/* Vector grid: each vector as a column */}
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

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={handleCheckIndependence}>
              Check Independence
            </Button>
            <Button size="sm" variant="outline" onClick={handleCheckSpan}>
              Is target in Span?
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Target vector for span check */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Target Vector (for span check)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">b =</span>
            <div className="flex gap-0.5">
              {target.map((comp, ci) => (
                <input
                  key={ci}
                  className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                  value={comp}
                  onChange={(e) => targetCellChange(ci, e.target.value)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Independence result */}
      {indepResult && activeResult === "indep" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Linear Independence
              <Badge variant={indepResult.independent ? "success" : "destructive"}>
                {indepResult.independent ? "Independent" : "Dependent"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-xs">
              <span className="text-muted-foreground">rank</span>
              <span className="font-mono">{indepResult.rank}</span>
              <span className="text-muted-foreground"># vectors</span>
              <span className="font-mono">{indepResult.numVectors}</span>
            </div>
            <p className="text-sm text-muted-foreground">{indepResult.explanation}</p>

            {indepResult.redundantIndices.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {vectors.map((_, i) => (
                  <Badge
                    key={i}
                    variant={indepResult.redundantIndices.includes(i) ? "destructive" : "success"}
                  >
                    v{i + 1}: {indepResult.redundantIndices.includes(i) ? "redundant" : "basis"}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Span result */}
      {spanResult && activeResult === "span" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Vector in Span?
              <Badge variant={spanResult.inSpan ? "success" : "destructive"}>
                {spanResult.inSpan ? "Yes — in span" : "Not in span"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{spanResult.explanation}</p>
            {spanResult.inSpan && spanResult.coefficients && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Coefficients:</p>
                <div className="flex gap-3 flex-wrap text-sm font-mono">
                  {spanResult.coefficients.map((c, i) => (
                    <span key={i}>
                      c{i + 1} = {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shared RREF steps */}
      {currentSteps && currentSteps.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">RREF Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {currentSteps.map((step, i) => (
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
                        augmented={activeResult === "span"}
                        numVars={stepsNumVars}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
