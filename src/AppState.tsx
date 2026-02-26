import { persist } from "@samueldavis/solidlib";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import type { TVSeriesDetails } from "./types";

type AppState = {
  apiKey: string;
  list: TVSeriesDetails[];
  isInList(id: number): boolean;
  addToList(item: TVSeriesDetails): void;
  removeFromList(id: number): void;
  request<TRes = Record<string, unknown>>(
    path: string,
    params?: Record<string, string>,
  ): Promise<TRes>;
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore<AppState>({
      apiKey: "",
      list: [],
      isInList(id: number): boolean {
        return this.list.some((item) => item.id === id);
      },
      addToList(item: TVSeriesDetails): void {
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
      async request<TRes = Record<string, unknown>>(
        path: string,
        params?: Record<string, string>,
      ): Promise<TRes> {
        const [appState] = useAppState();
        const url = new URL(`https://api.themoviedb.org/3/${path}`);
        if (params)
          for (const key in params) url.searchParams.set(key, params[key]);

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${appState.apiKey}` },
        });
        const data = await res.json();

        if (res.status !== 200 || data.success === false)
          throw new Error(
            (data.status_message ?? res.statusText) || "Something went wrong.",
            { cause: data },
          );

        return data;
      },
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
