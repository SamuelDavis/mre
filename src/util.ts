import { isNumber } from "@samueldavis/solidlib";

export const rateLimitInterval = 2000;
export const rateLimitMaxUsage = 20;
export const usage = new Set<string>();
export const cache = new Map<string, any>();

export async function tmdbRequest<T>(
  init: RequestInit,
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  // build request
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  if (params) for (const key in params) url.searchParams.set(key, params[key]);
  const key = url.toString();

  // temporarily disabled caching to test rate limiting
  if (cache.has(key)) return cache.get(key)!;

  // wait until rate limit has capacity
  // N requests per T time
  // `rateLimitUsage` is cleared every T
  if (usage.size >= rateLimitMaxUsage)
    await waitUntil(() => usage.size < rateLimitMaxUsage);
  // track rate limited usage this tick
  usage.add(key);

  // actually fetch data
  const res = await fetch(key, init);
  const data = await res.json();
  if (res.status !== 200 || data.success === false)
    throw new Error(
      (data.status_message ?? res.statusText) || "Something went wrong.",
      { cause: data },
    );

  // cache result (presume valid for lifetime of browser session)
  cache.set(key, data);
  return data;
}

export function waitUntil(
  cb: number | (() => boolean),
  time = 250,
): Promise<void> {
  const now = performance.now();
  const isDone = isNumber(cb) ? () => performance.now() >= now + cb : cb;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!isDone()) return;
      clearInterval(interval);
      resolve();
    }, time);
  });
}

export function safe<T>(v: T, def: NonNullable<T>): NonNullable<T> {
  return v ?? def;
}
