import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export function createPersistentSignal<T>(
  options: {
    key: string;
    reviver: T | ((value: string | null) => T);
  } & Parameters<typeof createSignal>[1],
): ReturnType<typeof createSignal<T>> {
  const { key, reviver, ...opts } = options;
  const stored = localStorage.getItem(key);
  const value =
    reviver instanceof Function
      ? reviver(stored)
      : (JSON.parse(stored ?? "null") ?? reviver);
  const signal = createSignal<T>(value, opts);
  createEffect(() => {
    const value = signal[0]();
    return localStorage.setItem(key, JSON.stringify(value));
  });
  return signal;
}

export function createPersistentStore<T extends object>(
  options: {
    key: string;
    reviver: T | ((value: string | null) => T);
  } & Parameters<typeof createStore>[1],
): ReturnType<typeof createStore<T>> {
  const { key, reviver, ...opts } = options;
  const stored = localStorage.getItem(key);
  const value =
    reviver instanceof Function
      ? reviver(stored)
      : (JSON.parse(stored ?? "null") ?? reviver);
  const store = createStore<T>(value, opts);
  createEffect(() => localStorage.setItem(key, JSON.stringify(store[0])));
  return store;
}
