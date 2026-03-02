import { request } from "@/app/api/client";
import type {
  BasisDimensionResponse,
  BMatrixResponse,
  CoordinateResponse,
  ImageKernelResponse,
  LinearIndependenceResponse,
  SimilarityResponse,
  VectorInSpanResponse,
} from "./types";

const CH3 = "/api/chapters/ch3";

export const ch3Api = {
  imageKernel: (matrix: string[][]) =>
    request<ImageKernelResponse>(`${CH3}/image-kernel`, {
      method: "POST",
      body: JSON.stringify({ matrix }),
    }),

  linearIndependence: (vectors: string[][]) =>
    request<LinearIndependenceResponse>(`${CH3}/linear-independence`, {
      method: "POST",
      body: JSON.stringify({ vectors }),
    }),

  vectorInSpan: (vectors: string[][], target: string[]) =>
    request<VectorInSpanResponse>(`${CH3}/vector-in-span`, {
      method: "POST",
      body: JSON.stringify({ vectors, target }),
    }),

  basisDimension: (vectors: string[][]) =>
    request<BasisDimensionResponse>(`${CH3}/basis-dimension`, {
      method: "POST",
      body: JSON.stringify({ vectors }),
    }),

  coordinateVector: (basis: string[][], vector: string[]) =>
    request<CoordinateResponse>(`${CH3}/coordinate-vector`, {
      method: "POST",
      body: JSON.stringify({ basis, vector }),
    }),

  bMatrix: (A: string[][], basis: string[][]) =>
    request<BMatrixResponse>(`${CH3}/b-matrix`, {
      method: "POST",
      body: JSON.stringify({ A, basis }),
    }),

  checkSimilarity: (A: string[][], B: string[][]) =>
    request<SimilarityResponse>(`${CH3}/check-similarity`, {
      method: "POST",
      body: JSON.stringify({ A, B }),
    }),
};
