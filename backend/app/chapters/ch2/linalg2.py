"""Core linear‑algebra routines for Chapter 2 (Linear Transformations).

Reuses Chapter 1's exact‑arithmetic helpers (parse, fmt, RREF) and adds
matrix‑product, transform‑generation, inverse‑via‑augment, etc.
"""

from __future__ import annotations

import math
from fractions import Fraction

from app.chapters.ch1.linear_system import (
    RrefStep,
    compute_rref,
    fmt,
    format_matrix,
    parse_entry,
    parse_matrix,
)

# ═══════════════════════════════════════════════════════════════════════════════
# Matrix helpers
# ═══════════════════════════════════════════════════════════════════════════════

Mat = list[list[Fraction]]


def identity(n: int) -> Mat:
    return [[Fraction(1) if i == j else Fraction(0) for j in range(n)] for i in range(n)]


def mat_mult(A: Mat, B: Mat) -> Mat:
    """Multiply two Fraction matrices.  Caller must ensure dims match."""
    m, inner, p = len(A), len(A[0]), len(B[0])
    return [
        [sum(A[i][k] * B[k][j] for k in range(inner)) for j in range(p)]
        for i in range(m)
    ]


def mat_vec(M: Mat, v: list[Fraction]) -> list[Fraction]:
    return [sum(M[i][j] * v[j] for j in range(len(v))) for i in range(len(M))]


def mat_eq(A: Mat, B: Mat) -> bool:
    if len(A) != len(B):
        return False
    return all(
        len(A[i]) == len(B[i]) and all(A[i][j] == B[i][j] for j in range(len(A[i])))
        for i in range(len(A))
    )


def mat_to_float(M: Mat) -> list[list[float]]:
    return [[float(e) for e in row] for row in M]


def vec_to_float(v: list[Fraction]) -> list[float]:
    return [float(e) for e in v]


def fmt_vec(v: list[Fraction]) -> list[str]:
    return [fmt(e) for e in v]


def columns(M: Mat) -> list[list[Fraction]]:
    """Return list of column‑vectors of M."""
    if not M:
        return []
    cols = len(M[0])
    return [[M[r][c] for r in range(len(M))] for c in range(cols)]


# ═══════════════════════════════════════════════════════════════════════════════
# 2×2 transform presets
# ═══════════════════════════════════════════════════════════════════════════════

PRESET_META = [
    {
        "id": "rotation",
        "name": "Rotation",
        "paramsSchema": [{"name": "angle", "label": "Angle (°)", "min": -360, "max": 360, "step": 1, "default": 45}],
        "defaultParams": {"angle": 45},
        "description": "Rotates vectors counter‑clockwise by the given angle.",
    },
    {
        "id": "scaling",
        "name": "Scaling",
        "paramsSchema": [
            {"name": "sx", "label": "Scale X", "min": -5, "max": 5, "step": 0.1, "default": 2},
            {"name": "sy", "label": "Scale Y", "min": -5, "max": 5, "step": 0.1, "default": 1},
        ],
        "defaultParams": {"sx": 2, "sy": 1},
        "description": "Scales the x‑ and y‑components independently.",
    },
    {
        "id": "shear",
        "name": "Shear",
        "paramsSchema": [
            {"name": "kx", "label": "Shear X", "min": -5, "max": 5, "step": 0.1, "default": 1},
            {"name": "ky", "label": "Shear Y", "min": -5, "max": 5, "step": 0.1, "default": 0},
        ],
        "defaultParams": {"kx": 1, "ky": 0},
        "description": "Horizontal shear adds kx·y to x; vertical shear adds ky·x to y.",
    },
    {
        "id": "reflection",
        "name": "Reflection",
        "paramsSchema": [{"name": "angle", "label": "Line angle (°)", "min": 0, "max": 180, "step": 1, "default": 0}],
        "defaultParams": {"angle": 0},
        "description": "Reflects across a line through the origin at the given angle.",
    },
    {
        "id": "projection",
        "name": "Orthogonal Projection",
        "paramsSchema": [{"name": "angle", "label": "Line angle (°)", "min": 0, "max": 180, "step": 1, "default": 0}],
        "defaultParams": {"angle": 0},
        "description": "Projects onto a line through the origin ('shadow on the line').",
    },
    {
        "id": "rotation_scale",
        "name": "Rotation + Scaling",
        "paramsSchema": [
            {"name": "angle", "label": "Angle (°)", "min": -360, "max": 360, "step": 1, "default": 30},
            {"name": "scale", "label": "Scale factor", "min": 0.1, "max": 5, "step": 0.1, "default": 1.5},
        ],
        "defaultParams": {"angle": 30, "scale": 1.5},
        "description": "Rotation followed by uniform scaling.",
    },
]


