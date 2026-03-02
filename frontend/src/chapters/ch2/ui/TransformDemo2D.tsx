import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ch2Api } from "../api";
import type { ApplyTransform2DResponse, TransformPresetInfo } from "../types";
import { Canvas2D, buildTransformedGrid } from "./Canvas2D";
import { MatrixDisplay } from "@/chapters/ch1/ui/MatrixDisplay";

const DEFAULT_VECTORS: string[][] = [
  ["1", "0"],
  ["0", "1"],
  ["1", "1"],
];

export function TransformDemo2D() {
  const [presets, setPresets] = useState<TransformPresetInfo[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("rotation");
  const [params, setParams] = useState<Record<string, number>>({ angle: 45 });
  const [useCustom, setUseCustom] = useState(false);
  const [customMatrix, setCustomMatrix] = useState([["1", "0"], ["0", "1"]]);
  const [result, setResult] = useState<ApplyTransform2DResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    ch2Api.metadata().then((r) => {
      setPresets(r.presets);
      const first = r.presets[0];
      if (first) {
        setSelectedPreset(first.id);
        setParams(first.defaultParams);
      }
    }).catch(() => {});
  }, []);

  const currentSchema = presets.find((p) => p.id === selectedPreset);

  const handlePresetChange = (id: string) => {
    setSelectedPreset(id);
    const p = presets.find((pr) => pr.id === id);
    if (p) setParams(p.defaultParams);
    setUseCustom(false);
  };

  const handleApply = async () => {
    setError(null);
    try {
      const req = useCustom
        ? { matrix: customMatrix, vectors: DEFAULT_VECTORS }
        : { preset: selectedPreset, params, vectors: DEFAULT_VECTORS };
      const res = await ch2Api.applyTransform2D(req);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  // Auto-apply on param change
  useEffect(() => {
    handleApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset, params, useCustom, customMatrix]);

  const colors = ["#3b82f6", "#ef4444", "#22c55e"];
  const origArrows = DEFAULT_VECTORS.map((v, i) => ({
    x: Number(v[0]),
    y: Number(v[1]),
    color: colors[i % colors.length],
    label: `e${i + 1}${i === 2 ? "=(1,1)" : ""}`,
    dashed: true,
  }));

  const transArrows = result
    ? result.transformedVectorsFloat.map((v, i) => ({
        x: v[0],
        y: v[1],
        color: colors[i % colors.length],
        label: `T(v${i + 1})`,
      }))
    : [];

  const gridLines = result ? buildTransformedGrid(result.matrixFloat) : [];

  const projReflLine =
    (selectedPreset === "projection" || selectedPreset === "reflection") && !useCustom
      ? (() => {
          const a = ((params.angle ?? 0) * Math.PI) / 180;
          const len = 6;
          return [
            {
              x1: -len * Math.cos(a),
              y1: -len * Math.sin(a),
              x2: len * Math.cos(a),
              y2: len * Math.sin(a),
              color: "#a855f7",
            },
          ];
        })()
      : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transform Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="accent-primary"
              />
              Custom 2×2 matrix
            </label>

            {useCustom ? (
              <div className="space-y-1">
                {[0, 1].map((r) => (
                  <div key={r} className="flex gap-1">
                    {[0, 1].map((c) => (
                      <input
                        key={c}
                        className="w-16 h-8 rounded border border-input bg-background px-2 text-center font-mono text-sm"
                        value={customMatrix[r][c]}
                        onChange={(e) => {
                          const m = customMatrix.map((row) => [...row]);
                          m[r][c] = e.target.value;
                          setCustomMatrix(m);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <select
                  className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {currentSchema && (
                  <p className="text-xs text-muted-foreground">
                    {currentSchema.description}
                  </p>
                )}

                {currentSchema?.paramsSchema.map((ps) => (
                  <label key={ps.name} className="block text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span>{ps.label}:</span>
                      <input
                        type="number"
                        min={ps.min}
                        max={ps.max}
                        step={ps.step}
                        value={params[ps.name] ?? ps.default}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) setParams((p) => ({ ...p, [ps.name]: Math.min(ps.max, Math.max(ps.min, v)) }));
                        }}
                        className="w-20 h-7 rounded border border-input bg-background px-2 text-sm font-semibold text-right font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <input
                      type="range"
                      min={ps.min}
                      max={ps.max}
                      step={ps.step}
                      value={params[ps.name] ?? ps.default}
                      onChange={(e) =>
                        setParams((p) => ({ ...p, [ps.name]: Number(e.target.value) }))
                      }
                      className="w-full accent-primary"
                    />
                  </label>
                ))}
              </>
            )}

            <Button size="sm" variant="outline" onClick={handleApply}>
              Refresh
            </Button>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="space-y-2">
          <Canvas2D
            width={420}
            height={420}
            arrows={origArrows}
            transformedArrows={transArrows}
            gridLines={gridLines}
            extraLines={projReflLine}
          />
          {result && (
            <div className="flex items-start gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Matrix M</p>
                <MatrixDisplay
                  matrix={result.matrix}
                  augmented={false}
                  numVars={2}
                />
              </div>
              <p className="text-xs text-muted-foreground pt-4">
                {result.interpretation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Projection / reflection note */}
      {(selectedPreset === "projection" || selectedPreset === "reflection") && !useCustom && (
        <>
          <Separator />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {selectedPreset === "projection" ? "Orthogonal Projection" : "Reflection"}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedPreset === "projection"
                  ? "Projection onto a line finds the closest point on that line — like casting a shadow. It is linear because the 'shadow' of a sum is the sum of shadows."
                  : "Reflection across a line flips each vector to its mirror image. The purple dashed line is the axis of reflection."}
              </CardDescription>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  );
}
