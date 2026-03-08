export * from "./TMDB";

import { isKeyed } from "@samueldavis/solidlib";
import type {
  CreditId,
  Department,
  ImgPath,
  Job,
  PersonId,
  SearchTVResponseResult,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./TMDB";
import type { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";
import { createStore, produce } from "solid-js/store";

export type MapLike<T extends { id: PropertyKey }> = {
  has(id: T["id"]): boolean;
  get(id: T["id"]): undefined | T;
  set(item: T): T;
  del(id: T["id"]): undefined | T;
  arr(): T[];
};

export function createMapLike<
  K extends PropertyKey,
  T extends { id: K },
>(): ReturnType<
  typeof createStore<{ items: Partial<Record<T["id"], T>> } & MapLike<T>>
> {
  const [state, setState] = createStore<
    { items: Partial<Record<T["id"], T>> } & MapLike<T>
  >({
    items: {},
    has(id) {
      return id in this.items;
    },
    get(id) {
      return this.items[id];
    },
    set(item) {
      setState(
        produce((state) => {
          state.items[item.id] = item;
        }),
      );
      return item;
    },
    del(id) {
      let item = this.get(id);
      setState(
        produce((state) => {
          delete state.items[id];
        }),
      );
      return item;
    },
    arr() {
      return Object.values(this.items);
    },
  });
  return [state, setState];
}

export type SetLike<T extends PropertyKey> = {
  has(item: T): boolean;
  add(item: T): void;
  del(item: T): void;
  arr(): T[];
};

export function createSetLike<T extends PropertyKey>(): ReturnType<
  typeof createStore<{ items: T[] } & SetLike<T>>
> {
  const [state, setState] = createStore<{ items: T[] } & SetLike<T>>({
    items: [],
    has(id) {
      return this.items.includes(id);
    },
    add(id) {
      setState(
        produce((state) => {
          if (!this.has(id)) state.items.push(id);
        }),
      );
    },
    del(id) {
      setState(
        produce(
          (state) => (state.items = state.items.filter((item) => item !== id)),
        ),
      );
    },
    arr() {
      return this.items;
    },
  });
  return [state, setState];
}

export type Person = {
  id: PersonId;
  name: string;
  profile_path: ImgPath;
};
export type TvSeries = {
  id: TVSeriesId;
  name: string;
  poster_path: ImgPath;
};
export type Credit<D extends Department = Department> = {
  id: CreditId;
  department: D;
  job: Job<D>;
};
export type Edge = {
  id: CreditId;
  tvSeriesId: TVSeriesId;
  personId: PersonId;
  creditId: CreditId;
};

export type AppTvSeriesSearch = Pick<
  SearchTVResponseResult,
  | "genre_ids"
  | "id"
  | "name"
  | "original_name"
  | "first_air_date"
  | "overview"
  | "poster_path"
>;

export type AppTVSeriesDetails = Pick<
  TvSeriesDetailsResponse,
  | "created_by"
  | "genres"
  | "tagline"
  | "id"
  | "name"
  | "original_name"
  | "first_air_date"
  | "overview"
  | "poster_path"
  | "aggregate_credits"
>;

const castOrderLimit: number = 3 as const;
const interestingJobs: Job[] = [
  "Creator",
  "Producer",
  "Editor",
  "Storyboard",
  "Director",
  "Co-Director",
  "Executive Producer",
] as const;

export function isInterestingCast(
  credit: { order: number } | { episode_count: number },
): boolean {
  return (
    (isKeyed(credit, "order") ? credit.order : credit.episode_count) <
    castOrderLimit
  );
}

export function isInterestingCrew(credit: { job: Job }): boolean {
  return interestingJobs.includes(credit.job);
}

export type PersonData = NodeDataDefinition & {
  type: "person";
  id: `person:${PersonId}`;
  label: string;
  img: ImgPath;
};
export type SeriesData = NodeDataDefinition & {
  type: "series";
  id: `series:${TVSeriesId}`;
  label: string;
  img: ImgPath;
};
export type CreditData = EdgeDataDefinition & {
  type: "credit";
  id: `credit:${CreditId}`;
  label: string;
  job: Job;
  department: Department;
  img: ImgPath;
};
export type NodeData = PersonData | SeriesData | CreditData;
export type Node<T extends NodeData = NodeData> = {
  data(): T;
  data<K extends keyof T>(key: K): T[K];
};
