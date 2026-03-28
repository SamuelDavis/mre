export * from "./TMDB";

import { isNonNullable, type Signal } from "@samueldavis/solidlib";
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
import type { NodeDataDefinition } from "cytoscape";

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

export function createSetLike<T>([get, set]: Signal<T[]>): SetLike<T> {
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

const castOrderLimit: number = 1 as const;
const interestingJobs: Job[] = [
  // "Creator",
  "Writer",
  "Director",
  // "Storyboard",
  // "Producer",
  // "Editor",
  // "Co-Director",
  // "Executive Producer",
] as const;

export function isInterestingCast(credit: { order: number }): boolean {
  return credit.order <= castOrderLimit;
}

export function isInterestingCrew(credit: { job: Job }): boolean {
  return interestingJobs.includes(credit.job);
}

export type Node = {
  data(): NodeDataDefinition;
  data<K extends keyof NodeDataDefinition>(key: K): NodeDataDefinition[K];
};
