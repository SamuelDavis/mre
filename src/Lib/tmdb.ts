import { createSignal, type Accessor } from "solid-js";
import { cachedFetch } from "./cache";
import { createLimiter } from "./limiter";
import { parseKey } from "./model";
import type {
  CombinedCredits,
  Details,
  MediaKey,
  MovieDetails,
  PersonId,
  SearchMulti,
  TvDetails,
} from "../Types/TMDB";

export type Stats = {
  pending: number;
  fetched: number;
  cached: number;
  failed: number;
};

export type Tmdb = {
  getStats: Accessor<Stats>;
  authenticate(token: string): Promise<void>;
  search(query: string): Promise<SearchMulti>;
  details(key: MediaKey): Promise<Details>;
  credits(id: PersonId): Promise<CombinedCredits>;
};

type RequestOptions = {
  params?: Record<string, string>;
  token?: string;
  cache?: boolean;
};

const baseUrl = "https://api.themoviedb.org/3/";
const maxAttempts = 3;

export function createTmdb(getToken: Accessor<string>, concurrency = 8): Tmdb {
  const limit = createLimiter(concurrency);
  const [getStats, setStats] = createSignal<Stats>({
    pending: 0,
    fetched: 0,
    cached: 0,
    failed: 0,
  });

  function count(key: keyof Stats, delta: number): void {
    setStats((stats) => ({ ...stats, [key]: stats[key] + delta }));
  }

  async function load(url: string, token: string): Promise<Response> {
    for (let attempt = 1; ; attempt++) {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 429 || attempt >= maxAttempts) return response;
      const seconds = Number(response.headers.get("retry-after")) || attempt;
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
  }

  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params = {}, token = getToken(), cache = true } = options;
    const url = new URL(path, baseUrl);
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);

    function loadLimited(): Promise<Response> {
      return limit(() => load(url.href, token));
    }

    count("pending", 1);
    try {
      const { response, cached } = cache
        ? await cachedFetch(url.href, loadLimited)
        : { response: await loadLimited(), cached: false };
      const json = await response.json();
      if (!response.ok || json.success === false)
        throw new Error(
          json.status_message ?? response.statusText ?? "Request failed.",
          { cause: json },
        );
      count(cached ? "cached" : "fetched", 1);
      return json as T;
    } catch (error) {
      count("failed", 1);
      throw error;
    } finally {
      count("pending", -1);
    }
  }

  return {
    getStats,
    async authenticate(token) {
      await request("authentication", { token, cache: false });
    },
    search(query) {
      return request<SearchMulti>("search/multi", { params: { query } });
    },
    async details(key) {
      const { media, id } = parseKey(key);
      switch (media) {
        case "movie":
          return {
            media,
            data: await request<MovieDetails>(`movie/${id}`, {
              params: { append_to_response: "credits" },
            }),
          };
        case "tv":
          return {
            media,
            data: await request<TvDetails>(`tv/${id}`, {
              params: { append_to_response: "aggregate_credits" },
            }),
          };
      }
    },
    credits(id) {
      return request<CombinedCredits>(`person/${id}/combined_credits`);
    },
  };
}
