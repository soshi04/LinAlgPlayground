import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ch1Api } from "../api";
import type { SolveResponse } from "../types";

interface SolutionsPanelProps {
  matrix: string[][];
  augmented: boolean;
  numVars: number;
  numEqs: number;
}

export function SolutionsPanel({
  matrix,
  augmented,
  numVars,
  numEqs,
}: SolutionsPanelProps) {
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ch1Api.solve({ matrix, augmented, numVars, numEqs });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Solve failed");
    } finally {
      setLoading(false);
    }
  };

  const classificationBadge = () => {
    if (!result) return null;
    switch (result.classification) {
      case "unique":
        return <Badge variant="success">Unique Solution</Badge>;
      case "infinite":
        return <Badge variant="warning">Infinitely Many Solutions</Badge>;
      case "none":
        return <Badge variant="destructive">No Solution</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {!augmented && (
        <p className="text-sm text-muted-foreground">
          Solving requires an augmented matrix [A|b]. Enable the augmented toggle.
        </p>
      )}
      <Button onClick={handleSolve} disabled={loading || !augmented}>
        {loading ? "Solving…" : "Analyze / Solve"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Solution Analysis {classificationBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Rank info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm max-w-xs">
              <span className="text-muted-foreground">Equations (m)</span>
              <span className="font-mono">{result.numEqs}</span>
              <span className="text-muted-foreground">Variables (n)</span>
              <span className="font-mono">{result.numVars}</span>
              <span className="text-muted-foreground">rank(A)</span>
              <span className="font-mono">{result.rankA}</span>
              <span className="text-muted-foreground">rank([A|b])</span>
              <span className="font-mono">{result.rankAb}</span>
            </div>

            <Separator />

            {/* Unique solution */}
            {result.classification === "unique" && result.solution && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Solution</p>
                <div className="font-mono text-sm bg-muted/50 rounded p-3 space-y-0.5">
                  {result.solution.map((val, i) => (
                    <div key={i}>
                      x<sub>{i + 1}</sub> = {val}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infinite solutions */}
            {result.classification === "infinite" && result.parametricSolution && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Parametric Solution</p>
                <div className="font-mono text-sm bg-muted/50 rounded p-3 space-y-0.5">
                  {result.parametricSolution.expressions.map((expr) => (
                    <div
                      key={expr.variable}
                      className={expr.isFree ? "text-muted-foreground" : ""}
                    >
                      {expr.expression}
                      {expr.isFree && (
                        <span className="text-xs ml-2">(free)</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Free parameters:{" "}
                  {result.parametricSolution.freeVariables.join(", ")} (
                  {Object.entries(result.parametricSolution.parameterNames)
                    .map(([p, v]) => `${p} = ${v}`)
                    .join(", ")}
                  )
                </p>
              </div>
            )}

            {/* No solution */}
            {result.classification === "none" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Inconsistent System</p>
                <p className="text-sm text-muted-foreground">
                  {result.reason ?? "The system has no solution."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
