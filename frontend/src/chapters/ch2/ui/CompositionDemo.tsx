import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ch2Api } from "../api";
import type { Compose2DResponse, TransformPresetInfo } from "../types";
import { Canvas2D, buildTransformedGrid } from "./Canvas2D";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

const SAMPLE_VECS: string[][] = [["1", "0"], ["0", "1"], ["1", "1"]];

export function CompositionDemo() {
  const [presets, setPresets] = useState<TransformPresetInfo[]>([]);

  const [presetA, setPresetA] = useState("rotation");
  const [paramsA, setParamsA] = useState<Record<string, number>>({ angle: 45 });
  const [presetB, setPresetB] = useState("scaling");
  const [paramsB, setParamsB] = useState<Record<string, number>>({ sx: 2, sy: 1 });

  const [matA, setMatA] = useState<string[][] | null>(null);
  const [matB, setMatB] = useState<string[][] | null>(null);

  const [result, setResult] = useState<Compose2DResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"AB" | "BA">("AB");

  useEffect(() => {
    ch2Api.metadata().then((r) => setPresets(r.presets)).catch(() => {});
  }, []);

  const computeMatrices = async () => {
    try {
      const resA = await ch2Api.applyTransform2D({ preset: presetA, params: paramsA, vectors: [["1", "0"]] });
      const resB = await ch2Api.applyTransform2D({ preset: presetB, params: paramsB, vectors: [["1", "0"]] });
      setMatA(resA.matrix);
      setMatB(resB.matrix);
      return { A: resA.matrix, B: resB.matrix };
    } catch {
      return null;
    }
  };

  const handleCompute = async () => {
    setError(null);
    const mats = await computeMatrices();
    if (!mats) { setError("Failed to build matrices"); return; }
    try {
      const res = await ch2Api.compose2D({ A: mats.A, B: mats.B, vectors: SAMPLE_VECS });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Composition failed");
    }
  };

  useEffect(() => {
    handleCompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetA, paramsA, presetB, paramsB]);

  const curFloat = view === "AB" ? result?.ABFloat : result?.BAFloat;
  const curPts = view === "AB" ? result?.pointsAB : result?.pointsBA;
  const gridLines = curFloat ? buildTransformedGrid(curFloat) : [];

  const colors = ["#3b82f6", "#ef4444", "#22c55e"];
  const origArrows = SAMPLE_VECS.map((v, i) => ({
    x: Number(v[0]), y: Number(v[1]),
    color: colors[i], label: i < 2 ? `e${i + 1}` : "(1,1)", dashed: true,
  }));
  const transArrows = curPts
    ? curPts.map((v, i) => ({ x: v[0], y: v[1], color: colors[i], label: `${view}(v${i + 1})` }))
    : [];

  const schemaFor = (id: string) => presets.find((p) => p.id === id);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Transform A */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transform A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <select
              className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
              value={presetA}
              onChange={(e) => {
                setPresetA(e.target.value);
                const p = presets.find((pr) => pr.id === e.target.value);
                if (p) setParamsA(p.defaultParams);
              }}
            >
              {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {schemaFor(presetA)?.paramsSchema.map((ps) => (
              <label key={ps.name} className="block text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span>{ps.label}:</span>
                  <input
                    type="number"
                    min={ps.min}
                    max={ps.max}
                    step={ps.step}
                    value={paramsA[ps.name] ?? ps.default}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v)) setParamsA((p) => ({ ...p, [ps.name]: Math.min(ps.max, Math.max(ps.min, v)) }));
                    }}
                    className="w-20 h-7 rounded border border-input bg-background px-2 text-sm font-semibold text-right font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <input
                  type="range" min={ps.min} max={ps.max} step={ps.step}
                  value={paramsA[ps.name] ?? ps.default}
                  onChange={(e) => setParamsA((p) => ({ ...p, [ps.name]: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </label>
            ))}
            {matA && <MatrixDisplay matrix={matA} augmented={false} numVars={2} />}
          </CardContent>
        </Card>

        {/* Transform B */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transform B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <select
              className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
              value={presetB}
              onChange={(e) => {
                setPresetB(e.target.value);
                const p = presets.find((pr) => pr.id === e.target.value);
                if (p) setParamsB(p.defaultParams);
              }}
            >
              {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {schemaFor(presetB)?.paramsSchema.map((ps) => (
              <label key={ps.name} className="block text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span>{ps.label}:</span>
                  <input
                    type="number"
                    min={ps.min}
                    max={ps.max}
                    step={ps.step}
                    value={paramsB[ps.name] ?? ps.default}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v)) setParamsB((p) => ({ ...p, [ps.name]: Math.min(ps.max, Math.max(ps.min, v)) }));
                    }}
                    className="w-20 h-7 rounded border border-input bg-background px-2 text-sm font-semibold text-right font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <input
                  type="range" min={ps.min} max={ps.max} step={ps.step}
                  value={paramsB[ps.name] ?? ps.default}
                  onChange={(e) => setParamsB((p) => ({ ...p, [ps.name]: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </label>
            ))}
            {matB && <MatrixDisplay matrix={matB} augmented={false} numVars={2} />}
          </CardContent>
        </Card>
      </div>

      {/* Commutation badge + view toggle */}
      {result && (
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={result.commute ? "success" : "outline"}>
            {result.commute ? "AB = BA (commute)" : "AB ≠ BA (do NOT commute)"}
          </Badge>
          <div className="flex gap-1">
            <Button size="sm" variant={view === "AB" ? "default" : "outline"} onClick={() => setView("AB")}>
              Show AB
            </Button>
            <Button size="sm" variant={view === "BA" ? "default" : "outline"} onClick={() => setView("BA")}>
              Show BA
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Canvas2D
            width={420}
            height={420}
            arrows={origArrows}
            transformedArrows={transArrows}
            gridLines={gridLines}
          />
          <div className="space-y-3 min-w-0">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">AB (apply B then A)</p>
              <MatrixDisplay matrix={result.AB} augmented={false} numVars={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">BA (apply A then B)</p>
              <MatrixDisplay matrix={result.BA} augmented={false} numVars={2} />
            </div>
            <p className="text-xs text-muted-foreground">{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
