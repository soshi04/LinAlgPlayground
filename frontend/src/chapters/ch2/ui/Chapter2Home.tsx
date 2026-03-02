import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransformDemo2D } from "./TransformDemo2D";
import { CompositionDemo } from "./CompositionDemo";
import { MatrixMultiplyIntuition } from "./MatrixMultiplyIntuition";
import { InversesPanel } from "./InversesPanel";
import { MiniQuiz } from "./MiniQuiz";

interface Props {
  chapterId: string;
  title: string;
  description: string;
}

export function Chapter2Home({ title, description }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <Separator />

      {/* ── Concepts & Definitions ─────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Concepts &amp; Definitions</h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          A <strong>linear transformation</strong> is a function{" "}
          <em>T : V → W</em> between vector spaces that preserves the two
          fundamental operations: <em>T(u + v) = T(u) + T(v)</em> and{" "}
          <em>T(cv) = cT(v)</em>. The space <em>V</em> is called the{" "}
          <strong>domain</strong> and <em>W</em> the <strong>target (codomain)</strong>.
          When both are ℝⁿ the transformation can be described by multiplying
          by an <em>n × n</em> matrix.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Rotation</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Rotates every vector counter‑clockwise by angle θ. Matrix:
              [cos θ, −sin θ; sin θ, cos θ].
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Scaling</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Stretches or compresses each axis independently: [sₓ, 0; 0, sᵧ].
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Shear</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              A horizontal shear adds kₓ · y to x. Matrix: [1, kₓ; kᵧ, 1].
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Reflection</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Reflects across a line through the origin at angle α:
              [cos 2α, sin 2α; sin 2α, −cos 2α].
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Projection</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Projects each vector onto a line — the "shadow" or closest point.
              The result is always on the line, and the map is linear because
              the shadow of a sum equals the sum of shadows.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Rotation + Scaling</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              A rotation followed by uniform scaling: s · [cos θ, −sin θ; sin θ, cos θ].
            </CardContent>
          </Card>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Matrix product constraints.</strong> The product BA is defined
          only when the number of columns of B equals the number of rows of A.
          In the equation <em>BAx = y</em>, the product BA means "apply A first,
          then B." The columns of BA are exactly B applied to each column of A
          individually. Multiplication is associative — A(BC) = (AB)C — and
          distributes over addition, but is <strong>not commutative</strong> in general.
          When AB = BA we say the matrices <em>commute</em>.
        </p>

        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Inverses &amp; invertibility.</strong> A square matrix A is
          invertible precisely when it represents a bijection (one‑to‑one and
          onto). Equivalently, A is invertible iff RREF(A) = Iₙ. The inverse
          can be computed by augmenting [A | I] and row‑reducing to [I | A⁻¹].
          If both A and B are invertible, the system BAx = y is solved by
          x = A⁻¹ B⁻¹ y. For a 2×2 matrix [a b; c d], invertibility is
          equivalent to the condition <em>ad − bc ≠ 0</em>.
        </p>
      </section>

      <Separator />

      {/* ── Interactive tabs ─────────────────────────────────── */}
      <Tabs defaultValue="transform" className="w-full">
        <TabsList>
          <TabsTrigger value="transform">Transform Demo (2D)</TabsTrigger>
          <TabsTrigger value="composition">Composition (AB vs BA)</TabsTrigger>
          <TabsTrigger value="multiply">Matrix Multiply</TabsTrigger>
          <TabsTrigger value="inverses">Inverses &amp; Invertibility</TabsTrigger>
          <TabsTrigger value="quiz">Quick Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="transform" className="pt-4">
          <TransformDemo2D />
        </TabsContent>

        <TabsContent value="composition" className="pt-4">
          <CompositionDemo />
        </TabsContent>

        <TabsContent value="multiply" className="pt-4">
          <MatrixMultiplyIntuition />
        </TabsContent>

        <TabsContent value="inverses" className="pt-4">
          <InversesPanel />
        </TabsContent>

        <TabsContent value="quiz" className="pt-4">
          <MiniQuiz />
        </TabsContent>
      </Tabs>
    </div>
  );
}
