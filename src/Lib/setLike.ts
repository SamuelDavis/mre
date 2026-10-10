import type { Signal } from "solid-js";

export type SetLike<T> = {
  has(item: T): boolean;
  add(item: T): void;
  del(item: T): void;
  toggle(item: T): void;
  arr(): T[];
};

export function createSetLike<T>([get, set]: Signal<T[]>): SetLike<T> {
  function has(item: T): boolean {
    return get().includes(item);
  }

  function add(item: T): void {
    set((items) => (items.includes(item) ? items : [...items, item]));
  }

  function del(item: T): void {
    set((items) => items.filter((existing) => existing !== item));
  }

  function toggle(item: T): void {
    if (has(item)) del(item);
    else add(item);
  }

  return { has, add, del, toggle, arr: get };
}
