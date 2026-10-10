import { afterEach, describe, expect, it, vi } from "vitest";
import { cachedAtHeader, cachedFetch, isFresh, maxAge } from "./cache";

function stubCaches(): Map<string, Response> {
  const store = new Map<string, Response>();
  vi.stubGlobal("caches", {
    open: async () => ({
      match: async (url: string) => store.get(url)?.clone(),
      put: async (url: string, response: Response) => {
        store.set(url, response);
      },
    }),
  });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("isFresh", () => {
  const at = (time: number) =>
    new Response(null, { headers: { [cachedAtHeader]: String(time) } });

  it("accepts responses younger than maxAge", () => {
    expect(isFresh(at(1000), 1000 + maxAge - 1)).toBe(true);
  });

  it("rejects stale or unstamped responses", () => {
    expect(isFresh(at(1000), 1000 + maxAge)).toBe(false);
    expect(isFresh(new Response(null), 1000)).toBe(false);
  });
});

describe("cachedFetch", () => {
  it("loads on miss and serves from cache on hit", async () => {
    stubCaches();
    const load = vi.fn(async () => Response.json({ a: 1 }));
    const first = await cachedFetch("https://x/a", load);
    const second = await cachedFetch("https://x/a", load);
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(await second.response.json()).toEqual({ a: 1 });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads stale entries", async () => {
    stubCaches();
    vi.useFakeTimers({ toFake: ["Date"] });
    const load = vi.fn(async () => Response.json({}));
    await cachedFetch("https://x/a", load);
    vi.setSystemTime(Date.now() + maxAge);
    await cachedFetch("https://x/a", load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures", async () => {
    const store = stubCaches();
    await cachedFetch("https://x/a", async () => new Response(null, { status: 500 }));
    expect(store.size).toBe(0);
  });
});
