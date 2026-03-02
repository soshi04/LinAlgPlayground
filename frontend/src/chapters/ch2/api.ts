import { request } from "@/app/api/client";
import type {
  ApplyTransform2DRequest,
  ApplyTransform2DResponse,
  Compose2DRequest,
  Compose2DResponse,
  InverseAugmentResponse,
  InvertibilityResponse,
  MatrixProductRequest,
  MatrixProductResponse,
  MetadataResponse,
  SolveBAXResponse,
} from "./types";

const CH2 = "/api/chapters/ch2";

export const ch2Api = {
  metadata: () => request<MetadataResponse>(`${CH2}/metadata`),

  matrixProduct: (req: MatrixProductRequest) =>
    request<MatrixProductResponse>(`${CH2}/matrix-product`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  applyTransform2D: (req: ApplyTransform2DRequest) =>
    request<ApplyTransform2DResponse>(`${CH2}/apply-transform-2d`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  compose2D: (req: Compose2DRequest) =>
    request<Compose2DResponse>(`${CH2}/compose-2d`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  invertibility: (matrix: string[][]) =>
    request<InvertibilityResponse>(`${CH2}/invertibility`, {
      method: "POST",
      body: JSON.stringify({ matrix }),
    }),

  inverseViaAugment: (matrix: string[][]) =>
    request<InverseAugmentResponse>(`${CH2}/inverse-via-augment`, {
      method: "POST",
      body: JSON.stringify({ matrix }),
    }),

  solveBAX: (A: string[][], B: string[][], y: string[]) =>
    request<SolveBAXResponse>(`${CH2}/solve-bax`, {
      method: "POST",
      body: JSON.stringify({ A, B, y }),
    }),
};
