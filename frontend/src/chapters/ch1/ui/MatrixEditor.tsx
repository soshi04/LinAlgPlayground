import { Fragment, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: Record<
  string,
  { label: string; m: number; n: number; augmented: boolean; matrix: string[][] }
> = {
  "unique-2x2": {
    label: "Unique (2×2)",
    m: 2,
    n: 2,
    augmented: true,
    matrix: [
      ["2", "1", "5"],
      ["1", "-1", "1"],
    ],
  },
  "infinite-2x2": {
    label: "Infinite (2×2)",
    m: 2,
    n: 2,
    augmented: true,
    matrix: [
      ["1", "2", "3"],
      ["2", "4", "6"],
    ],
  },
  "none-2x2": {
    label: "No solution (2×2)",
    m: 2,
    n: 2,
    augmented: true,
    matrix: [
      ["1", "2", "3"],
      ["1", "2", "5"],
    ],
  },
  "unique-3x3": {
    label: "Unique (3×3)",
    m: 3,
    n: 3,
    augmented: true,
    matrix: [
      ["1", "1", "1", "6"],
      ["1", "2", "3", "14"],
      ["2", "1", "1", "7"],
    ],
  },
  "infinite-3x3": {
    label: "Infinite (3×3)",
    m: 3,
    n: 3,
    augmented: true,
    matrix: [
      ["1", "2", "3", "4"],
      ["2", "4", "6", "8"],
      ["0", "0", "0", "0"],
    ],
  },
  "none-3x3": {
    label: "No solution (3×3)",
    m: 3,
    n: 3,
    augmented: true,
    matrix: [
      ["1", "1", "1", "3"],
      ["0", "1", "2", "5"],
      ["1", "2", "3", "9"],
    ],
  },
};

// ── Validation helper ───────────────────────────────────────────────────────

function isValidEntry(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (/^-?\d+$/.test(t)) return true;
  if (/^-?\d+(\.\d+)?$/.test(t)) return true;
  if (/^-?\d+\s*\/\s*-?\d+$/.test(t)) return true;
  return false;
}

// ── Component ───────────────────────────────────────────────────────────────

interface MatrixEditorProps {
  matrix: string[][];
  m: number;
  n: number;
  augmented: boolean;
  onMatrixChange: (matrix: string[][]) => void;
  onReset: (m: number, n: number, augmented: boolean, matrix?: string[][]) => void;
}

export function MatrixEditor({
  matrix,
  m,
  n,
  augmented,
  onMatrixChange,
  onReset,
}: MatrixEditorProps) {
  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      const next = matrix.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : [...r]
      );
      onMatrixChange(next);
    },
    [matrix, onMatrixChange]
  );

  const handlePreset = (key: string) => {
    const p = PRESETS[key];
    if (p) onReset(p.m, p.n, p.augmented, p.matrix);
  };

  const handleRandom = () => {
    const cols = augmented ? n + 1 : n;
    const mat = Array.from({ length: m }, () =>
      Array.from({ length: cols }, () => String(Math.floor(Math.random() * 11) - 5))
    );
    onReset(m, n, augmented, mat);
  };

  const totalCols = matrix[0]?.length ?? (augmented ? n + 1 : n);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">System Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            Equations (m)
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={m}
              onChange={(e) => onReset(Number(e.target.value), n, augmented)}
            >
              {[2, 3, 4, 5, 6].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            Variables (n)
            <select
              className="rounded border border-input bg-background px-2 py-1 text-sm"
              value={n}
              onChange={(e) => onReset(m, Number(e.target.value), augmented)}
            >
              {[2, 3, 4, 5, 6].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={augmented}
              onChange={(e) => onReset(m, n, e.target.checked)}
              className="accent-primary"
            />
            Augmented [A|b]
          </label>

          <select
            className="rounded border border-input bg-background px-2 py-1 text-sm"
            value=""
            onChange={(e) => {
              if (e.target.value) handlePreset(e.target.value);
            }}
          >
            <option value="">Load preset…</option>
            {Object.entries(PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleRandom}>
            Random
          </Button>
        </div>

        {/* Matrix grid */}
        <div className="overflow-x-auto">
          <table className="border-collapse">
            {/* header */}
            <thead>
              <tr>
                {Array.from({ length: totalCols }, (_, j) => (
                  <Fragment key={j}>
                    {augmented && j === n && (
                      <th className="px-1 text-muted-foreground/40 select-none">│</th>
                    )}
                    <th className="px-1 pb-1 text-xs text-muted-foreground font-normal">
                      {augmented && j === n ? "b" : `x${j + 1}`}
                    </th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const valid = isValidEntry(cell);
                    return (
                      <Fragment key={j}>
                        {augmented && j === n && (
                          <td className="px-1 text-muted-foreground/40 select-none text-center">
                            │
                          </td>
                        )}
                        <td className="px-0.5 py-0.5">
                          <input
                            className={cn(
                              "w-16 h-8 rounded border bg-background px-2 py-1 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                              !valid && "border-red-500 bg-red-50"
                            )}
                            value={cell}
                            onChange={(e) => handleCellChange(i, j, e.target.value)}
                            placeholder="0"
                          />
                        </td>
                      </Fragment>
                    );
                  })}
                  <td className="pl-2 text-xs text-muted-foreground select-none">
                    R{i + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Enter integers (3), decimals (0.25), or fractions (7/3). Negative values
          supported.
        </p>
      </CardContent>
    </Card>
  );
}
