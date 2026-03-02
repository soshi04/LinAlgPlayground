import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ch1Api } from "../api";
import { MatrixDisplay } from "./MatrixDisplay";
import type { RrefResponse } from "../types";

interface RrefPanelProps {
  matrix: string[][];
  augmented: boolean;
  numVars: number;
  numEqs: number;
  onUseRref: (rrefMatrix: string[][]) => void;
}

export function RrefPanel({
  matrix,
  augmented,
  numVars,
  numEqs,
  onUseRref,
}: RrefPanelProps) {
  const [result, setResult] = useState<RrefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const handleCompute = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ch1Api.computeRref({ matrix, augmented, numVars, numEqs });
      setResult(res);
      setExpandedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "RREF computation failed");
    } finally {
      setLoading(false);
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={handleCompute} disabled={loading}>
          {loading ? "Computing…" : "Compute RREF"}
        </Button>
        {result && (
          <Button variant="outline" onClick={() => onUseRref(result.rref)}>
            Use RREF as current state
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* RREF result */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Reduced Row Echelon Form</CardTitle>
              <CardDescription className="text-xs">
                Rank = {result.rank} · Pivot columns:{" "}
                {result.pivotColumns.map((c) => c + 1).join(", ") || "none"} · Free
                variable columns:{" "}
                {result.freeVarColumns.map((c) => c + 1).join(", ") || "none"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatrixDisplay
                matrix={result.rref}
                augmented={augmented}
                numVars={numVars}
                pivotColumns={result.pivotColumns}
              />
            </CardContent>
          </Card>

          {/* Steps */}
          {result.steps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Algorithm Steps ({result.steps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
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
                        <>
                          <Separator />
                          <div className="px-3 py-2">
                            <MatrixDisplay
                              matrix={step.matrix}
                              augmented={augmented}
                              numVars={numVars}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
