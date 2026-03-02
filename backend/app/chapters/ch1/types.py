"""Pydantic request / response models for Chapter 1 endpoints."""

from __future__ import annotations

from pydantic import BaseModel
from typing import Literal


# ── Requests ──────────────────────────────────────────────────────────────────


class MatrixPayload(BaseModel):
    matrix: list[list[str]]
    augmented: bool = True
    numVars: int
    numEqs: int


class RowOpPayload(BaseModel):
    kind: Literal["swap", "scale", "add"]
    r1: int | None = None
    r2: int | None = None
    r: int | None = None
    k: str | None = None
    target: int | None = None
    source: int | None = None


class ApplyRowOpRequest(BaseModel):
    matrix: list[list[str]]
    operation: RowOpPayload
    augmented: bool = True
    numVars: int
    numEqs: int


# ── Responses ─────────────────────────────────────────────────────────────────


class NormalizeResponse(BaseModel):
    matrix: list[list[str]]
    errors: list[str]


class RrefStepModel(BaseModel):
    operation: dict
    description: str
    matrix: list[list[str]]


class ApplyRowOpResponse(BaseModel):
    matrix: list[list[str]]
    description: str
    warnings: list[str]


class RrefResponse(BaseModel):
    rref: list[list[str]]
    steps: list[RrefStepModel]
    pivotColumns: list[int]
    rank: int
    freeVarColumns: list[int]


class ParametricExpression(BaseModel):
    variable: str
    expression: str
    isFree: bool
    paramName: str | None = None


class ParametricSolution(BaseModel):
    expressions: list[ParametricExpression]
    freeVariables: list[str]
    parameterNames: dict[str, str]


class SolveResponse(BaseModel):
    classification: Literal["unique", "infinite", "none"]
    rankA: int
    rankAb: int
    numVars: int
    numEqs: int
    solution: list[str] | None = None
    parametricSolution: ParametricSolution | None = None
    reason: str | None = None


class HintResponse(BaseModel):
    operation: dict | None = None
    explanation: str
