const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<{ status: string }>("/health"),
  getChapters: () => request<{ chapters: import("./types").ChapterMeta[] }>("/api/chapters"),
  getChapterPlaceholder: (chapterId: string) =>
    request<import("./types").ChapterPlaceholderResponse>(`/api/chapters/${chapterId}`),
};
