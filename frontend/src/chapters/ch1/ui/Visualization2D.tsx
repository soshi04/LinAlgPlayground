import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ch1Api } from "../api";
import type { SolveResponse } from "../types";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7", "#f97316", "#06b6d4"];
const W = 480;
const H = 400;
const MG = { t: 20, r: 20, b: 30, l: 40 };
const PW = W - MG.l - MG.r;
const PH = H - MG.t - MG.b;

function parseFrac(s: string): number {
  const t = s.trim();
  if (t.includes("/")) {
    const [n, d] = t.split("/").map(Number);
    return d ? n / d : NaN;
  }
  return Number(t);
}

interface Line {
  a: number;
  b: number;
  c: number;
  label: string;
  color: string;
}

interface Visualization2DProps {
  matrix: string[][];
  numVars: number;
  augmented: boolean;
  numEqs: number;
}

export function Visualization2D({
  matrix,
  numVars,
  augmented,
  numEqs,
}: Visualization2DProps) {
  const [solveResult, setSolveResult] = useState<SolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plotted, setPlotted] = useState(false);

  if (numVars !== 2 || !augmented) {
    return (
      <p className="text-sm text-muted-foreground">
        Visualization is only available for 2-variable augmented systems.
      </p>
    );
  }

  const lines: Line[] = matrix.slice(0, numEqs).map((row, i) => ({
    a: parseFrac(row[0]),
    b: parseFrac(row[1]),
    c: parseFrac(row[2]),
    label: `L${i + 1}`,
    color: COLORS[i % COLORS.length],
  }));

  // Determine view range
  let solution: [number, number] | null = null;
  if (solveResult?.classification === "unique" && solveResult.solution) {
    solution = [parseFrac(solveResult.solution[0]), parseFrac(solveResult.solution[1])];
  }

  let xMin = -10,
    xMax = 10,
    yMin = -10,
    yMax = 10;
  if (solution) {
    const pad = Math.max(5, Math.max(Math.abs(solution[0]), Math.abs(solution[1])) * 1.5);
    xMin = solution[0] - pad;
    xMax = solution[0] + pad;
    yMin = solution[1] - pad;
    yMax = solution[1] + pad;
  }

  const toX = (mx: number) => MG.l + ((mx - xMin) / (xMax - xMin)) * PW;
  const toY = (my: number) => MG.t + PH - ((my - yMin) / (yMax - yMin)) * PH;

  const handlePlot = async () => {
    setError(null);
    try {
      const res = await ch1Api.solve({ matrix, augmented, numVars, numEqs });
      setSolveResult(res);
      setPlotted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to solve");
      setPlotted(true);
    }
  };

  // Compute line segments
  const lineSegments = lines.map((line) => {
    if (line.b !== 0) {
      const y1 = (line.c - line.a * xMin) / line.b;
      const y2 = (line.c - line.a * xMax) / line.b;
      return {
        ...line,
        x1: toX(xMin),
        y1: toY(y1),
        x2: toX(xMax),
        y2: toY(y2),
        isVertical: false,
      };
    } else if (line.a !== 0) {
      const x = line.c / line.a;
      return {
        ...line,
        x1: toX(x),
        y1: toY(yMin),
        x2: toX(x),
        y2: toY(yMax),
        isVertical: true,
      };
    }
    return null; // degenerate (0x + 0y = c)
  });

  // Grid ticks
  const xTicks: number[] = [];
  for (let v = Math.ceil(xMin); v <= Math.floor(xMax); v++) xTicks.push(v);
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin); v <= Math.floor(yMax); v++) yTicks.push(v);

  return (
    <div className="space-y-4">
      <Button onClick={handlePlot}>Plot</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {plotted && (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">2-Variable Plot</CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg border rounded bg-white">
                <defs>
                  <clipPath id="plotClip">
                    <rect x={MG.l} y={MG.t} width={PW} height={PH} />
                  </clipPath>
                </defs>

                {/* Grid */}
                <g opacity={0.15}>
                  {xTicks.map((v) => (
                    <line
                      key={`gx${v}`}
                      x1={toX(v)}
                      y1={MG.t}
                      x2={toX(v)}
                      y2={MG.t + PH}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  ))}
                  {yTicks.map((v) => (
                    <line
                      key={`gy${v}`}
                      x1={MG.l}
                      y1={toY(v)}
                      x2={MG.l + PW}
                      y2={toY(v)}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  ))}
                </g>

                {/* Axes */}
                {yMin <= 0 && yMax >= 0 && (
                  <line
                    x1={MG.l}
                    y1={toY(0)}
                    x2={MG.l + PW}
                    y2={toY(0)}
                    stroke="#666"
                    strokeWidth="1"
                  />
                )}
                {xMin <= 0 && xMax >= 0 && (
                  <line
                    x1={toX(0)}
                    y1={MG.t}
                    x2={toX(0)}
                    y2={MG.t + PH}
                    stroke="#666"
                    strokeWidth="1"
                  />
                )}

                {/* Tick labels */}
                {xTicks
                  .filter((v) => v !== 0)
                  .map((v) => (
                    <text
                      key={`tx${v}`}
                      x={toX(v)}
                      y={MG.t + PH + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#666"
                    >
                      {v}
                    </text>
                  ))}
                {yTicks
                  .filter((v) => v !== 0)
                  .map((v) => (
                    <text
                      key={`ty${v}`}
                      x={MG.l - 6}
                      y={toY(v) + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#666"
                    >
                      {v}
                    </text>
                  ))}

                {/* Lines */}
                <g clipPath="url(#plotClip)">
                  {lineSegments.map(
                    (seg, i) =>
                      seg && (
                        <line
                          key={i}
                          x1={seg.x1}
                          y1={seg.y1}
                          x2={seg.x2}
                          y2={seg.y2}
                          stroke={seg.color}
                          strokeWidth="2"
                        />
                      )
                  )}

                  {/* Intersection point */}
                  {solution && (
                    <circle
                      cx={toX(solution[0])}
                      cy={toY(solution[1])}
                      r="5"
                      fill="#dc2626"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  )}
                </g>

                {/* Axis labels */}
                <text x={MG.l + PW + 6} y={toY(0) + 4} fontSize="11" fill="#333">
                  x
                </text>
                <text x={toX(0) - 4} y={MG.t - 6} fontSize="11" fill="#333" textAnchor="end">
                  y
                </text>
              </svg>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-sm">
            {lines.map((line, i) => {
              const { a, b, c } = line;
              const parts: string[] = [];
              if (a !== 0) parts.push(`${a === 1 ? "" : a === -1 ? "−" : a}x`);
              if (b !== 0) {
                const sign = b > 0 && parts.length ? " + " : b < 0 ? " − " : "";
                const bv = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
                parts.push(`${sign}${bv}y`);
              }
              const eq = `${parts.join("") || "0"} = ${c}`;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: line.color }}
                  />
                  <span className="font-mono text-xs">{line.label}: {eq}</span>
                </span>
              );
            })}
          </div>

          {/* Classification note */}
          {solveResult && (
            <p className="text-sm text-muted-foreground">
              {solveResult.classification === "unique" &&
                solution &&
                `Unique intersection at (${solution[0].toFixed(3)}, ${solution[1].toFixed(3)})`}
              {solveResult.classification === "infinite" &&
                "The lines are coincident (same line) — infinitely many solutions"}
              {solveResult.classification === "none" &&
                "The lines are parallel — no intersection"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
