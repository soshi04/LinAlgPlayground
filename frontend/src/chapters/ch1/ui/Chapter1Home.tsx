import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MatrixEditor } from "./MatrixEditor";
import { RowOpsPanel } from "./RowOpsPanel";
import { RrefPanel } from "./RrefPanel";
import { SolutionsPanel } from "./SolutionsPanel";
import { Visualization2D } from "./Visualization2D";
import type { HistoryEntry } from "../types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function createEmptyMatrix(m: number, n: number, augmented: boolean): string[][] {
  const cols = augmented ? n + 1 : n;
  return Array.from({ length: m }, () => Array.from({ length: cols }, () => "0"));
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  chapterId: string;
  title: string;
  description: string;
}

export function Chapter1Home({ title, description }: Props) {
  // dimensions
  const [m, setM] = useState(2);
  const [n, setN] = useState(2);
  const [augmented, setAugmented] = useState(true);

  // history (undo/redo)
  const [history, setHistory] = useState<HistoryEntry[]>([
    { matrix: createEmptyMatrix(2, 2, true), description: "Initial" },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const matrix = history[historyIndex].matrix;

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Direct cell edit — mutates current history entry (no new step). */
  const handleMatrixChange = useCallback(
    (newMatrix: string[][]) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        trimmed[historyIndex] = { ...trimmed[historyIndex], matrix: newMatrix };
        return trimmed;
      });
    },
    [historyIndex]
  );

  /** Reset dimensions / preset — clears history. */
  const handleReset = useCallback(
    (newM: number, newN: number, newAug: boolean, mat?: string[][]) => {
      setM(newM);
      setN(newN);
      setAugmented(newAug);
      const initial = mat ?? createEmptyMatrix(newM, newN, newAug);
      setHistory([{ matrix: initial, description: "Initial" }]);
      setHistoryIndex(0);
    },
    []
  );

  /** Apply row operation — pushes new history entry. */
  const handleApplyOp = useCallback(
    (newMatrix: string[][], desc: string) => {
      setHistory((prev) => [
        ...prev.slice(0, historyIndex + 1),
        { matrix: newMatrix, description: desc },
      ]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const handleJump = useCallback(
    (index: number) => {
      if (index >= 0 && index < history.length) setHistoryIndex(index);
    },
    [history.length]
  );

  /** Apply RREF result as current state. */
  const handleUseRref = useCallback(
    (rrefMatrix: string[][]) => {
      handleApplyOp(rrefMatrix, "Applied RREF");
    },
    [handleApplyOp]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Separator />

      {/* Intro text */}
      <section className="space-y-3 text-sm leading-relaxed">
        <p>
          A system of linear equations can be represented as an{" "}
          <strong>augmented matrix [A|b]</strong>. Three elementary row
          operations — <em>swapping rows</em>, <em>scaling a row</em>, and{" "}
          <em>adding a multiple of one row to another</em> — transform the
          system without changing its solution set.
        </p>
        <p>
          By systematically applying these operations we reduce any matrix to
          its <strong>Reduced Row Echelon Form (RREF)</strong>, which reveals
          the solution structure directly.
        </p>
        <p>
          The <strong>rank</strong> of the coefficient matrix <em>A</em> and
          the augmented matrix <em>[A|b]</em> determine the nature of
          solutions: if{" "}
          <code className="text-xs bg-muted px-1 rounded">rank(A) {"<"} rank([A|b])</code>{" "}
          the system is inconsistent; if{" "}
          <code className="text-xs bg-muted px-1 rounded">rank(A) = n</code>{" "}
          (number of variables) the solution is unique; otherwise there are
          infinitely many solutions parameterised by{" "}
          <code className="text-xs bg-muted px-1 rounded">n − rank(A)</code>{" "}
          free variables.
        </p>
      </section>

      <Separator />

      {/* Matrix editor */}
      <MatrixEditor
        matrix={matrix}
        m={m}
        n={n}
        augmented={augmented}
        onMatrixChange={handleMatrixChange}
        onReset={handleReset}
      />

      <Separator />

      {/* Tabbed workspace */}
      <Tabs defaultValue="row-ops">
        <TabsList className="mb-2">
          <TabsTrigger value="row-ops">Row Operations</TabsTrigger>
          <TabsTrigger value="rref">Auto RREF</TabsTrigger>
          <TabsTrigger value="solutions">Solutions &amp; Rank</TabsTrigger>
          <TabsTrigger value="visualize" disabled={n !== 2 || !augmented}>
            Visualize (2 vars)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="row-ops">
          <RowOpsPanel
            matrix={matrix}
            m={m}
            n={n}
            augmented={augmented}
            onApplyOp={handleApplyOp}
            history={history}
            historyIndex={historyIndex}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onJump={handleJump}
          />
        </TabsContent>

        <TabsContent value="rref">
          <RrefPanel
            matrix={matrix}
            augmented={augmented}
            numVars={n}
            numEqs={m}
            onUseRref={handleUseRref}
          />
        </TabsContent>

        <TabsContent value="solutions">
          <SolutionsPanel
            matrix={matrix}
            augmented={augmented}
            numVars={n}
            numEqs={m}
          />
        </TabsContent>

        <TabsContent value="visualize">
          {n === 2 && augmented ? (
            <Visualization2D
              matrix={matrix}
              numVars={n}
              numEqs={m}
              augmented={augmented}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              Visualization is only available for 2-variable augmented systems.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
