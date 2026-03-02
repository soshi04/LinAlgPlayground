import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ch2Api } from "../api";
import type { MatrixProductResponse } from "../types";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

function makeEmpty(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => "0"));
}

export function MatrixMultiplyIntuition() {
  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(2);

  const [matA, setMatA] = useState(makeEmpty(2, 3));
  const [matB, setMatB] = useState(makeEmpty(3, 2));

  const [order, setOrder] = useState<"AB" | "BA">("AB");
  const [result, setResult] = useState<MatrixProductResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDimsChange = (rA: number, cA: number, rB: number, cB: number) => {
    setRowsA(rA); setColsA(cA); setRowsB(rB); setColsB(cB);
    setMatA(makeEmpty(rA, cA));
    setMatB(makeEmpty(rB, cB));
    setResult(null);
  };

  const cellChange = (
    mat: string[][], setMat: (m: string[][]) => void,
    r: number, c: number, val: string
  ) => {
    const next = mat.map((row) => [...row]);
    next[r][c] = val;
    setMat(next);
  };

  const handleCompute = async () => {
    setError(null);
    try {
      const res = await ch2Api.matrixProduct({ A: matA, B: matB, order });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const dimSelect = (val: number, onChange: (n: number) => void) => (
    <select
      className="rounded border border-input bg-background px-2 py-1 text-sm w-14"
      value={val}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {[1, 2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      {/* A) Dimension constraint checker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dimension Constraint Checker</CardTitle>
          <CardDescription className="text-xs">
            AB is defined only when #cols(A) = #rows(B). The result is #rows(A) × #cols(B).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span>A:</span>
            {dimSelect(rowsA, (n) => handleDimsChange(n, colsA, rowsB, colsB))}
            <span>×</span>
            {dimSelect(colsA, (n) => handleDimsChange(rowsA, n, rowsB, colsB))}

            <span className="ml-4">B:</span>
            {dimSelect(rowsB, (n) => handleDimsChange(rowsA, colsA, n, colsB))}
            <span>×</span>
            {dimSelect(colsB, (n) => handleDimsChange(rowsA, colsA, rowsB, n))}

            <Badge variant={colsA === rowsB ? "success" : "destructive"} className="ml-2">
              {colsA === rowsB
                ? `AB defined → ${rowsA}×${colsB}`
                : `AB not defined (${colsA} ≠ ${rowsB})`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* B) Enter matrices + compute */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Matrix A ({rowsA}×{colsA})</CardTitle></CardHeader>
          <CardContent>
            <table className="border-collapse">
              <tbody>
                {matA.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-0.5">
                        <input
                          className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                          value={cell}
                          onChange={(e) => cellChange(matA, setMatA, i, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Matrix B ({rowsB}×{colsB})</CardTitle></CardHeader>
          <CardContent>
            <table className="border-collapse">
              <tbody>
                {matB.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-0.5">
                        <input
                          className="w-14 h-7 rounded border border-input bg-background px-1 text-center font-mono text-sm"
                          value={cell}
                          onChange={(e) => cellChange(matB, setMatB, i, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" variant={order === "AB" ? "default" : "outline"} onClick={() => setOrder("AB")}>
          Compute AB
        </Button>
        <Button size="sm" variant={order === "BA" ? "default" : "outline"} onClick={() => setOrder("BA")}>
          Compute BA
        </Button>
        <Button onClick={handleCompute}>Go</Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{result.dimensionExplanation}</p>
            {result.defined && result.product ? (
              <>
                <MatrixDisplay matrix={result.product} augmented={false} numVars={result.product[0].length} />
                {result.columnsOfFirst && result.mappedColumns && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Column interpretation: each column of the product = first matrix × column of second matrix
                      </p>
                      <div className="flex gap-4 flex-wrap text-xs font-mono">
                        {result.mappedColumns.map((col, i) => (
                          <div key={i} className="bg-muted/50 rounded p-2">
                            col {i + 1} of {order}: [{col.join(", ")}]
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-red-600">{result.reason}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* C) Associativity / distributivity callout */}
      <Separator />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Properties of Matrix Multiplication</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><strong>Associative:</strong> A(BC) = (AB)C — you can group multiplications freely.</p>
          <p><strong>Distributive:</strong> A(B + C) = AB + AC and (A + B)C = AC + BC.</p>
          <p><strong>NOT commutative:</strong> In general AB ≠ BA. Order matters!</p>
        </CardContent>
      </Card>
    </div>
  );
}
