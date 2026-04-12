export * from "./TMDB";
export * from "./Cyto";

import { isNonNullable, type Signal } from "@samueldavis/solidlib";

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
