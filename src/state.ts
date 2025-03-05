import { type Accessor, type Setter, createRoot } from "solid-js";
import type { Cast, Crew, SearchTvResult, TvSeriesDetails } from "./types";
import { createPersistentSignal, createPersistentStore } from "./utilities";

export const httpCache = createRoot(() => {
  const [getApiKey, setApiKey] = createPersistentSignal({
    key: "api-key",
    reviver: "",
  });
  const [requestPathResponseMap, setRequests] = createPersistentStore<
    Record<string, unknown>
  >({ key: "requests", reviver: {} });

  function setRequest(path: string, value: unknown): void {
    setRequests((requests) => ({ ...requests, [path]: value }));
  }

  function getRequest(path: string) {
    return requestPathResponseMap[path];
  }

  return { getApiKey, setApiKey, getRequest, setRequest };
});

export const tvList = createRoot(() => {
  const [get, set] = createPersistentSignal<SearchTvResult["id"][]>({
    key: "tv-list",
    reviver: [],
  });

  function add(id: SearchTvResult["id"]): void {
    set((list) => (list.includes(id) ? list : [...list, id]));
  }

  function remove(id: SearchTvResult["id"]): void {
    set((list) => {
      const index = list.indexOf(id);
      return index in list
        ? [...list.slice(0, index), ...list.slice(index + 1)]
        : list;
    });
  }

  function has(id: SearchTvResult["id"]): boolean {
    return get().includes(id);
  }

  return { add, remove, has, get };
});

export const tvSeries = createRoot(() => {
  type TvSeries = Omit<TvSeriesDetails, "created_by">;
  const [get, set] = createPersistentSignal<TvSeries[]>({
    key: "tv-series",
    reviver: [],
  });

  function add(series: TvSeries): void {
    set((existing) => {
      return existing.some((existing) => existing.id === series.id)
        ? existing
        : [...existing, series];
    });
  }

  function getById(id: TvSeriesDetails["id"]) {
    return get().find((item) => item.id === id);
  }

  return { add, get, getById };
});

export const tvCast = createRoot(() => {
  type TvCast = Cast & { series_id: TvSeriesDetails["id"] };
  const [get, set] = createPersistentSignal<TvCast[]>({
    key: "tv-cast",
    reviver: [],
  });

  function add(id: TvSeriesDetails["id"], people: Cast[]): void {
    addPeople(id, people, set);
  }

  function getBySeries(series: Pick<TvSeriesDetails, "id">) {
    return getPeople(series.id, get);
  }

  function getById(id: TvCast["id"]) {
    return get().find((person) => person.id === id);
  }

  return { add, getBySeries, getById };
});

export const tvCrew = createRoot(() => {
  type TvCrew = Crew & { series_id: TvSeriesDetails["id"] };
  const [get, set] = createPersistentSignal<TvCrew[]>({
    key: "tv-crew",
    reviver: [],
  });

  function add(id: TvSeriesDetails["id"], people: Crew[]): void {
    addPeople(id, people, set);
  }

  function getBySeries(series: Pick<TvSeriesDetails, "id">) {
    return getPeople(series.id, get);
  }

  function getById(id: TvCrew["id"]) {
    return get().find((person) => person.id === id);
  }

  return { add, getBySeries, getById };
});

function getPeople<T extends { series_id: TvSeriesDetails["id"] }>(
  series_id: TvSeriesDetails["id"],
  get: Accessor<T[]>,
): T[] {
  return get().filter((person) => person.series_id === series_id);
}

function addPeople<T extends Cast | Crew>(
  id: TvSeriesDetails["id"],
  people: T[],
  set: Setter<(T & { series_id: TvSeriesDetails["id"] })[]>,
): void {
  set((members) => {
    const toAdd = people
      .filter(
        (person) =>
          !members.some(
            (member) => member.id === person.id && member.series_id === id,
          ),
      )
      .map((person) => ({ ...person, series_id: id }));
    return toAdd.length === 0 ? members : [...members, ...toAdd];
  });
}
