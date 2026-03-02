"""Chapter 2 – Linear Transformations: API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.chapters.ch1.linear_system import (
    format_matrix,
    parse_entry,
    parse_matrix,
)
from app.chapters.ch2.linalg2 import (
    PRESET_META,
    build_2x2,
    check_invertibility,
    fmt_vec,
    inverse_via_augment,
    mat_eq,
    mat_mult,
    mat_to_float,
    mat_vec,
    matrix_product_info,
    solve_bax_eq_y,
    vec_to_float,
)
from app.chapters.ch2.types import (
    ApplyTransform2DRequest,
    ApplyTransform2DResponse,
    Compose2DRequest,
    Compose2DResponse,
    InverseAugmentRequest,
    InverseAugmentResponse,
    InvertibilityRequest,
    InvertibilityResponse,
    MatrixProductRequest,
    MatrixProductResponse,
    MetadataResponse,
    RrefStepModel,
    SolveBAXRequest,
    SolveBAXResponse,
    TransformPresetInfo,
)

router = APIRouter()


@router.get("/")
def chapter_home():
    return {"chapterId": "ch2", "status": "active"}


# ── 1) Metadata / presets ────────────────────────────────────────────────────


@router.get("/metadata", response_model=MetadataResponse)
def metadata():
    presets = [TransformPresetInfo(**p) for p in PRESET_META]
    return MetadataResponse(presets=presets)


# ── 2) Matrix product ────────────────────────────────────────────────────────


@router.post("/matrix-product", response_model=MatrixProductResponse)
def matrix_product(req: MatrixProductRequest):
    A, errA = parse_matrix(req.A)
    if errA:
        raise HTTPException(422, "; ".join(errA))
    B, errB = parse_matrix(req.B)
    if errB:
        raise HTTPException(422, "; ".join(errB))

    info = matrix_product_info(A, B, req.order)
    if not info["defined"]:
        return MatrixProductResponse(
            defined=False,
            reason=info["reason"],
            dimensionExplanation=info["dimensionExplanation"],
        )

    product = info["product"]
    cols_second = info.get("columnsOfSecond", [])
    mapped = info.get("mappedColumns", [])

    return MatrixProductResponse(
        defined=True,
        reason=info["reason"],
        product=format_matrix(product),
        productFloat=mat_to_float(product),
        dimensionExplanation=info["dimensionExplanation"],
        columnsOfFirst=[fmt_vec(c) for c in cols_second],
        mappedColumns=[fmt_vec(c) for c in mapped],
    )


# ── 3) Apply 2D transform ───────────────────────────────────────────────────


@router.post("/apply-transform-2d", response_model=ApplyTransform2DResponse)
def apply_transform_2d(req: ApplyTransform2DRequest):
    # build M
    if req.matrix:
        M, errs = parse_matrix(req.matrix)
        if errs:
            raise HTTPException(422, "; ".join(errs))
        if len(M) != 2 or any(len(r) != 2 for r in M):
            raise HTTPException(422, "Matrix must be 2×2")
    elif req.preset and req.params is not None:
        try:
            M = build_2x2(req.preset, req.params)
        except ValueError as e:
            raise HTTPException(422, str(e)) from e
    else:
        raise HTTPException(422, "Provide either matrix or preset+params")

    # parse vectors
    vecs = []
    for vi, raw in enumerate(req.vectors):
        parsed: list = []
        for j, s in enumerate(raw):
            try:
                parsed.append(parse_entry(s))
            except ValueError as e:
                raise HTTPException(422, f"Vector {vi + 1}, component {j + 1}: {e}") from e
        if len(parsed) != 2:
            raise HTTPException(422, f"Vector {vi + 1} must have 2 components")
        vecs.append(parsed)

    transformed = [mat_vec(M, v) for v in vecs]

    col1 = fmt_vec([M[0][0], M[1][0]])
    col2 = fmt_vec([M[0][1], M[1][1]])
    interp = f"T(e₁) = ({col1[0]}, {col1[1]}),  T(e₂) = ({col2[0]}, {col2[1]})"

    return ApplyTransform2DResponse(
        matrix=format_matrix(M),
        matrixFloat=mat_to_float(M),
        transformedVectors=[fmt_vec(v) for v in transformed],
        transformedVectorsFloat=[vec_to_float(v) for v in transformed],
        interpretation=interp,
    )


# ── 4) Compose 2D ───────────────────────────────────────────────────────────


@router.post("/compose-2d", response_model=Compose2DResponse)
def compose_2d(req: Compose2DRequest):
    A, errA = parse_matrix(req.A)
    if errA:
        raise HTTPException(422, "; ".join(errA))
    B, errB = parse_matrix(req.B)
    if errB:
        raise HTTPException(422, "; ".join(errB))
    if len(A) != 2 or len(B) != 2:
        raise HTTPException(422, "Both A and B must be 2×2")

    AB = mat_mult(A, B)
    BA = mat_mult(B, A)
    commute = mat_eq(AB, BA)

    vecs = []
    for vi, raw in enumerate(req.vectors):
        parsed = []
        for j, s in enumerate(raw):
            try:
                parsed.append(parse_entry(s))
            except ValueError as e:
                raise HTTPException(422, f"Vector {vi + 1}, comp {j + 1}: {e}") from e
        vecs.append(parsed)

    pts_AB = [vec_to_float(mat_vec(AB, v)) for v in vecs]
    pts_BA = [vec_to_float(mat_vec(BA, v)) for v in vecs]

    expl = "AB means 'apply B first, then A'. BA means 'apply A first, then B'."
    if commute:
        expl += " These two matrices commute (AB = BA)."
    else:
        expl += " AB ≠ BA — matrix multiplication is NOT commutative in general."

    return Compose2DResponse(
        AB=format_matrix(AB),
        BA=format_matrix(BA),
        ABFloat=mat_to_float(AB),
        BAFloat=mat_to_float(BA),
        pointsAB=pts_AB,
        pointsBA=pts_BA,
        commute=commute,
        explanation=expl,
    )


# ── 5) Invertibility check ──────────────────────────────────────────────────


@router.post("/invertibility", response_model=InvertibilityResponse)
def invertibility(req: InvertibilityRequest):
    A, errs = parse_matrix(req.matrix)
    if errs:
        raise HTTPException(422, "; ".join(errs))
    n = len(A)
    if any(len(r) != n for r in A):
        raise HTTPException(422, "Matrix must be square")
    info = check_invertibility(A)
    return InvertibilityResponse(**info)


# ── 6) Inverse via augment ──────────────────────────────────────────────────


@router.post("/inverse-via-augment", response_model=InverseAugmentResponse)
def inverse_augment(req: InverseAugmentRequest):
    A, errs = parse_matrix(req.matrix)
    if errs:
        raise HTTPException(422, "; ".join(errs))
    n = len(A)
    if any(len(r) != n for r in A):
        raise HTTPException(422, "Matrix must be square")
    info = inverse_via_augment(A)
    steps = [
        RrefStepModel(
            operation=s.operation, description=s.description, matrix=s.matrix_snapshot
        )
        for s in info["steps"]
    ]
    return InverseAugmentResponse(
        isInvertible=info["isInvertible"],
        inverse=info["inverse"],
        inverseFloat=info["inverseFloat"],
        steps=steps,
        explanation=info["explanation"],
    )


# ── 7) Solve BAx = y ────────────────────────────────────────────────────────


@router.post("/solve-bax", response_model=SolveBAXResponse)
def solve_bax(req: SolveBAXRequest):
    A, errA = parse_matrix(req.A)
    if errA:
        raise HTTPException(422, "; ".join(errA))
    B, errB = parse_matrix(req.B)
    if errB:
        raise HTTPException(422, "; ".join(errB))
    y_parsed = []
    for j, s in enumerate(req.y):
        try:
            y_parsed.append(parse_entry(s))
        except ValueError as e:
            raise HTTPException(422, f"y component {j + 1}: {e}") from e

    info = solve_bax_eq_y(A, B, y_parsed)
    return SolveBAXResponse(**info)
