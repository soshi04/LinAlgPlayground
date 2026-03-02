"""Core linear‑algebra engine using exact rational arithmetic (fractions.Fraction).

Every number is stored and manipulated as a ``Fraction``; strings are the
external interchange format.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from fractions import Fraction

# ═══════════════════════════════════════════════════════════════════════════════
# Parsing & formatting
# ═══════════════════════════════════════════════════════════════════════════════


def parse_entry(s: str) -> Fraction:
    """Parse a user‑supplied string into an exact *Fraction*.

    Accepted formats: ``"3"``, ``"-2"``, ``"0.25"``, ``"7/3"``, ``" -1/2 "``.
    """
    s = s.strip()
    if not s:
        return Fraction(0)
    if "/" in s:
        parts = s.split("/", 1)
        try:
            return Fraction(int(parts[0].strip()), int(parts[1].strip()))
        except (ValueError, ZeroDivisionError) as exc:
            raise ValueError(f"Invalid fraction '{s}': {exc}") from exc
    try:
        return Fraction(Decimal(s))
    except (InvalidOperation, ValueError, ArithmeticError):
        pass
    try:
        return Fraction(int(s))
    except ValueError:
        pass
    raise ValueError(f"Cannot parse '{s}' as a number")


def fmt(f: Fraction) -> str:
    """Minimal string representation of a *Fraction*."""
    return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"


def parse_matrix(raw: list[list[str]]) -> tuple[list[list[Fraction]], list[str]]:
    errors: list[str] = []
    result: list[list[Fraction]] = []
    for i, row in enumerate(raw):
        frac_row: list[Fraction] = []
        for j, entry in enumerate(row):
            try:
                frac_row.append(parse_entry(entry))
            except ValueError as e:
                errors.append(f"Row {i + 1}, Col {j + 1}: {e}")
                frac_row.append(Fraction(0))
        result.append(frac_row)
    return result, errors


def format_matrix(mat: list[list[Fraction]]) -> list[list[str]]:
    return [[fmt(e) for e in row] for row in mat]


# ═══════════════════════════════════════════════════════════════════════════════
# Elementary row operations
# ═══════════════════════════════════════════════════════════════════════════════


def swap_rows(mat: list[list[Fraction]], r1: int, r2: int) -> list[list[Fraction]]:
    out = [row[:] for row in mat]
    out[r1], out[r2] = out[r2], out[r1]
    return out


def scale_row(mat: list[list[Fraction]], r: int, k: Fraction) -> list[list[Fraction]]:
    out = [row[:] for row in mat]
    out[r] = [e * k for e in out[r]]
    return out


def add_rows(
    mat: list[list[Fraction]], target: int, source: int, k: Fraction
) -> list[list[Fraction]]:
    out = [row[:] for row in mat]
    n = len(out[0])
    out[target] = [out[target][j] + k * out[source][j] for j in range(n)]
    return out


def _to_frac(v: object) -> Fraction:
    if isinstance(v, Fraction):
        return v
    return parse_entry(str(v))


def describe_op(op: dict) -> str:
    """Human‑readable description of an elementary row operation."""
    kind = op["kind"]
    if kind == "swap":
        return f"R{op['r1'] + 1} ↔ R{op['r2'] + 1}"
    if kind == "scale":
        k = _to_frac(op["k"])
        ks = fmt(k)
        label = ks if k.denominator == 1 else f"({ks})"
        return f"R{op['r'] + 1} ← {label}·R{op['r'] + 1}"
    if kind == "add":
        k = _to_frac(op["k"])
        t, s = op["target"], op["source"]
        ak = abs(k)
        if ak == 1:
            kp = ""
        elif ak.denominator == 1:
            kp = f"{ak.numerator}·"
        else:
            kp = f"({fmt(ak)})·"
        if k > 0:
            return f"R{t + 1} ← R{t + 1} + {kp}R{s + 1}"
        if k < 0:
            return f"R{t + 1} ← R{t + 1} − {kp}R{s + 1}"
        return f"R{t + 1} ← R{t + 1}"
    return "?"


# ═══════════════════════════════════════════════════════════════════════════════
# RREF (Gauss–Jordan elimination with step capture)
# ═══════════════════════════════════════════════════════════════════════════════


@dataclass
class RrefStep:
    operation: dict
    description: str
    matrix_snapshot: list[list[str]]


@dataclass
class RrefResult:
    rref: list[list[Fraction]]
    steps: list[RrefStep] = field(default_factory=list)
    pivot_columns: list[int] = field(default_factory=list)
    rank: int = 0
    free_var_columns: list[int] = field(default_factory=list)


def compute_rref(matrix: list[list[Fraction]], num_vars: int) -> RrefResult:
    m = len(matrix)
    if m == 0:
        return RrefResult(rref=[])

    mat = [row[:] for row in matrix]
    steps: list[RrefStep] = []
    pivot_cols: list[int] = []
    cur = 0  # current pivot row

    for col in range(num_vars):
        if cur >= m:
            break
        # find first nonzero at or below cur
        pr = None
        for r in range(cur, m):
            if mat[r][col] != 0:
                pr = r
                break
        if pr is None:
            continue

        # swap into position
        if pr != cur:
            mat = swap_rows(mat, cur, pr)
            op = {"kind": "swap", "r1": cur, "r2": pr}
            steps.append(RrefStep(op, describe_op(op), format_matrix(mat)))

        pivot_cols.append(col)

        # scale so pivot = 1
        pv = mat[cur][col]
        if pv != 1:
            k = Fraction(1) / pv
            mat = scale_row(mat, cur, k)
            op = {"kind": "scale", "r": cur, "k": fmt(k)}
            steps.append(RrefStep(op, describe_op(op), format_matrix(mat)))

        # eliminate every other entry in this column
        for r in range(m):
            if r != cur and mat[r][col] != 0:
                k = -mat[r][col]
                mat = add_rows(mat, r, cur, k)
                op = {"kind": "add", "target": r, "source": cur, "k": fmt(k)}
                steps.append(RrefStep(op, describe_op(op), format_matrix(mat)))

        cur += 1

    free = sorted(set(range(num_vars)) - set(pivot_cols))
    return RrefResult(
        rref=mat,
        steps=steps,
        pivot_columns=pivot_cols,
        rank=len(pivot_cols),
        free_var_columns=free,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Solve
# ═══════════════════════════════════════════════════════════════════════════════


def _fmt_expr(constant: Fraction, coeffs: list[tuple[str, Fraction]]) -> str:
    """Format ``constant + Σ coeff·param`` as a readable string."""
    parts: list[str] = []
    has_terms = any(c != 0 for _, c in coeffs)
    if constant != 0 or not has_terms:
        parts.append(fmt(constant))
    for param, coeff in coeffs:
        if coeff == 0:
            continue
        ac = abs(coeff)
        sign = "+" if coeff > 0 else "−"
        if ac == 1:
            term = param
        elif ac.denominator == 1:
            term = f"{ac.numerator}{param}"
        else:
            term = f"({fmt(ac)}){param}"
        if not parts:
            parts.append(f"−{term}" if coeff < 0 else term)
        else:
            parts.append(f"{sign} {term}")
    return " ".join(parts) if parts else "0"


@dataclass
class SolveResult:
    classification: str = "none"
    rank_a: int = 0
    rank_ab: int = 0
    num_vars: int = 0
    num_eqs: int = 0
    solution: list[str] | None = None
    parametric: dict | None = None
    reason: str | None = None


def solve_system(matrix: list[list[Fraction]], num_vars: int) -> SolveResult:
    m = len(matrix)
    rr = compute_rref(matrix, num_vars)
    mat = rr.rref
    pcols = rr.pivot_columns
    rank_a = rr.rank

    # inconsistency check
    rank_ab = rank_a
    reason = None
    for i in range(m):
        if all(mat[i][j] == 0 for j in range(num_vars)) and mat[i][num_vars] != 0:
            rank_ab = rank_a + 1
            bv = fmt(mat[i][num_vars])
            reason = f"Row {i + 1} gives 0 = {bv} — contradiction"
            break

    res = SolveResult(rank_a=rank_a, rank_ab=rank_ab, num_vars=num_vars, num_eqs=m)

    if rank_a != rank_ab:
        res.classification = "none"
        res.reason = reason or "rank(A) ≠ rank([A|b])"
        return res

    if rank_a == num_vars:
        res.classification = "unique"
        sol = [Fraction(0)] * num_vars
        for ri, c in enumerate(pcols):
            sol[c] = mat[ri][num_vars]
        res.solution = [fmt(s) for s in sol]
        return res

    # infinite solutions
    res.classification = "infinite"
    fcols = rr.free_var_columns
    pnames: dict[int, str] = {}
    for idx, fc in enumerate(fcols):
        pnames[fc] = f"t{idx + 1}" if len(fcols) > 1 else "t"

    exprs: list[dict] = []
    for vi in range(num_vars):
        vn = f"x{vi + 1}"
        if vi in fcols:
            exprs.append(
                {
                    "variable": vn,
                    "expression": f"{vn} = {pnames[vi]}",
                    "isFree": True,
                    "paramName": pnames[vi],
                }
            )
        elif vi in pcols:
            ri = pcols.index(vi)
            const = mat[ri][num_vars]
            coeffs = [(pnames[fc], -mat[ri][fc]) for fc in fcols]
            exprs.append(
                {
                    "variable": vn,
                    "expression": f"{vn} = {_fmt_expr(const, coeffs)}",
                    "isFree": False,
                }
            )

    res.parametric = {
        "expressions": exprs,
        "freeVariables": [pnames[fc] for fc in fcols],
        "parameterNames": {pnames[fc]: f"x{fc + 1}" for fc in fcols},
    }
    return res


# ═══════════════════════════════════════════════════════════════════════════════
# Next‑step hint
# ═══════════════════════════════════════════════════════════════════════════════


def next_step_hint(
    matrix: list[list[Fraction]], num_vars: int
) -> tuple[dict | None, str]:
    """Return ``(operation, explanation)`` for the next RREF step."""
    m = len(matrix)
    if m == 0:
        return None, "Matrix is empty."

    mat = matrix
    cur = 0
    for col in range(num_vars):
        if cur >= m:
            break
        # already a proper pivot?
        if mat[cur][col] == 1 and all(
            mat[r][col] == 0 for r in range(m) if r != cur
        ):
            cur += 1
            continue

        # find first nonzero at or below cur
        pr = None
        for r in range(cur, m):
            if mat[r][col] != 0:
                pr = r
                break
        if pr is None:
            continue

        if pr != cur:
            op = {"kind": "swap", "r1": cur, "r2": pr}
            return (
                op,
                f"Swap R{cur + 1} and R{pr + 1} to place a nonzero entry "
                f"in the pivot position for column {col + 1}.",
            )

        if mat[cur][col] != 1:
            k = Fraction(1) / mat[cur][col]
            op = {"kind": "scale", "r": cur, "k": fmt(k)}
            return (
                op,
                f"Scale R{cur + 1} by {fmt(k)} so the leading entry "
                f"in column {col + 1} becomes 1.",
            )

        for r in range(m):
            if r != cur and mat[r][col] != 0:
                k = -mat[r][col]
                op = {"kind": "add", "target": r, "source": cur, "k": fmt(k)}
                ev = fmt(mat[r][col])
                return (
                    op,
                    f"Eliminate the {ev} in R{r + 1}, column {col + 1}, "
                    f"using the pivot in R{cur + 1}.",
                )

        cur += 1

    return None, "The matrix is already in reduced row echelon form."
