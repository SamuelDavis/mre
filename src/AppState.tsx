import { isArray, persist } from "@samueldavis/solidlib";
import {
  createContext,
  createSignal,
  useContext,
  type ParentProps,
  type Signal,
} from "solid-js";
import { createCrawl, type Crawl } from "./Lib/crawl";
import { defaultSettings, isMediaKey, type Settings } from "./Lib/model";
import { createSetLike, type SetLike } from "./Lib/setLike";
import { createTmdb, type Tmdb } from "./Lib/tmdb";
import type { MediaKey } from "./Types/TMDB";

type AppState = {
  apiKey: Signal<string>;
  list: SetLike<MediaKey>;
  settings: Signal<Settings>;
  tmdb: Tmdb;
  crawl: Crawl;
};

const AppStateContext = createContext<AppState>();

export function AppStateProvider(props: ParentProps) {
  const apiKey = persist(createSignal(""), { key: "api-key" });
  const list = createSetLike(
    persist(createSignal<MediaKey[]>([]), { key: "list", decode: decodeList }),
  );
  const settings = persist(createSignal(defaultSettings), {
    key: "settings",
    decode: decodeSettings,
  });
  const tmdb = createTmdb(apiKey[0]);
  const getEnabled = () => apiKey[0]() !== "";
  const crawl = createCrawl({
    tmdb,
    getEnabled,
    getList: list.arr,
    getSettings: settings[0],
  });

  return (
    <AppStateContext.Provider value={{ apiKey, list, settings, tmdb, crawl }}>
      {props.children}
    </AppStateContext.Provider>
  );
}

function decodeList(value: string): MediaKey[] {
  const parsed: unknown = JSON.parse(value);
  return isArray(parsed) ? parsed.filter(isMediaKey) : [];
}

function decodeSettings(value: string): Settings {
  return { ...defaultSettings, ...JSON.parse(value) };
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}

export function useApiKey(): AppState["apiKey"] {
  return useAppState().apiKey;
}

export function useList(): AppState["list"] {
  return useAppState().list;
}

export function useSettings(): AppState["settings"] {
  return useAppState().settings;
}

export function useTmdb(): AppState["tmdb"] {
  return useAppState().tmdb;
}

export function useCrawl(): AppState["crawl"] {
  return useAppState().crawl;
}
