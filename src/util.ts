import type { JSX } from "solid-js";

export async function request<T>(
  apiKey: string,
  path: string,
  params?: Record<string, string>,
  init?: RequestInit,
): Promise<T> {
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  if (params) for (const key in params) url.searchParams.set(key, params[key]);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    ...(init ?? {}),
  });
  const data = await res.json();

  if (res.status !== 200 || data.success === false)
    throw new Error(
      (data.status_message ?? res.statusText) || "Something went wrong.",
      { cause: data },
    );

  return data;
}

export async function* rateLimit<T = unknown>(
  promises: (() => Promise<T>)[],
  chunkSize: number = 5,
  waitTime: number = 1500,
) {
  for (let i = 0; true; i += chunkSize) {
    let requests = promises
      .slice(i, i + chunkSize)
      .map((callback) => callback());

    yield Promise.all(requests);

    if (i + chunkSize >= promises.length) break;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

export function useDocumentStyles() {
  return <K extends keyof JSX.CSSProperties>(
    value: K,
  ): JSX.CSSProperties[K] | any =>
    getComputedStyle(document.documentElement).getPropertyValue(value) as any;
}
