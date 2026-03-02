import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageKernelPanel } from "./ImageKernelPanel";
import { SubspaceCheckerPanel } from "./SubspaceCheckerPanel";
import { BasisDimensionPanel } from "./BasisDimensionPanel";
import { CoordinatesPanel } from "./CoordinatesPanel";

interface Props {
  chapterId: string;
  title: string;
  description: string;
}

export function Chapter3Home({ title, description }: Props) {
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
          A <strong>subspace</strong> of R^n is a subset V that is closed under
          addition and scalar multiplication (and contains the zero vector).
          Every subspace can be described as either the <strong>image</strong>{" "}
          (column space) or <strong>kernel</strong> (null space) of some matrix.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Image (Column Space)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              im(A) = {"{ Ax : x in R^n }"} — the span of the columns of A.
              Its dimension is the rank of A.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Kernel (Null Space)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              ker(A) = {"{ x : Ax = 0 }"} — all solutions to the homogeneous
              system. Its dimension is the nullity of A.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Linear Independence</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Vectors v1, ..., vk are linearly independent if the only solution
              to c1*v1 + ... + ck*vk = 0 is c1 = ... = ck = 0.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Basis</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              A basis for a subspace V is a linearly independent set that spans V.
              Every basis of V has the same number of vectors.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Dimension</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              dim(V) = the number of vectors in any basis of V.
              For all of R^n, dim = n.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Rank-Nullity Theorem</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              For an m x n matrix A: rank(A) + nullity(A) = n.
              Equivalently, dim(im A) + dim(ker A) = number of columns.
            </CardContent>
          </Card>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Coordinates.</strong> Given a basis B = (b1, ..., bn) for a
          subspace, every vector x in the subspace can be written uniquely as
          x = c1*b1 + ... + cn*bn. The vector [x]_B = (c1, ..., cn) is called
          the <strong>B-coordinate vector</strong> of x.
        </p>

        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Similar matrices.</strong> Two n x n matrices A and B are{" "}
          <strong>similar</strong> if there exists an invertible matrix S such
          that B = S^(-1) A S. Similar matrices represent the same linear
          transformation in different bases and share the same rank, trace,
          determinant, and eigenvalues.
        </p>
      </section>

      <Separator />

      {/* ── Interactive tabs ─────────────────────────────────── */}
      <Tabs defaultValue="image-kernel" className="w-full">
        <TabsList>
          <TabsTrigger value="image-kernel">Image &amp; Kernel</TabsTrigger>
          <TabsTrigger value="subspace-checker">Independence &amp; Span</TabsTrigger>
          <TabsTrigger value="basis-dimension">Basis &amp; Dimension</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="image-kernel" className="pt-4">
          <ImageKernelPanel />
        </TabsContent>

        <TabsContent value="subspace-checker" className="pt-4">
          <SubspaceCheckerPanel />
        </TabsContent>

        <TabsContent value="basis-dimension" className="pt-4">
          <BasisDimensionPanel />
        </TabsContent>

        <TabsContent value="coordinates" className="pt-4">
          <CoordinatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
