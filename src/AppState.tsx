import { persist } from "@samueldavis/solidlib";
import {
  createContext,
  type JSX,
  useContext,
  type ParentProps,
  type Signal,
  createSignal,
} from "solid-js";
import { createSetLike, type SetLike } from "./Types";
import type {
  CreditId,
  CreditsDetailsResponse,
  PeopleDetailsResponse,
  PersonId,
  SearchTVResponse,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./Types/TMDB";
import { tmdbRequest } from "./util";

type AppState = {
  apiKey: Signal<string>;
  list: SetLike<TVSeriesId>;
};

const AppStateContext = createContext<AppState>();

export function AppStateProvider(props: ParentProps) {
  const apiKey = persist(createSignal(""), { key: "api-key" });
  const list = persist(createSignal<TVSeriesId[]>([]), { key: "list" });

  return (
    <AppStateContext.Provider value={{ apiKey, list: createSetLike(list) }}>
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

export function useList() {
  return useAppState().list;
}

export function useApi() {
  const [getApiKey] = useAppState().apiKey;

  const authorize = (init?: RequestInit): RequestInit => ({
    ...(init ?? {}),
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...(init?.headers ?? {}),
    },
  });

  return {
    searchTV(query: string, init: RequestInit = {}): Promise<SearchTVResponse> {
      return tmdbRequest(authorize(init), "search/tv", { query });
    },
    tvSeriesDetails(
      id: TVSeriesId,
      init: RequestInit = {},
    ): Promise<TvSeriesDetailsResponse> {
      return tmdbRequest(authorize(init), `tv/${id}`, {
        append_to_response: "aggregate_credits",
      });
    },
    personDetails(
      id: PersonId,
      init: RequestInit = {},
    ): Promise<PeopleDetailsResponse> {
      return tmdbRequest(authorize(init), `person/${id}`, {
        append_to_response: "tv_credits",
      });
    },
    creditDetails(
      id: CreditId,
      init: RequestInit = {},
    ): Promise<CreditsDetailsResponse> {
      return tmdbRequest(authorize(init), `credit/${id}`);
    },
  };
}

export function useDocumentStyles() {
  return <K extends keyof JSX.CSSProperties>(
    value: K,
  ): JSX.CSSProperties[K] | any =>
    getComputedStyle(document.documentElement).getPropertyValue(value) as any;
}
