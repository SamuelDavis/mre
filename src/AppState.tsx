import { persist } from "@samueldavis/solidlib";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import type { AppTVSeriesDetails } from "./Types";
import type {
  Job,
  PeopleTVCreditsResponse,
  PersonId,
  SearchTVResponse,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./Types/TMDB";
import { request } from "./util";

type AppState = {
  apiKey: string;
  list: AppTVSeriesDetails[];
  isInList(id: TVSeriesId): boolean;
  addToList(item: AppTVSeriesDetails): void;
  removeFromList(id: TVSeriesId): void;
  get filters(): {
    castOrderLimit: number;
    crewJobs: Job[];
  };
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore(
      Object.defineProperty<AppState>(
        {
          apiKey: "",
          list: [],
          isInList(id: number): boolean {
            return this.list.some((item) => item.id === id);
          },
          addToList(item: AppTVSeriesDetails): void {
            setAppState(
              produce((state) => {
                state.list.push(item);
              }),
            );
          },
          removeFromList(id: number): void {
            setAppState(
              produce((state) => {
                state.list = state.list.filter((item) => item.id !== id);
              }),
            );
          },
          get filters(): AppState["filters"] {
            return {
              castOrderLimit: 3,
              crewJobs: [
                "Creator",
                "Producer",
                "Editor",
                "Storyboard",
                "Director",
                "Co-Director",
                "Executive Producer",
              ],
            };
          },
        },
        "filters",
        { enumerable: false },
      ),
    ),
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

export function useApi() {
  const [appState] = useAppState();

  return {
    searchTV(query: string): Promise<SearchTVResponse> {
      return request(appState.apiKey, "search/tv", { query });
    },
    tvSeriesDetails(id: TVSeriesId): Promise<TvSeriesDetailsResponse> {
      return request(appState.apiKey, `tv/${id}`, {
        append_to_response: "aggregate_credits",
      });
    },
    personDetails(id: PersonId): Promise<PeopleTVCreditsResponse> {
      return request(appState.apiKey, `person/${id}/tv_credits`);
    },
  };
}