def _build_2x2_float(preset: str, params: dict[str, float]) -> list[list[float]]:
    """Build a 2×2 float matrix from a preset id + params."""
    if preset == "rotation":
        a = math.radians(params.get("angle", 0))
        c, s = math.cos(a), math.sin(a)
        return [[c, -s], [s, c]]
    if preset == "scaling":
        return [[params.get("sx", 1), 0], [0, params.get("sy", 1)]]
    if preset == "shear":
        return [[1, params.get("kx", 0)], [params.get("ky", 0), 1]]
    if preset == "reflection":
        a = math.radians(params.get("angle", 0))
        c2, s2 = math.cos(2 * a), math.sin(2 * a)
        return [[c2, s2], [s2, -c2]]
    if preset == "projection":
        a = math.radians(params.get("angle", 0))
        c, s = math.cos(a), math.sin(a)
        return [[c * c, c * s], [c * s, s * s]]
    if preset == "rotation_scale":
        a = math.radians(params.get("angle", 0))
        sc = params.get("scale", 1)
        c, s = math.cos(a), math.sin(a)
        return [[sc * c, -sc * s], [sc * s, sc * c]]
    raise ValueError(f"Unknown preset: {preset}")


def build_2x2(preset: str, params: dict[str, float]) -> Mat:
    fl = _build_2x2_float(preset, params)
    return [[Fraction(fl[i][j]).limit_denominator(10**9) for j in range(2)] for i in range(2)]


# ═══════════════════════════════════════════════════════════════════════════════
# Matrix product with interpretation
# ═══════════════════════════════════════════════════════════════════════════════


