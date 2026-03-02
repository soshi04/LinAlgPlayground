"""Chapter 1 – Linear Equations: API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.chapters.ch1.linear_system import (
    add_rows,
    compute_rref,
    describe_op,
    fmt,
    format_matrix,
    next_step_hint,
    parse_entry,
    parse_matrix,
    scale_row,
    solve_system,
    swap_rows,
)
from app.chapters.ch1.types import (
    ApplyRowOpRequest,
    ApplyRowOpResponse,
    HintResponse,
    MatrixPayload,
    NormalizeResponse,
    ParametricExpression,
    ParametricSolution,
    RrefResponse,
    RrefStepModel,
    SolveResponse,
)

router = APIRouter()


@router.get("/")
def chapter_home():
    return {"chapterId": "ch1", "status": "active"}


# ── Normalize ────────────────────────────────────────────────────────────────


@router.post("/normalize", response_model=NormalizeResponse)
def normalize(payload: MatrixPayload):
    mat, errors = parse_matrix(payload.matrix)
    return NormalizeResponse(matrix=format_matrix(mat), errors=errors)


# ── Apply single row operation ───────────────────────────────────────────────


@router.post("/apply-row-op", response_model=ApplyRowOpResponse)
def apply_row_op(payload: ApplyRowOpRequest):
    mat, errors = parse_matrix(payload.matrix)
    if errors:
        raise HTTPException(status_code=422, detail="; ".join(errors))

    op = payload.operation
    m = len(mat)
    warnings: list[str] = []

    if op.kind == "swap":
        if op.r1 is None or op.r2 is None:
            raise HTTPException(422, "swap requires r1 and r2")
        if not (0 <= op.r1 < m and 0 <= op.r2 < m):
            raise HTTPException(422, f"Row indices must be 0–{m - 1}")
        if op.r1 == op.r2:
            warnings.append("Swapping a row with itself has no effect")
        result_mat = swap_rows(mat, op.r1, op.r2)
        op_dict = {"kind": "swap", "r1": op.r1, "r2": op.r2}

    elif op.kind == "scale":
        if op.r is None or op.k is None:
            raise HTTPException(422, "scale requires r and k")
        if not (0 <= op.r < m):
            raise HTTPException(422, f"Row index must be 0–{m - 1}")
        try:
            k = parse_entry(op.k)
        except ValueError as e:
            raise HTTPException(422, str(e)) from e
        if k == 0:
            raise HTTPException(422, "Cannot scale a row by zero")
        result_mat = scale_row(mat, op.r, k)
        op_dict = {"kind": "scale", "r": op.r, "k": fmt(k)}

    elif op.kind == "add":
        if op.target is None or op.source is None or op.k is None:
            raise HTTPException(422, "add requires target, source, and k")
        if not (0 <= op.target < m and 0 <= op.source < m):
            raise HTTPException(422, f"Row indices must be 0–{m - 1}")
        if op.target == op.source:
            raise HTTPException(422, "Target and source must differ")
        try:
            k = parse_entry(op.k)
        except ValueError as e:
            raise HTTPException(422, str(e)) from e
        if k == 0:
            warnings.append("Adding 0× a row has no effect")
        result_mat = add_rows(mat, op.target, op.source, k)
        op_dict = {"kind": "add", "target": op.target, "source": op.source, "k": fmt(k)}

    else:
        raise HTTPException(422, f"Unknown operation kind '{op.kind}'")

    return ApplyRowOpResponse(
        matrix=format_matrix(result_mat),
        description=describe_op(op_dict),
        warnings=warnings,
    )


# ── RREF ─────────────────────────────────────────────────────────────────────


@router.post("/rref", response_model=RrefResponse)
def rref(payload: MatrixPayload):
    mat, errors = parse_matrix(payload.matrix)
    if errors:
        raise HTTPException(422, "; ".join(errors))
    result = compute_rref(mat, payload.numVars)
    return RrefResponse(
        rref=format_matrix(result.rref),
        steps=[
            RrefStepModel(
                operation=s.operation,
                description=s.description,
                matrix=s.matrix_snapshot,
            )
            for s in result.steps
        ],
        pivotColumns=result.pivot_columns,
        rank=result.rank,
        freeVarColumns=result.free_var_columns,
    )


# ── Solve ────────────────────────────────────────────────────────────────────


@router.post("/solve", response_model=SolveResponse)
def solve(payload: MatrixPayload):
    if not payload.augmented:
        raise HTTPException(422, "Solve requires an augmented matrix (Ax = b)")
    mat, errors = parse_matrix(payload.matrix)
    if errors:
        raise HTTPException(422, "; ".join(errors))
    res = solve_system(mat, payload.numVars)

    ps = None
    if res.parametric:
        ps = ParametricSolution(
            expressions=[ParametricExpression(**e) for e in res.parametric["expressions"]],
            freeVariables=res.parametric["freeVariables"],
            parameterNames=res.parametric["parameterNames"],
        )
    return SolveResponse(
        classification=res.classification,
        rankA=res.rank_a,
        rankAb=res.rank_ab,
        numVars=res.num_vars,
        numEqs=res.num_eqs,
        solution=res.solution,
        parametricSolution=ps,
        reason=res.reason,
    )


# ── Next‑step hint ───────────────────────────────────────────────────────────


@router.post("/next-step-hint", response_model=HintResponse)
def hint(payload: MatrixPayload):
    mat, errors = parse_matrix(payload.matrix)
    if errors:
        raise HTTPException(422, "; ".join(errors))
    op, explanation = next_step_hint(mat, payload.numVars)
    return HintResponse(operation=op, explanation=explanation)
