import { persist } from "@samueldavis/solidlib";
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

type AppState = {
  apiKey: string;
};

type AppStateContextValue = [AppState, SetStoreFunction<AppState>];
const AppStateContext = createContext<AppStateContextValue>();

export function AppStateProvider(props: ParentProps) {
  const [appState, setAppState] = persist(
    createStore<AppState>({ apiKey: "" }),
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
