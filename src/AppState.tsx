import { persist } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import {
  ApiError,
  type MovieCastCredit,
  type MovieCrewCredit,
  type MovieDetails,
  type MultiSearchResult,
  type PersonDetails,
  type SearchResults,
  type TvSeriesCastCredit,
  type TvSeriesCrewCredit,
  type TvSeriesDetails,
} from "./types";

type AppState = {
  apiKey: string;
  q?: string;
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore<AppState>({
      apiKey: "",
    }),
    { key: "state" },
  );

  return (
    <AppStateContext.Provider value={[appState, setAppState]}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}

export function useApiKey() {
  const [appState, setAppState] = useAppState();
  return [
    () => appState.apiKey,
    (value: string) => setAppState(produce((state) => (state.apiKey = value))),
  ] as const;
}

export function useSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams<{ q: string }>();
  const [appState, setAppState] = useAppState();

  const get = (): string => {
    const value = searchParams.q ?? appState.q ?? "";
    set(value); // fine-grained updates means this shouldn't loop
    return value;
  };

  const set = (value?: string) => {
    value = value?.trim() ? value : undefined;
    setSearchParams({ q: value });
    setAppState(produce((state) => (state.q = value)));
  };

  return [get, set] as const;
}

export function useApi() {
  return {
    requestSearchMulti(
      query: string,
    ): Promise<SearchResults<MultiSearchResult>> {
      return request("/search/multi", { query });
    },
    requestDetails<T extends Pick<MultiSearchResult, "media_type" | "id">>(
      props: T,
    ): Promise<
      {
        movie: MovieDetails & {
          credits: { cast: MovieCastCredit[]; crew: MovieCrewCredit[] };
        };
        tv: TvSeriesDetails & {
          credits: { cast: TvSeriesCastCredit[]; crew: TvSeriesCrewCredit[] };
        };
        person: PersonDetails;
      }[T["media_type"]]
    > {
      return request(`/${props.media_type}/${props.id}`, {
        append_to_response: "credits",
      });
    },
  };
}

async function request<T extends Record<string, any>>(
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  const [getApiKey] = useApiKey();
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  for (const [key, value] of Object.entries(query ?? {}))
    url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  const text = await response.text();
  const json = JSON.parse(text);

  if (!response.ok) throw new ApiError(json);

  return json;
}
