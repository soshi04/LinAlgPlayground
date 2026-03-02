import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ch1Api } from "../api";
import { MatrixDisplay } from "./MatrixDisplay";
import type { HistoryEntry, HintResponse, RowOp } from "../types";

interface RowOpsPanelProps {
  matrix: string[][];
  m: number;
  n: number;
  augmented: boolean;
  onApplyOp: (newMatrix: string[][], description: string) => void;
  history: HistoryEntry[];
  historyIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onJump: (index: number) => void;
}

type OpKind = "swap" | "scale" | "add";

export function RowOpsPanel({
  matrix,
  m,
  n,
  augmented,
  onApplyOp,
  history,
  historyIndex,
  onUndo,
  onRedo,
  onJump,
}: RowOpsPanelProps) {
  const [opKind, setOpKind] = useState<OpKind>("swap");
  const [r1, setR1] = useState(0);
  const [r2, setR2] = useState(1);
  const [scaleR, setScaleR] = useState(0);
  const [scaleK, setScaleK] = useState("1");
  const [addTarget, setAddTarget] = useState(0);
  const [addSource, setAddSource] = useState(1);
  const [addK, setAddK] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<HintResponse | null>(null);

  const payload = () => ({ matrix, augmented, numVars: n, numEqs: m });

  const buildOp = (): RowOp => {
    switch (opKind) {
      case "swap":
        return { kind: "swap", r1, r2 };
      case "scale":
        return { kind: "scale", r: scaleR, k: scaleK };
      case "add":
        return { kind: "add", target: addTarget, source: addSource, k: addK };
    }
  };

  const handleApply = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ch1Api.applyRowOp({ ...payload(), operation: buildOp() });
      onApplyOp(res.matrix, res.description);
      setHint(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleHint = async () => {
    setError(null);
    try {
      const res = await ch1Api.nextStepHint(payload());
      setHint(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get hint");
    }
  };

  const handleApplyHint = async () => {
    if (!hint?.operation) return;
    setError(null);
    setLoading(true);
    try {
      const res = await ch1Api.applyRowOp({ ...payload(), operation: hint.operation });
      onApplyOp(res.matrix, res.description);
      setHint(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply hint");
    } finally {
      setLoading(false);
    }
  };

  const rowOpts = Array.from({ length: m }, (_, i) => i);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* Left: matrix + controls */}
      <div className="space-y-4">
        {/* Current matrix */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <MatrixDisplay matrix={matrix} augmented={augmented} numVars={n} />
          </CardContent>
        </Card>

        {/* Operation controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Row Operation</CardTitle>
            <CardDescription className="text-xs">
              Row operations preserve the solution set.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              {(["swap", "scale", "add"] as const).map((k) => (
                <Button
                  key={k}
                  variant={opKind === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOpKind(k)}
                >
                  {k === "swap" ? "Swap" : k === "scale" ? "Scale" : "Add multiple"}
                </Button>
              ))}
            </div>

            {opKind === "swap" && (
              <div className="flex items-center gap-2 text-sm">
                <span>Swap</span>
                <RowSelect value={r1} onChange={setR1} rows={rowOpts} />
                <span>↔</span>
                <RowSelect value={r2} onChange={setR2} rows={rowOpts} />
              </div>
            )}

            {opKind === "scale" && (
              <div className="flex items-center gap-2 text-sm">
                <RowSelect value={scaleR} onChange={setScaleR} rows={rowOpts} />
                <span>←</span>
                <input
                  className="w-16 h-8 rounded border border-input bg-background px-2 py-1 text-center font-mono text-sm"
                  value={scaleK}
                  onChange={(e) => setScaleK(e.target.value)}
                  placeholder="k"
                />
                <span>
                  · R{scaleR + 1}
                </span>
              </div>
            )}

            {opKind === "add" && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <RowSelect value={addTarget} onChange={setAddTarget} rows={rowOpts} />
                <span>←</span>
                <span>R{addTarget + 1} +</span>
                <input
                  className="w-16 h-8 rounded border border-input bg-background px-2 py-1 text-center font-mono text-sm"
                  value={addK}
                  onChange={(e) => setAddK(e.target.value)}
                  placeholder="k"
                />
                <span>·</span>
                <RowSelect value={addSource} onChange={setAddSource} rows={rowOpts} />
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleApply} disabled={loading}>
                {loading ? "Applying…" : "Apply"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleHint}>
                Hint
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {hint && (
              <div className="rounded border bg-muted/50 p-3 text-sm space-y-2">
                <p className="font-medium">Suggested step</p>
                <p className="text-muted-foreground">{hint.explanation}</p>
                {hint.operation && (
                  <Button size="sm" variant="outline" onClick={handleApplyHint}>
                    Apply this hint
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: history sidebar */}
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={historyIndex <= 0}
              onClick={onUndo}
            >
              ↩ Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={historyIndex >= history.length - 1}
              onClick={onRedo}
            >
              Redo ↪
            </Button>
          </div>
          <Separator />
          <ScrollArea className="max-h-64">
            <div className="space-y-0.5">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1 rounded truncate",
                    i === historyIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {i}. {entry.description}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Row selector helper ─────────────────────────────────────────────────────

function RowSelect({
  value,
  onChange,
  rows,
}: {
  value: number;
  onChange: (v: number) => void;
  rows: number[];
}) {
  return (
    <select
      className="rounded border border-input bg-background px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {rows.map((r) => (
        <option key={r} value={r}>
          R{r + 1}
        </option>
      ))}
    </select>
  );
}