def matrix_product_info(
    A: Mat, B: Mat, order: str
) -> dict:
    """Compute product + dimension explanation + column interpretation."""
    if order == "BA":
        A, B = B, A  # swap so we compute B*A in original labels

    mA, nA = len(A), len(A[0]) if A else 0
    mB, nB = len(B), len(B[0]) if B else 0

    label_first = "A" if order == "AB" else "B"
    label_second = "B" if order == "AB" else "A"

    if nA != mB:
        return {
            "defined": False,
            "reason": (
                f"{order} is not defined: {label_first} is {mA}×{nA} and "
                f"{label_second} is {mB}×{nB}; inner dimensions {nA} ≠ {mB}."
            ),
            "dimensionExplanation": (
                f"{label_first} has {nA} columns but {label_second} has {mB} rows — they must match."
            ),
        }

    product = mat_mult(A, B)

    # Column interpretation: columns of AB = A * (columns of B)
    cols_second = columns(B)
    mapped = [mat_vec(A, col) for col in cols_second]

    return {
        "defined": True,
        "reason": "Product is defined.",
        "product": product,
        "dimensionExplanation": (
            f"{order} is defined because {label_first} is {mA}×{nA} and "
            f"{label_second} is {mB}×{nB}; inner dimensions match ({nA}). "
            f"Result is {mA}×{nB}."
        ),
        "columnsOfSecond": cols_second,
        "mappedColumns": mapped,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Invertibility + inverse via augmentation
# ═══════════════════════════════════════════════════════════════════════════════


def check_invertibility(A: Mat) -> dict:
    n = len(A)
    rref_result = compute_rref([row[:n] for row in A], n)
    rref_mat = rref_result.rref
    eye = identity(n)
    rref_eq_id = mat_eq(rref_mat, eye)
    rank = rref_result.rank

    det_2x2 = None
    det_2x2_float = None
    if n == 2:
        det_2x2 = A[0][0] * A[1][1] - A[0][1] * A[1][0]
        det_2x2_float = float(det_2x2)

    invertible = rref_eq_id

    if invertible:
        explanation = (
            f"A is invertible: RREF(A) = I{n} (all {n} pivots present). "
            "The transformation is a bijection (one‑to‑one and onto)."
        )
    else:
        explanation = (
            f"A is NOT invertible: rank(A) = {rank} < {n}. "
            "RREF(A) ≠ Iₙ, so the transformation is not a bijection."
        )
    if n == 2:
        det_s = fmt(det_2x2)
        explanation += f" For 2×2: det = ad−bc = {det_s}"
        explanation += " ≠ 0 ✓." if det_2x2 != 0 else " = 0 ✗."

    return {
        "isInvertible": invertible,
        "n": n,
        "rank": rank,
        "determinant2x2": fmt(det_2x2) if det_2x2 is not None else None,
        "det2x2Float": det_2x2_float,
        "rref": format_matrix(rref_mat),
        "rrefEqualsIdentity": rref_eq_id,
        "explanation": explanation,
    }


def inverse_via_augment(A: Mat) -> dict:
    """Compute A⁻¹ by row‑reducing [A | I]."""
    n = len(A)
    eye = identity(n)
    # build augmented [A | I]
    aug = [A[i][:] + eye[i][:] for i in range(n)]

    rref_result = compute_rref(aug, n)
    rref_mat = rref_result.rref

    # check left block is identity
    left = [row[:n] for row in rref_mat]
    if mat_eq(left, identity(n)):
        inv = [row[n:] for row in rref_mat]
        return {
            "isInvertible": True,
            "inverse": format_matrix(inv),
            "inverseFloat": mat_to_float(inv),
            "steps": rref_result.steps,
            "explanation": (
                f"Row‑reduced [A|I] → [I|A⁻¹]. The right block is A⁻¹."
            ),
        }
    return {
        "isInvertible": False,
        "inverse": None,
        "inverseFloat": None,
        "steps": rref_result.steps,
        "explanation": (
            "Row reduction of [A|I] did not yield [I|…]; A is not invertible."
        ),
    }


def solve_bax_eq_y(A: Mat, B: Mat, y: list[Fraction]) -> dict:
    """Solve BAx = y  ⟹  x = A⁻¹ B⁻¹ y (when both invertible)."""
    inv_b_info = inverse_via_augment(B)
    if not inv_b_info["isInvertible"]:
        return {
            "solvable": False,
            "reason": "B is not invertible, cannot solve BAx = y via inverses.",
            "derivation": "",
        }

    inv_a_info = inverse_via_augment(A)
    if not inv_a_info["isInvertible"]:
        return {
            "solvable": False,
            "reason": "A is not invertible, cannot solve BAx = y via inverses.",
            "derivation": "",
        }

    # parse inverse matrices back from strings
    B_inv, _ = parse_matrix(inv_b_info["inverse"])
    A_inv, _ = parse_matrix(inv_a_info["inverse"])

    z = mat_vec(B_inv, y)
    x = mat_vec(A_inv, z)

    derivation = (
        "BAx = y  ⟹  Ax = B⁻¹y  ⟹  x = A⁻¹(B⁻¹y).\n"
        f"Step 1: z = B⁻¹y = {fmt_vec(z)}\n"
        f"Step 2: x = A⁻¹z = {fmt_vec(x)}"
    )

    return {
        "solvable": True,
        "x": fmt_vec(x),
        "xFloat": vec_to_float(x),
        "z": fmt_vec(z),
        "zFloat": vec_to_float(z),
        "derivation": derivation,
    }
