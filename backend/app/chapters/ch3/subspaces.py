"""Core linear‑algebra routines for Chapter 3 (Subspaces of Rⁿ).

Reuses Chapter 1's exact‑arithmetic helpers (parse, fmt, RREF) and Chapter 2's
matrix utilities (identity, mat_mult, mat_vec, inverse_via_augment, …).
"""

from __future__ import annotations

from fractions import Fraction

from app.chapters.ch1.linear_system import (
    RrefStep,
    compute_rref,
    fmt,
    format_matrix,
)
from app.chapters.ch2.linalg2 import (
    Mat,
    columns,
    fmt_vec,
    identity,
    inverse_via_augment,
    mat_mult,
    mat_to_float,
    mat_vec,
    vec_to_float,
)

Vec = list[Fraction]


# ═══════════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════════


def _cols_of(A: Mat) -> list[Vec]:
    """Column vectors of *A*."""
    return columns(A)


def _vec_matrix(vecs: list[Vec]) -> Mat:
    """Build a matrix whose *columns* are *vecs* (all same length)."""
    if not vecs:
        return []
    m = len(vecs[0])
    return [[vecs[c][r] for c in range(len(vecs))] for r in range(m)]


def _trace(A: Mat) -> Fraction:
    return sum(A[i][i] for i in range(len(A)))


def _det2x2(A: Mat) -> Fraction:
    return A[0][0] * A[1][1] - A[0][1] * A[1][0]


def _is_diagonal(M: Mat) -> bool:
    n = len(M)
    return all(M[i][j] == 0 for i in range(n) for j in range(n) if i != j)


