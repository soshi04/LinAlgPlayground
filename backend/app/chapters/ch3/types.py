"""Pydantic request / response models for Chapter 3."""

from __future__ import annotations

from pydantic import BaseModel


# ═══════════════════════════════════════════════════════════════════════════════
# Request models
# ═══════════════════════════════════════════════════════════════════════════════


class MatrixInput(BaseModel):
    matrix: list[list[str]]


class VectorsInput(BaseModel):
    vectors: list[list[str]]


class VectorInSpanRequest(BaseModel):
    vectors: list[list[str]]
    target: list[str]


class CoordinateRequest(BaseModel):
    basis: list[list[str]]
    vector: list[str]


class BMatrixRequest(BaseModel):
    A: list[list[str]]
    basis: list[list[str]]


class SimilarityRequest(BaseModel):
    A: list[list[str]]
    B: list[list[str]]


# ═══════════════════════════════════════════════════════════════════════════════
# Shared step model (mirrors Ch1/Ch2 pattern)
# ═══════════════════════════════════════════════════════════════════════════════


class RrefStepModel(BaseModel):
    operation: dict
    description: str
    matrix: list[list[str]]


# ═══════════════════════════════════════════════════════════════════════════════
# Response models
# ═══════════════════════════════════════════════════════════════════════════════


class ImageKernelResponse(BaseModel):
    rref: list[list[str]]
    steps: list[RrefStepModel]
    pivotColumns: list[int]
    freeVarColumns: list[int]
    rank: int
    nullity: int
    numCols: int
    rankNullityCheck: str
    imageBasis: list[list[str]]
    kernelBasis: list[list[str]]
    columnLabels: list[str]


class LinearIndependenceResponse(BaseModel):
    independent: bool
    rank: int
    numVectors: int
    explanation: str
    rref: list[list[str]]
    steps: list[RrefStepModel]
    redundantIndices: list[int]
    basisIndices: list[int]


class VectorInSpanResponse(BaseModel):
    inSpan: bool
    explanation: str
    coefficients: list[str] | None = None
    rref: list[list[str]]
    steps: list[RrefStepModel]


class BasisDimensionResponse(BaseModel):
    isBasis: bool
    dimension: int
    explanation: str
    basisVectors: list[list[str]]
    basisIndices: list[int]
    redundantIndices: list[int]
    rref: list[list[str]]
    steps: list[RrefStepModel]


class CoordinateResponse(BaseModel):
    coordinateVector: list[str]
    coordinateVectorFloat: list[float]
    reconstructed: list[str]
    reconstructedFloat: list[float]
    explanation: str
    steps: list[RrefStepModel]


class BMatrixResponse(BaseModel):
    bMatrix: list[list[str]]
    bMatrixFloat: list[list[float]]
    sInverse: list[list[str]]
    isDiagonal: bool
    explanation: str
    steps: list[RrefStepModel]


class SimilarityResponse(BaseModel):
    areSimilar: bool
    changeOfBasis: list[list[str]] | None = None
    changeOfBasisFloat: list[list[float]] | None = None
    explanation: str
