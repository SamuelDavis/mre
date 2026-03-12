export * from "./TMDB";

import { isKeyed, isNonNullable, type Signal } from "@samueldavis/solidlib";
import type {
  CreditId,
  DateString,
  Department,
  Genre,
  ImgPath,
  Job,
  PersonId,
  SearchTVResponseResult,
  TvSeriesDetailsResponse,
  TVSeriesId,
} from "./TMDB";
import type { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";

export type MapLike<K extends PropertyKey, T> = {
  has(id: K): boolean;
  get(id: K): undefined | T;
  set(item: T): T;
  del(id: K): undefined | T;
  arr(): NonNullable<T>[];
};

export function createMapLike<K extends PropertyKey, T>(
  [read, write]: Signal<Partial<Record<K, T>>>,
  identity: (item: T) => K,
): MapLike<K, T> {
  return {
    has(id) {
      return id in read();
    },
    get(id) {
      return read()[id];
    },
    set(item) {
      write((state) => ({ ...state, [identity(item)]: item }));
      return item;
    },
    del(id) {
      const item = read()[id];
      write((state) => {
        const next = { ...state };
        delete next[id];
        return next;
      });
      return item;
    },
    arr() {
      return Object.values(read());
    },
  };
}

export type SetLike<T> = {
  has(item: T): boolean;
  add(item: T): void;
  del(item: T): void;
  arr(): NonNullable<T>[];
};

export function createSetLike<T extends PropertyKey>([get, set]: Signal<
  Partial<T[]>
>): SetLike<T> {
  return {
    has(item) {
      return get().includes(item);
    },
    add(item) {
      set((items) => {
        return items.includes(item) ? items : [...items, item];
      });
    },
    del(item) {
      set((items) => items.filter((existing) => existing !== item));
    },
    arr() {
      return get().filter(isNonNullable);
    },
  };
}

export type Person = {
  id: PersonId;
  name: string;
  profile_path: ImgPath;
};
export type TvSeries = {
  id: TVSeriesId;
  name: string;
  original_name: string;
  poster_path: ImgPath;
  first_air_date: DateString;
  overview: string;
  tagline: string;
  genre_ids: Genre["id"][];
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