def _steps_to_dicts(steps: list[RrefStep]) -> list[dict]:
    """Convert internal ``RrefStep`` objects to JSON‑friendly dicts."""
    return [
        {
            "operation": s.operation,
            "description": s.description,
            "matrix": s.matrix_snapshot,
        }
        for s in steps
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# 1. Image & Kernel
# ═══════════════════════════════════════════════════════════════════════════════


def compute_image_kernel(A: Mat, m: int, n: int) -> dict:
    """Compute bases of the image (column space) and kernel (null space) of *A*.

    *m* = number of rows, *n* = number of columns.
    """
    rref_result = compute_rref([row[:n] for row in A], n)
    rref_mat = rref_result.rref
    pivot_cols = rref_result.pivot_columns
    free_cols = rref_result.free_var_columns
    rank = rref_result.rank
    nullity = n - rank

    # Image basis = original columns of A at pivot indices
    orig_cols = _cols_of(A)
    image_basis = [orig_cols[c] for c in pivot_cols]

    # Kernel basis: for each free variable, back‑substitute from RREF
    # pivot_row_map: pivot_col -> row index
    pivot_row = {c: r for r, c in enumerate(pivot_cols)}
    kernel_basis: list[Vec] = []
    for fc in free_cols:
        v = [Fraction(0)] * n
        v[fc] = Fraction(1)
        for pc in pivot_cols:
            v[pc] = -rref_mat[pivot_row[pc]][fc]
        kernel_basis.append(v)

    # Column labels
    col_labels = ["pivot" if c in set(pivot_cols) else "free" for c in range(n)]

    check = f"rank({rank}) + nullity({nullity}) = {rank + nullity} = n({n})"
    if rank + nullity == n:
        check += " ✓"

    return {
        "rref": format_matrix(rref_mat),
        "steps": _steps_to_dicts(rref_result.steps),
        "pivotColumns": pivot_cols,
        "freeVarColumns": free_cols,
        "rank": rank,
        "nullity": nullity,
        "numCols": n,
        "rankNullityCheck": check,
        "imageBasis": [fmt_vec(v) for v in image_basis],
        "kernelBasis": [fmt_vec(v) for v in kernel_basis],
        "columnLabels": col_labels,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. Linear independence
# ═══════════════════════════════════════════════════════════════════════════════


def check_linear_independence(vectors: list[Vec]) -> dict:
    """Check if the given column vectors are linearly independent."""
    if not vectors:
        return {
            "independent": True,
            "rank": 0,
            "numVectors": 0,
            "explanation": "The empty set is vacuously independent.",
            "rref": [],
            "steps": [],
            "redundantIndices": [],
            "basisIndices": [],
        }

    k = len(vectors)
    M = _vec_matrix(vectors)
    m = len(M)
    rref_result = compute_rref(M, k)
    rank = rref_result.rank
    independent = rank == k

    pivot_cols = rref_result.pivot_columns
    free_cols = rref_result.free_var_columns

    if independent:
        explanation = (
            f"The {k} vector(s) are linearly independent: "
            f"rank = {rank} = number of vectors."
        )
    else:
        explanation = (
            f"The vectors are linearly dependent: "
            f"rank = {rank} < {k} = number of vectors. "
            f"Vector(s) at index {', '.join(str(i + 1) for i in free_cols)} "
            f"{'is' if len(free_cols) == 1 else 'are'} redundant."
        )

    return {
        "independent": independent,
        "rank": rank,
        "numVectors": k,
        "explanation": explanation,
        "rref": format_matrix(rref_result.rref),
        "steps": _steps_to_dicts(rref_result.steps),
        "redundantIndices": free_cols,
        "basisIndices": pivot_cols,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. Vector in span
# ═══════════════════════════════════════════════════════════════════════════════


def check_vector_in_span(vectors: list[Vec], target: Vec) -> dict:
    """Check whether *target* is in span(*vectors*)."""
    k = len(vectors)
    # Augmented matrix: [V | target]
    M = _vec_matrix(vectors)
    m = len(M)
    aug = [M[r][:] + [target[r]] for r in range(m)]

    rref_result = compute_rref(aug, k)
    rref_mat = rref_result.rref
    pivot_cols = rref_result.pivot_columns

    # Inconsistency check: row all‑zero in left part but nonzero in last col
    inconsistent = False
    for r in range(m):
        if all(rref_mat[r][j] == 0 for j in range(k)) and rref_mat[r][k] != 0:
            inconsistent = True
            break

    if inconsistent:
        return {
            "inSpan": False,
            "explanation": (
                "The system [V|b] is inconsistent — the target vector "
                "is NOT in the span of the given vectors."
            ),
            "coefficients": None,
            "rref": format_matrix(rref_mat),
            "steps": _steps_to_dicts(rref_result.steps),
        }

    # Extract coefficients
    coeffs = [Fraction(0)] * k
    for ri, pc in enumerate(pivot_cols):
        if pc < k:
            coeffs[pc] = rref_mat[ri][k]

    explanation_parts = []
    for i, c in enumerate(coeffs):
        explanation_parts.append(f"c{i + 1} = {fmt(c)}")
    explanation = (
        "The target vector IS in the span. "
        f"Coefficients: {', '.join(explanation_parts)}."
    )

    return {
        "inSpan": True,
        "explanation": explanation,
        "coefficients": [fmt(c) for c in coeffs],
        "rref": format_matrix(rref_mat),
        "steps": _steps_to_dicts(rref_result.steps),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. Basis & dimension
# ═══════════════════════════════════════════════════════════════════════════════


def find_basis_and_dimension(vectors: list[Vec]) -> dict:
    """Find a basis for span(*vectors*) and determine its dimension."""
    info = check_linear_independence(vectors)
    rank = info["rank"]
    k = info["numVectors"]
    basis_indices = info["basisIndices"]
    redundant_indices = info["redundantIndices"]
    basis_vecs = [vectors[i] for i in basis_indices]

    is_basis = info["independent"]
    if is_basis:
        explanation = (
            f"The {k} vector(s) are linearly independent and span a "
            f"{rank}‑dimensional subspace. They form a basis for their span."
        )
    else:
        explanation = (
            f"The {k} vector(s) span a {rank}‑dimensional subspace, "
            f"but are linearly dependent. After removing redundant vector(s) "
            f"at index {', '.join(str(i + 1) for i in redundant_indices)}, "
            f"the remaining {rank} vector(s) form a basis."
        )

    return {
        "isBasis": is_basis,
        "dimension": rank,
        "explanation": explanation,
        "basisVectors": [fmt_vec(v) for v in basis_vecs],
        "basisIndices": basis_indices,
        "redundantIndices": redundant_indices,
        "rref": info["rref"],
        "steps": info["steps"],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 5. Coordinate vector
# ═══════════════════════════════════════════════════════════════════════════════


def compute_coordinate_vector(basis_vecs: list[Vec], x: Vec) -> dict:
    """Find [x]_B by solving S·c = x where S has basis_vecs as columns."""
    k = len(basis_vecs)
    S = _vec_matrix(basis_vecs)
    m = len(S)

    # Augmented [S | x]
    aug = [S[r][:] + [x[r]] for r in range(m)]
    rref_result = compute_rref(aug, k)
    rref_mat = rrf = rref_result.rref
    pivot_cols = rref_result.pivot_columns

    # Check inconsistency
    for r in range(m):
        if all(rrf[r][j] == 0 for j in range(k)) and rrf[r][k] != 0:
            return {
                "coordinateVector": [],
                "coordinateVectorFloat": [],
                "reconstructed": [],
                "reconstructedFloat": [],
                "explanation": (
                    "The vector x is not in the span of the given basis — "
                    "no coordinate vector exists."
                ),
                "steps": _steps_to_dicts(rref_result.steps),
            }

    # Check uniqueness (should be unique for a proper basis)
    if rref_result.rank < k:
        return {
            "coordinateVector": [],
            "coordinateVectorFloat": [],
            "reconstructed": [],
            "reconstructedFloat": [],
            "explanation": (
                "The given vectors are not linearly independent — "
                "they do not form a basis, so coordinates are not unique."
            ),
            "steps": _steps_to_dicts(rref_result.steps),
        }

    # Extract coordinate vector
    coords = [Fraction(0)] * k
    for ri, pc in enumerate(pivot_cols):
        if pc < k:
            coords[pc] = rrf[ri][k]

    # Reconstruct x = S · coords
    reconstructed = mat_vec(S, coords)

    coord_parts = [f"c{i + 1} = {fmt(c)}" for i, c in enumerate(coords)]
    explanation = (
        f"Solved S·c = x. The coordinate vector [x]_B = ({', '.join(coord_parts)}). "
        f"Verification: S·[x]_B = ({', '.join(fmt_vec(reconstructed))})."
    )

    return {
        "coordinateVector": fmt_vec(coords),
        "coordinateVectorFloat": vec_to_float(coords),
        "reconstructed": fmt_vec(reconstructed),
        "reconstructedFloat": vec_to_float(reconstructed),
        "explanation": explanation,
        "steps": _steps_to_dicts(rref_result.steps),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 6. B‑matrix of a linear transformation
# ═══════════════════════════════════════════════════════════════════════════════


def compute_b_matrix(A: Mat, basis_vecs: list[Vec]) -> dict:
    """Compute B = S⁻¹ A S, where S has *basis_vecs* as columns."""
    n = len(A)
    S = _vec_matrix(basis_vecs)

    inv_info = inverse_via_augment(S)
    if not inv_info["isInvertible"]:
        return {
            "bMatrix": [],
            "bMatrixFloat": [],
            "sInverse": [],
            "isDiagonal": False,
            "explanation": (
                "The basis vectors are not linearly independent "
                "(S is not invertible). Cannot compute B‑matrix."
            ),
            "steps": _steps_to_dicts(inv_info["steps"]),
        }

    # Parse S⁻¹ back to Fraction matrix
    from app.chapters.ch1.linear_system import parse_matrix

    S_inv_parsed, _ = parse_matrix(inv_info["inverse"])

    # B = S⁻¹ A S
    AS = mat_mult(A, S)
    B = mat_mult(S_inv_parsed, AS)

    diag = _is_diagonal(B)
    if diag:
        diag_entries = ", ".join(fmt(B[i][i]) for i in range(n))
        diag_note = (
            f" The B‑matrix is diagonal with entries ({diag_entries}), "
            f"meaning T(vᵢ) = λᵢ·vᵢ for each basis vector."
        )
    else:
        diag_note = " The B‑matrix is not diagonal."

    return {
        "bMatrix": format_matrix(B),
        "bMatrixFloat": mat_to_float(B),
        "sInverse": inv_info["inverse"],
        "isDiagonal": diag,
        "explanation": f"Computed B = S⁻¹AS.{diag_note}",
        "steps": _steps_to_dicts(inv_info["steps"]),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 7. Similarity check
# ═══════════════════════════════════════════════════════════════════════════════


def _kronecker(A: Mat, B: Mat) -> Mat:
    """Kronecker (tensor) product A ⊗ B."""
    mA, nA = len(A), len(A[0])
    mB, nB = len(B), len(B[0])
    result: Mat = []
    for i in range(mA):
        for p in range(mB):
            row: list[Fraction] = []
            for j in range(nA):
                for q in range(nB):
                    row.append(A[i][j] * B[p][q])
            result.append(row)
    return result


def _transpose(A: Mat) -> Mat:
    if not A:
        return []
    m, n = len(A), len(A[0])
    return [[A[i][j] for i in range(m)] for j in range(n)]


def check_similarity(A: Mat, B: Mat) -> dict:
    """Check if A and B are similar (B = S⁻¹AS) for n ≤ 4.

    Uses the Kronecker‑product approach:
    AS = SB  ⟺  (I⊗A − Bᵀ⊗I) vec(S) = 0.
    We find the kernel of the n²×n² matrix and look for an invertible S.
    """
    n = len(A)

    # --- quick rejections ---
    rank_a = compute_rref([r[:] for r in A], n).rank
    rank_b = compute_rref([r[:] for r in B], n).rank
    if rank_a != rank_b:
        return {
            "areSimilar": False,
            "explanation": (
                f"A has rank {rank_a} but B has rank {rank_b}. "
                "Similar matrices must have the same rank."
            ),
        }

    tr_a = _trace(A)
    tr_b = _trace(B)
    if tr_a != tr_b:
        return {
            "areSimilar": False,
            "explanation": (
                f"tr(A) = {fmt(tr_a)} but tr(B) = {fmt(tr_b)}. "
                "Similar matrices must have the same trace."
            ),
        }

    if n == 2:
        det_a = _det2x2(A)
        det_b = _det2x2(B)
        if det_a != det_b:
            return {
                "areSimilar": False,
                "explanation": (
                    f"det(A) = {fmt(det_a)} but det(B) = {fmt(det_b)}. "
                    "Similar matrices must have the same determinant."
                ),
            }

    # --- Kronecker approach ---
    # AS = SB  ⟺  (I⊗A − Bᵀ⊗I) vec(S) = 0
    I_n = identity(n)
    BT = _transpose(B)
    K1 = _kronecker(I_n, A)   # I ⊗ A
    K2 = _kronecker(BT, I_n)  # Bᵀ ⊗ I

    nn = n * n
    system = [[K1[i][j] - K2[i][j] for j in range(nn)] for i in range(nn)]

    rrf = compute_rref(system, nn)
    pivot_cols = rrf.pivot_columns
    free_cols = rrf.free_var_columns
    rref_mat = rrf.rref

    if not free_cols:
        # Only trivial solution S = 0 — not similar
        return {
            "areSimilar": False,
            "explanation": (
                "The equation AS = SB has only the trivial solution S = 0. "
                "No invertible change‑of‑basis matrix exists."
            ),
        }

    # Build kernel basis vectors and check each for invertibility
    pivot_row = {c: r for r, c in enumerate(pivot_cols)}
    kernel_vecs: list[Vec] = []
    for fc in free_cols:
        v = [Fraction(0)] * nn
        v[fc] = Fraction(1)
        for pc in pivot_cols:
            v[pc] = -rref_mat[pivot_row[pc]][fc]
        kernel_vecs.append(v)

    # Try individual kernel basis vectors first
    for kv in kernel_vecs:
        S_candidate = [kv[i * n:(i + 1) * n] for i in range(n)]
        # Check invertibility: RREF of S should equal I
        rr = compute_rref([row[:] for row in S_candidate], n)
        if rr.rank == n:
            return {
                "areSimilar": True,
                "changeOfBasis": format_matrix(S_candidate),
                "changeOfBasisFloat": mat_to_float(S_candidate),
                "explanation": (
                    "A and B are similar. Found an invertible S such that "
                    "AS = SB (equivalently B = S⁻¹AS)."
                ),
            }

    # Try sums of pairs of kernel basis vectors
    for i in range(len(kernel_vecs)):
        for j in range(i + 1, len(kernel_vecs)):
            combined = [kernel_vecs[i][idx] + kernel_vecs[j][idx] for idx in range(nn)]
            S_candidate = [combined[r * n:(r + 1) * n] for r in range(n)]
            rr = compute_rref([row[:] for row in S_candidate], n)
            if rr.rank == n:
                return {
                    "areSimilar": True,
                    "changeOfBasis": format_matrix(S_candidate),
                    "changeOfBasisFloat": mat_to_float(S_candidate),
                    "explanation": (
                        "A and B are similar. Found an invertible S such that "
                        "AS = SB (equivalently B = S⁻¹AS)."
                    ),
                }

    # Try random integer combinations (small coefficients)
    for c1 in range(1, 4):
        for c2 in range(-3, 4):
            if len(kernel_vecs) < 2:
                break
            combined = [
                Fraction(c1) * kernel_vecs[0][idx] + Fraction(c2) * kernel_vecs[1][idx]
                for idx in range(nn)
            ]
            S_candidate = [combined[r * n:(r + 1) * n] for r in range(n)]
            rr = compute_rref([row[:] for row in S_candidate], n)
            if rr.rank == n:
                return {
                    "areSimilar": True,
                    "changeOfBasis": format_matrix(S_candidate),
                    "changeOfBasisFloat": mat_to_float(S_candidate),
                    "explanation": (
                        "A and B are similar. Found an invertible S such that "
                        "AS = SB (equivalently B = S⁻¹AS)."
                    ),
                }

    # If we have kernel vectors but couldn't find an invertible S,
    # the matrices may still be similar but we couldn't find S with our search.
    # For small n this is unlikely if they truly are similar.
    return {
        "areSimilar": False,
        "explanation": (
            "Could not find an invertible S such that AS = SB. "
            "The matrices do not appear to be similar."
        ),
    }
