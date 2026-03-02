"""Pydantic request / response models for Chapter 2 endpoints."""

from __future__ import annotations

from pydantic import BaseModel


# ── Requests ──────────────────────────────────────────────────────────────────


class TransformPresetRequest(BaseModel):
    preset: str  # rotation, scaling, shear, reflection, projection, rotation_scale
    params: dict[str, float]  # e.g. {"angle": 45} or {"sx": 2, "sy": 0.5}


class ApplyTransform2DRequest(BaseModel):
    matrix: list[list[str]] | None = None  # 2×2 direct entry
    preset: str | None = None
    params: dict[str, float] | None = None
    vectors: list[list[str]]  # list of 2-vectors as string fractions


class MatrixProductRequest(BaseModel):
    A: list[list[str]]
    B: list[list[str]]
    order: str = "AB"  # "AB" or "BA"


class Compose2DRequest(BaseModel):
    A: list[list[str]]  # 2×2
    B: list[list[str]]  # 2×2
    vectors: list[list[str]]  # list of 2-vectors


class InvertibilityRequest(BaseModel):
    matrix: list[list[str]]


class InverseAugmentRequest(BaseModel):
    matrix: list[list[str]]


class SolveBAXRequest(BaseModel):
    A: list[list[str]]
    B: list[list[str]]
    y: list[str]


# ── Responses ─────────────────────────────────────────────────────────────────


class TransformPresetInfo(BaseModel):
    id: str
    name: str
    paramsSchema: list[dict]
    defaultParams: dict[str, float]
    description: str


class MetadataResponse(BaseModel):
    presets: list[TransformPresetInfo]


class ApplyTransform2DResponse(BaseModel):
    matrix: list[list[str]]
    matrixFloat: list[list[float]]
    transformedVectors: list[list[str]]
    transformedVectorsFloat: list[list[float]]
    interpretation: str


class MatrixProductResponse(BaseModel):
    defined: bool
    reason: str
    product: list[list[str]] | None = None
    productFloat: list[list[float]] | None = None
    dimensionExplanation: str
    columnsOfFirst: list[list[str]] | None = None
    mappedColumns: list[list[str]] | None = None


class Compose2DResponse(BaseModel):
    AB: list[list[str]]
    BA: list[list[str]]
    ABFloat: list[list[float]]
    BAFloat: list[list[float]]
    pointsAB: list[list[float]]
    pointsBA: list[list[float]]
    commute: bool
    explanation: str


class RrefStepModel(BaseModel):
    operation: dict
    description: str
    matrix: list[list[str]]


class InvertibilityResponse(BaseModel):
    isInvertible: bool
    n: int
    rank: int
    determinant2x2: str | None = None
    det2x2Float: float | None = None
    rref: list[list[str]]
    rrefEqualsIdentity: bool
    explanation: str


class InverseAugmentResponse(BaseModel):
    isInvertible: bool
    inverse: list[list[str]] | None = None
    inverseFloat: list[list[float]] | None = None
    steps: list[RrefStepModel]
    explanation: str


class SolveBAXResponse(BaseModel):
    solvable: bool
    x: list[str] | None = None
    xFloat: list[float] | None = None
    z: list[str] | None = None
    zFloat: list[float] | None = None
    derivation: str
    reason: str | None = None
