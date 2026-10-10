export const cacheName = "tmdb";
export const maxAge = 7 * 24 * 60 * 60 * 1000;
export const cachedAtHeader = "x-cached-at";

export type CachedResponse = { response: Response; cached: boolean };

export function isFresh(response: Response, now: number): boolean {
  const cachedAt = Number(response.headers.get(cachedAtHeader));
  return cachedAt > 0 && now - cachedAt < maxAge;
}

export async function cachedFetch(
  url: string,
  load: () => Promise<Response>,
): Promise<CachedResponse> {
  if (!("caches" in globalThis))
    return { response: await load(), cached: false };

  const cache = await caches.open(cacheName);
  const hit = await cache.match(url);
  if (hit && isFresh(hit, Date.now())) return { response: hit, cached: true };

  const response = await load();
  if (!response.ok) return { response, cached: false };

  const body = await response.arrayBuffer();
  const headers = {
    "content-type": response.headers.get("content-type") ?? "application/json",
    [cachedAtHeader]: String(Date.now()),
  };
  await cache.put(url, new Response(body, { headers }));
  return { response: new Response(body, { headers }), cached: false };
}
