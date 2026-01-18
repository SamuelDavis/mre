import { persist } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import { ApiError, type MediaCredit, type MediaItem } from "./types";

type AppState = {
  apiKey: string;
  q?: string;
  list: MediaItem[];
  credits: MediaCredit[];
  listCreditMap: Record<MediaItem["id"], MediaCredit["id"][]>;
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore<AppState>({
      apiKey: "",
      list: [],
      credits: [],
      listCreditMap: {},
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
  return async function <T extends Record<string, any>>(
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
  };
}

export function useList() {
  const [appState, setAppState] = useAppState();
  const get = () => appState.list;
  const has = (value: MediaItem["id"]) =>
    appState.list.some((item) => item.id === value);
  const add = (value: MediaItem, credits: MediaCredit[]) =>
    setAppState(
      produce((state) => {
        if (!state.list.some((item) => item.id === value.id))
          state.list = [...state.list, value];
        if (!(value.id in state.listCreditMap))
          state.listCreditMap[value.id] = [];
        for (const credit of credits) {
          if (
            !state.credits.some((item) => item.credit_id === credit.credit_id)
          )
            state.credits.push(credit);
          if (!state.listCreditMap[value.id].includes(credit.credit_id))
            state.listCreditMap[value.id].push(credit.credit_id);
        }
      }),
    );
  const del = (value: MediaItem["id"]) =>
    setAppState(
      produce((state) => {
        const index = state.list.findIndex((item) => item.id === value);
        if (index >= 0)
          state.list = [
            ...state.list.slice(0, index),
            ...state.list.slice(index + 1),
          ];

        const { [value]: creditIds, ...listCreditMap } = state.listCreditMap;
        state.listCreditMap = listCreditMap;
        state.credits = state.credits.filter((item) =>
          creditIds.includes(item.credit_id),
        );
      }),
    );
  return { get, has, add, del } as const;
}

export function useCredits(mediaId: MediaItem["id"]) {
  const [appState] = useAppState();
  const creditIds = appState.listCreditMap[mediaId] ?? [];
  return appState.credits.filter((item) => creditIds.includes(item.credit_id));
}
