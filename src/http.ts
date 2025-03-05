import { httpCache } from "./state";
import type { Api, ApiFactory, ErrorResponse, PathFactory } from "./types";
import { isErrorResponse } from "./types";

export const apiFactory = new Proxy(
  {},
  {
    get<Key extends keyof Api>(
      _target: never,
      p: Key | "rateLimit",
      _receiver: never,
    ) {
      if (p === "rateLimit") return 25;
      return (request: Api[Key]["request"]) => {
        const path = urlFactory[p](request);
        const url = new URL(`${path}`);
        for (const key in request)
          url.searchParams.set(key, String(request[key]));
        return cachingFetch<Api[Key]["response"]>(url);
      };
    },
  },
) as ApiFactory & { rateLimit: number };

const urlFactory: PathFactory = {
  searchTv() {
    return new URL("https://api.themoviedb.org/3/search/tv");
  },
  tvSeriesDetails(request) {
    return new URL(
      `https://api.themoviedb.org/3/tv/${request.series_id}?append_to_response=credits`,
    );
  },
  personTvCredits(request) {
    return new URL(
      `https://api.themoviedb.org/3/person/${request.person_id}/tv_credits?append_to_response=credits`,
    );
  },
};

async function cachingFetch<Data extends object>(url: URL): Promise<Data> {
  const apiKey = httpCache.getApiKey();
  const key = url.toString();
  const body =
    httpCache.getRequest(key) ??
    (await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }).then((res) => res.text()));

  if (!(typeof body === "string")) throw new TypeError();
  const data: ErrorResponse | Data = JSON.parse(body);

  if (isErrorResponse(data)) throw new Error(data.status_message);
  // httpCache.setRequest(key, body);
  return data;
}
