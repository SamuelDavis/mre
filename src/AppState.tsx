import { isFunction, persist } from "@samueldavis/solidlib";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import {
  createMapLike,
  createSetLike,
  type Credit,
  type Edge,
  type Person,
  type TvSeries,
} from "./Types";
import type {
  PeopleTVCreditsResponse,
  PersonId,
  SearchTVResponse,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./Types/TMDB";
import { request } from "./util";

type AppState = {
  apiKey: string;
  list: Partial<TvSeries["id"][]>;
  people: Partial<Record<Person["id"], Person>>;
  tvSeries: Partial<Record<TvSeries["id"], TvSeries>>;
  credits: Partial<Record<Credit["id"], Credit>>;
  edges: Partial<Record<Edge["id"], Edge>>;
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore<AppState>({
      apiKey: "",
      list: [],
      people: {},
      tvSeries: {},
      credits: {},
      edges: {},
    }),
    { key: "mre" },
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

export function useList() {
  const [state, setState] = useAppState();
  return createSetLike([
    () => state.list,
    (list) =>
      setState(
        produce(
          (state) => (state.list = isFunction(list) ? list(state.list) : list),
        ),
      ),
  ]);
}

export function usePeople() {
  const [state, setState] = useAppState();
  return createMapLike(
    [
      () => state.people,
      (people) =>
        setState(
          produce(
            (state) =>
              (state.people = isFunction(people)
                ? people(state.people)
                : people),
          ),
        ),
    ],
    (item) => item.id,
  );
}

export function useCredits() {
  const [state, setState] = useAppState();
  return createMapLike(
    [
      () => state.credits,
      (credits) =>
        setState(
          produce(
            (state) =>
              (state.credits = isFunction(credits)
                ? credits(state.credits)
                : credits),
          ),
        ),
    ],
    (item) => item.id,
  );
}

export function useEdges() {
  const [state, setState] = useAppState();
  return createMapLike(
    [
      () => state.edges,
      (edges) =>
        setState(
          produce(
            (state) =>
              (state.edges = isFunction(edges) ? edges(state.edges) : edges),
          ),
        ),
    ],
    (item) => item.id,
  );
}

export function useTvSeries() {
  const [state, setState] = useAppState();
  return createMapLike(
    [
      () => state.tvSeries,
      (tvSeries) =>
        setState(
          produce(
            (state) =>
              (state.tvSeries = isFunction(tvSeries)
                ? tvSeries(state.tvSeries)
                : tvSeries),
          ),
        ),
    ],
    (item) => item.id,
  );
}

export function useApi() {
  const [appState] = useAppState();

  return {
    searchTV(query: string, init?: RequestInit): Promise<SearchTVResponse> {
      return request(appState.apiKey, "search/tv", { query }, init);
    },
    tvSeriesDetails(
      id: TVSeriesId,
      init?: RequestInit,
    ): Promise<TvSeriesDetailsResponse> {
      return request(
        appState.apiKey,
        `tv/${id}`,
        { append_to_response: "aggregate_credits" },
        init,
      );
    },
    personTvCredits(
      id: PersonId,
      init?: RequestInit,
    ): Promise<PeopleTVCreditsResponse> {
      return request(appState.apiKey, `person/${id}/tv_credits`, {}, init);
    },
  };
}
