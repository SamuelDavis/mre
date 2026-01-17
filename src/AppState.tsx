import { persist } from "@samueldavis/solidlib";
import { useSearchParams } from "@solidjs/router";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";

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
    (value: string) => setAppState(produce((state) => (state.q = value))),
  ] as const;
}

export function useSearchQuery(): [() => string, (value?: string) => void] {
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

  return [get, set];
}
