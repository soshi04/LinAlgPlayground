import { request } from "@/app/api/client";
import type {
  ApplyRowOpRequest,
  ApplyRowOpResponse,
  HintResponse,
  MatrixPayload,
  NormalizeResponse,
  RrefResponse,
  SolveResponse,
} from "./types";

const CH1 = "/api/chapters/ch1";

export const ch1Api = {
  normalize: (payload: MatrixPayload) =>
    request<NormalizeResponse>(`${CH1}/normalize`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  applyRowOp: (payload: ApplyRowOpRequest) =>
    request<ApplyRowOpResponse>(`${CH1}/apply-row-op`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  computeRref: (payload: MatrixPayload) =>
    request<RrefResponse>(`${CH1}/rref`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  solve: (payload: MatrixPayload) =>
    request<SolveResponse>(`${CH1}/solve`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  nextStepHint: (payload: MatrixPayload) =>
    request<HintResponse>(`${CH1}/next-step-hint`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
