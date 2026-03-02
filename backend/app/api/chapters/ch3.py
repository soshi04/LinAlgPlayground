"""Chapter 3 API — Subspaces of Rⁿ and Their Dimensions."""

from fastapi import APIRouter, HTTPException

from app.chapters.ch1.linear_system import parse_entry, parse_matrix
from app.chapters.ch3.subspaces import (
    check_linear_independence,
    check_similarity,
    check_vector_in_span,
    compute_b_matrix,
    compute_coordinate_vector,
    compute_image_kernel,
    find_basis_and_dimension,
)
from app.chapters.ch3.types import (
    BasisDimensionResponse,
    BMatrixRequest,
    BMatrixResponse,
    CoordinateRequest,
    CoordinateResponse,
    ImageKernelResponse,
    LinearIndependenceResponse,
    MatrixInput,
    SimilarityRequest,
    SimilarityResponse,
    VectorInSpanRequest,
    VectorInSpanResponse,
    VectorsInput,
)

router = APIRouter()


# ─── helpers ──────────────────────────────────────────────────────────────────


def _parse_mat(raw: list[list[str]]):
    mat, errors = parse_matrix(raw)
    if errors:
        raise HTTPException(status_code=422, detail="; ".join(errors))
    return mat


def _parse_vectors(raw: list[list[str]]):
    """Parse a list of vectors (each a list of strings) into Fraction lists."""
    vectors = []
    for i, v in enumerate(raw):
        parsed = []
        for j, entry in enumerate(v):
            try:
                parsed.append(parse_entry(entry))
            except ValueError as exc:
                raise HTTPException(
                    status_code=422,
                    detail=f"Vector {i + 1}, component {j + 1}: {exc}",
                )
        vectors.append(parsed)
    return vectors


def _parse_vec(raw: list[str]):
    parsed = []
    for j, entry in enumerate(raw):
        try:
            parsed.append(parse_entry(entry))
        except ValueError as exc:
            raise HTTPException(
                status_code=422, detail=f"Component {j + 1}: {exc}"
            )
    return parsed


# ─── endpoints ────────────────────────────────────────────────────────────────


@router.get("/")
def chapter_home() -> dict:
    return {"chapterId": "ch3", "status": "active"}


@router.post("/image-kernel", response_model=ImageKernelResponse)
def image_kernel(payload: MatrixInput):
    mat = _parse_mat(payload.matrix)
    if not mat:
        raise HTTPException(status_code=422, detail="Matrix is empty.")
    m = len(mat)
    n = len(mat[0])
    result = compute_image_kernel(mat, m, n)
    return result


@router.post("/linear-independence", response_model=LinearIndependenceResponse)
def linear_independence(payload: VectorsInput):
    vectors = _parse_vectors(payload.vectors)
    if not vectors:
        raise HTTPException(status_code=422, detail="No vectors provided.")
    # Validate all same dimension
    dim = len(vectors[0])
    for i, v in enumerate(vectors):
        if len(v) != dim:
            raise HTTPException(
                status_code=422,
                detail=f"Vector {i + 1} has {len(v)} components but expected {dim}.",
            )
    result = check_linear_independence(vectors)
    return result


@router.post("/vector-in-span", response_model=VectorInSpanResponse)
def vector_in_span(payload: VectorInSpanRequest):
    vectors = _parse_vectors(payload.vectors)
    target = _parse_vec(payload.target)
    if not vectors:
        raise HTTPException(status_code=422, detail="No spanning vectors provided.")
    dim = len(vectors[0])
    for i, v in enumerate(vectors):
        if len(v) != dim:
            raise HTTPException(
                status_code=422,
                detail=f"Vector {i + 1} has {len(v)} components but expected {dim}.",
            )
    if len(target) != dim:
        raise HTTPException(
            status_code=422,
            detail=f"Target vector has {len(target)} components but expected {dim}.",
        )
    result = check_vector_in_span(vectors, target)
    return result


@router.post("/basis-dimension", response_model=BasisDimensionResponse)
def basis_dimension(payload: VectorsInput):
    vectors = _parse_vectors(payload.vectors)
    if not vectors:
        raise HTTPException(status_code=422, detail="No vectors provided.")
    dim = len(vectors[0])
    for i, v in enumerate(vectors):
        if len(v) != dim:
            raise HTTPException(
                status_code=422,
                detail=f"Vector {i + 1} has {len(v)} components but expected {dim}.",
            )
    result = find_basis_and_dimension(vectors)
    return result


@router.post("/coordinate-vector", response_model=CoordinateResponse)
def coordinate_vector(payload: CoordinateRequest):
    basis = _parse_vectors(payload.basis)
    vec = _parse_vec(payload.vector)
    if not basis:
        raise HTTPException(status_code=422, detail="No basis vectors provided.")
    dim = len(basis[0])
    for i, v in enumerate(basis):
        if len(v) != dim:
            raise HTTPException(
                status_code=422,
                detail=f"Basis vector {i + 1} has {len(v)} components but expected {dim}.",
            )
    if len(vec) != dim:
        raise HTTPException(
            status_code=422,
            detail=f"Vector has {len(vec)} components but expected {dim}.",
        )
    result = compute_coordinate_vector(basis, vec)
    return result


@router.post("/b-matrix", response_model=BMatrixResponse)
def b_matrix(payload: BMatrixRequest):
    A = _parse_mat(payload.A)
    basis = _parse_vectors(payload.basis)
    n = len(A)
    if not A or any(len(row) != n for row in A):
        raise HTTPException(status_code=422, detail="A must be a square matrix.")
    if len(basis) != n:
        raise HTTPException(
            status_code=422,
            detail=f"Need exactly {n} basis vectors for an {n}×{n} transformation.",
        )
    for i, v in enumerate(basis):
        if len(v) != n:
            raise HTTPException(
                status_code=422,
                detail=f"Basis vector {i + 1} has {len(v)} components but expected {n}.",
            )
    result = compute_b_matrix(A, basis)
    return result


@router.post("/check-similarity", response_model=SimilarityResponse)
def similarity(payload: SimilarityRequest):
    A = _parse_mat(payload.A)
    B = _parse_mat(payload.B)
    nA = len(A)
    nB = len(B)
    if not A or any(len(row) != nA for row in A):
        raise HTTPException(status_code=422, detail="A must be a square matrix.")
    if not B or any(len(row) != nB for row in B):
        raise HTTPException(status_code=422, detail="B must be a square matrix.")
    if nA != nB:
        raise HTTPException(
            status_code=422,
            detail=f"A is {nA}×{nA} but B is {nB}×{nB}. Matrices must be the same size.",
        )
    if nA > 4:
        raise HTTPException(
            status_code=422,
            detail="Similarity check is limited to matrices of size 4×4 or smaller.",
        )
    result = check_similarity(A, B)
    return result
